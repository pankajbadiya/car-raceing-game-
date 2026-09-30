import * as THREE from 'three';
import { CarSpec, RaceState } from '../types/game';
import { trackInstance, ROAD_WIDTH } from './TrackData';
import { audioManager } from './AudioManager';

export interface VehicleInputs {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  nitro: boolean;
  handbrake: boolean;
}

export class CarPhysics {
  public spec: CarSpec;

  // Transform
  public position = new THREE.Vector3(0, 0.4, 0);
  public velocity = new THREE.Vector3(0, 0, 0);
  public quaternion = new THREE.Quaternion();
  public forward = new THREE.Vector3(0, 0, -1);
  public up = new THREE.Vector3(0, 1, 0);
  public right = new THREE.Vector3(1, 0, 0);

  // Dynamics
  public speedKmh = 0; // forward speed in km/h
  public steerAngle = 0; // -1 (left) to 1 (right)
  public targetSteer = 0;
  public nitroPercent = 100;
  public isNitroActive = false;
  public isDrifting = false;
  public driftAngle = 0; // angle between heading and velocity
  public rpm = 1000;
  public gear = 1;

  // Collision state
  public impactShake = 0;
  public justCollided = false;
  public sparkPoint: THREE.Vector3 | null = null;

  // Track progress
  public distanceAlongTrack = 0;
  public currentLap = 1;
  public lapProgress = 0; // 0 to 1
  public totalDistanceTraveled = 0;

  // Bounding radius for collision
  public readonly collisionRadius = 1.4;

  constructor(spec: CarSpec, startDistance = 0, lateralOffset = 0) {
    this.spec = spec;
    this.reset(startDistance, lateralOffset);
  }

  public reset(startDist = 0, lateralOffset = 0) {
    this.distanceAlongTrack = startDist;
    this.totalDistanceTraveled = startDist;
    this.currentLap = 1;
    this.speedKmh = 0;
    this.steerAngle = 0;
    this.targetSteer = 0;
    this.nitroPercent = 100;
    this.isNitroActive = false;
    this.isDrifting = false;
    this.driftAngle = 0;
    this.velocity.set(0, 0, 0);
    this.impactShake = 0;

    const sample = trackInstance.getSampleAtDistance(startDist);
    this.position.copy(sample.point);
    this.position.addScaledVector(sample.binormal, lateralOffset);
    this.position.y += 0.45;

    this.forward.copy(sample.tangent);
    this.up.copy(sample.normal);
    this.right.crossVectors(this.forward, this.up).normalize();

    const m = new THREE.Matrix4().makeBasis(this.right, this.up, this.forward.clone().negate());
    this.quaternion.setFromRotationMatrix(m);
  }

  public update(dt: number, inputs: VehicleInputs, canControl = true): void {
    const clampedDt = Math.min(dt, 0.05);

    // Fade impact shake
    if (this.impactShake > 0) {
      this.impactShake = Math.max(0, this.impactShake - clampedDt * 4);
    }
    this.justCollided = false;
    this.sparkPoint = null;

    // 1. Process Nitro
    const wantsNitro = inputs.nitro && this.nitroPercent > 5 && canControl && inputs.forward;
    if (wantsNitro) {
      this.isNitroActive = true;
      this.nitroPercent = Math.max(0, this.nitroPercent - clampedDt * 22);
    } else {
      this.isNitroActive = false;
      // Auto-regenerate nitro when not in use
      this.nitroPercent = Math.min(100, this.nitroPercent + clampedDt * 9);
    }

    // 2. Throttle & Acceleration
    let throttle = 0;
    if (canControl) {
      if (inputs.forward) throttle += 1;
      if (inputs.backward) throttle -= 0.8;
    }

    const currentSpeedMs = this.speedKmh / 3.6;
    const maxSpeedKmh = this.isNitroActive ? this.spec.topSpeedKmh * 1.25 : this.spec.topSpeedKmh;
    const maxSpeedMs = maxSpeedKmh / 3.6;

    let forwardAccel = 0;
    if (throttle > 0) {
      const speedRatio = Math.max(0, Math.min(1, currentSpeedMs / maxSpeedMs));
      // Torque curve: stronger torque at lower gears/speeds
      const torqueFactor = Math.max(0.25, 1 - Math.pow(speedRatio, 1.8));
      const nitroBoost = this.isNitroActive ? 1.7 : 1.0;
      forwardAccel = this.spec.accelRate * throttle * torqueFactor * nitroBoost;
    } else if (throttle < 0) {
      // Braking or reverse
      if (currentSpeedMs > 1) {
        // Active braking
        forwardAccel = -this.spec.accelRate * 1.5;
      } else {
        // Reverse
        forwardAccel = -this.spec.accelRate * 0.45;
      }
    }

    // 3. Rolling resistance & Aerodynamic Drag
    const rollingResistance = 1.8;
    const dragCoeff = 0.0035;
    const dragForce = Math.sign(currentSpeedMs) * (rollingResistance + dragCoeff * currentSpeedMs * currentSpeedMs);

    let newSpeedMs = currentSpeedMs + (forwardAccel - dragForce) * clampedDt;

    // Natural decel if no throttle
    if (throttle === 0 && Math.abs(currentSpeedMs) > 0.05) {
      newSpeedMs *= Math.pow(0.97, clampedDt * 60);
    }

    // Reverse speed clamp
    if (newSpeedMs < -15) newSpeedMs = -15;
    // Max forward clamp
    if (newSpeedMs > maxSpeedMs) newSpeedMs = maxSpeedMs;

    this.speedKmh = newSpeedMs * 3.6;

    // 4. Steering and Drifting Dynamics
    let steerInput = 0;
    if (canControl) {
      if (inputs.left) steerInput -= 1;
      if (inputs.right) steerInput += 1;
    }

    // High speed reduces max steer lock for stability
    const speedRatioForSteer = Math.min(1, Math.abs(this.speedKmh) / 180);
    const effectiveSteerMax = 1.0 - speedRatioForSteer * 0.45;

    this.targetSteer = steerInput * effectiveSteerMax;
    // Responsive smooth steer interpolation
    this.steerAngle += (this.targetSteer - this.steerAngle) * clampedDt * this.spec.steerRate * 4;

    // Drift trigger: hard steering at speed or handbrake
    const isHardSteering = Math.abs(this.steerAngle) > 0.5 && this.speedKmh > 70;
    const isHandbrake = inputs.handbrake && this.speedKmh > 40;
    this.isDrifting = (isHardSteering || isHandbrake) && Math.abs(steerInput) > 0.3;

    // Yaw rotation rate
    const steerDirection = Math.sign(newSpeedMs) >= 0 ? 1 : -1;
    const driftBonus = this.isDrifting ? 1.6 : 1.0;
    const yawRate = -this.steerAngle * (this.spec.handling / 100) * 2.2 * steerDirection * driftBonus;

    // Apply yaw to forward vector
    const yawDelta = yawRate * clampedDt * (Math.abs(this.speedKmh) / 80);
    const yawQuat = new THREE.Quaternion().setFromAxisAngle(this.up, yawDelta);
    this.forward.applyQuaternion(yawQuat).normalize();
    this.right.crossVectors(this.forward, this.up).normalize();

    // 5. Position integration with track surface alignment
    const moveStep = this.forward.clone().multiplyScalar(newSpeedMs * clampedDt);

    // Drift slide vector (sideways slide momentum)
    if (this.isDrifting) {
      const slideDir = Math.sign(this.steerAngle);
      const slideSpeed = Math.abs(newSpeedMs) * 0.35 * this.spec.driftFactor;
      moveStep.addScaledVector(this.right, -slideDir * slideSpeed * clampedDt);
    }

    this.position.add(moveStep);

    // 6. Track constraint and lateral boundaries
    this.distanceAlongTrack = trackInstance.findClosestDistance(this.position, this.distanceAlongTrack);
    this.lapProgress = this.distanceAlongTrack / trackInstance.totalLength;

    const trackSample = trackInstance.getSampleAtDistance(this.distanceAlongTrack);

    // Project car onto track surface
    const toCar = this.position.clone().sub(trackSample.point);
    const lateralDist = toCar.dot(trackSample.binormal);

    // Check barrier collision (road edge)
    const barrierLimit = ROAD_WIDTH / 2 - 1.2;
    if (Math.abs(lateralDist) > barrierLimit) {
      // Barrier impact!
      const side = Math.sign(lateralDist);
      const clampedLateral = side * barrierLimit;

      // Position car back inside barrier
      this.position.copy(trackSample.point)
        .addScaledVector(trackSample.binormal, clampedLateral)
        .addScaledVector(trackSample.normal, 0.45);

      // Bounce impulse & speed loss
      this.speedKmh *= 0.72;
      this.impactShake = 0.8;
      this.justCollided = true;
      this.sparkPoint = this.position.clone().addScaledVector(trackSample.binormal, side * 0.5);

      // Bounce forward vector slightly inward
      this.forward.addScaledVector(trackSample.binormal, -side * 0.4).normalize();
      this.right.crossVectors(this.forward, this.up).normalize();

      audioManager.playCollision(0.8);
    } else {
      // Keep car on track height
      const targetY = trackSample.point.y + 0.45;
      this.position.y += (targetY - this.position.y) * clampedDt * 14;
    }

    // Smoothly align vehicle UP with track normal
    this.up.lerp(trackSample.normal, clampedDt * 8).normalize();
    this.right.crossVectors(this.forward, this.up).normalize();

    // Visual Drift roll/pitch
    const visualRight = this.right.clone();
    const visualForward = this.forward.clone();

    // Body roll when turning
    const rollAngle = -this.steerAngle * (this.speedKmh / 120) * 0.08;
    const rollQuat = new THREE.Quaternion().setFromAxisAngle(visualForward, rollAngle);

    const m = new THREE.Matrix4().makeBasis(visualRight, this.up, visualForward.clone().negate());
    this.quaternion.setFromRotationMatrix(m);
    this.quaternion.multiply(rollQuat);

    // 7. Simulated RPM and Gearing
    this.updateGears(newSpeedMs);
  }

  private updateGears(speedMs: number) {
    const absSpeed = Math.abs(speedMs * 3.6);
    const gearRatios = [0, 45, 85, 130, 180, 230, 320];

    let currentGear = 1;
    for (let g = 1; g < gearRatios.length; g++) {
      if (absSpeed >= gearRatios[g - 1]) {
        currentGear = g;
      }
    }
    this.gear = currentGear;

    const lowerSpeed = gearRatios[this.gear - 1];
    const upperSpeed = gearRatios[this.gear] || 320;
    const gearFraction = Math.max(0, Math.min(1, (absSpeed - lowerSpeed) / (upperSpeed - lowerSpeed)));

    this.rpm = 1500 + gearFraction * 6200;
  }
}
