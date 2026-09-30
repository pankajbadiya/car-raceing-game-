import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CarModel } from './CarModel';
import { gameState, OpponentData } from './GameState';
import { trackInstance, ROAD_WIDTH } from './TrackData';

interface AICarProps {
  aiData: OpponentData;
  isPaused?: boolean;
}

export const AICar: React.FC<AICarProps> = ({ aiData, isPaused = false }) => {
  const groupRef = useRef<THREE.Group>(null);
  const currentLateralOffset = useRef(aiData.targetLaneOffset);
  const currentSpeed = useRef(0);
  const isNitro = useRef(false);
  const isBraking = useRef(false);
  const steerAngle = useRef(0);

  useFrame((_, delta) => {
    if (isPaused || !groupRef.current) return;

    const canDrive = gameState.raceState.status === 'racing';
    if (!canDrive) return;

    // AI Driving Logic
    const trackLen = trackInstance.totalLength;
    const currentDist = aiData.distanceAlongTrack;

    // 1. Curvature anticipation (sample track 30m ahead)
    const lookAheadDist = currentDist + 35;
    const currentSample = trackInstance.getSampleAtDistance(currentDist);
    const lookAheadSample = trackInstance.getSampleAtDistance(lookAheadDist);

    // Tangent dot product indicates track curve sharpness
    const turnSeverity = 1.0 - Math.max(0, currentSample.tangent.dot(lookAheadSample.tangent));
    const isSharpCurve = turnSeverity > 0.08;

    // 2. Target Speed calculation
    const baseTopSpeed = 200 * aiData.skillLevel;
    let targetSpeed = baseTopSpeed;

    if (isSharpCurve) {
      targetSpeed = 130 * aiData.skillLevel;
      isBraking.current = currentSpeed.current > targetSpeed + 10;
      isNitro.current = false;
    } else {
      isBraking.current = false;
      // Use nitro on straights if trailing or for excitement
      const roll = Math.random();
      if (turnSeverity < 0.02 && roll < 0.08 && currentSpeed.current > 150) {
        isNitro.current = true;
        targetSpeed = baseTopSpeed * 1.2;
      } else if (roll < 0.05) {
        isNitro.current = false;
      }
    }

    // 3. Acceleration / Deceleration
    const accelRate = 22 * aiData.skillLevel * (isNitro.current ? 1.5 : 1.0);
    const brakeRate = 35;

    if (currentSpeed.current < targetSpeed) {
      currentSpeed.current = Math.min(targetSpeed, currentSpeed.current + accelRate * delta);
    } else if (currentSpeed.current > targetSpeed) {
      currentSpeed.current = Math.max(targetSpeed, currentSpeed.current - brakeRate * delta);
    }

    // 4. Lane Selection and Overtaking
    // If approaching player from behind or approaching civilian traffic, change lane
    const playerDist = gameState.raceState.distanceAlongTrack;
    const distToPlayer = (playerDist - currentDist + trackLen) % trackLen;

    if (distToPlayer > 0 && distToPlayer < 20) {
      // Near player: shift lane to pass
      const playerPos = gameState.playerPosVec;
      const toPlayer = playerPos.clone().sub(currentSample.point);
      const playerLateral = toPlayer.dot(currentSample.binormal);
      // Pick opposite side of road
      aiData.targetLaneOffset = playerLateral > 0 ? -4.5 : 4.5;
    } else if (Math.random() < 0.005) {
      // Occasional natural lane wandering
      const lanes = [-5, -2, 2, 5];
      aiData.targetLaneOffset = lanes[Math.floor(Math.random() * lanes.length)];
    }

    // Smooth lateral transition
    const steerDiff = aiData.targetLaneOffset - currentLateralOffset.current;
    steerAngle.current = Math.max(-1, Math.min(1, steerDiff * 0.4));
    currentLateralOffset.current += steerDiff * delta * 2.0;

    // Clamp lateral bounds
    const maxLateral = ROAD_WIDTH / 2 - 1.5;
    currentLateralOffset.current = Math.max(-maxLateral, Math.min(maxLateral, currentLateralOffset.current));

    // 5. Advance along track
    const speedMs = currentSpeed.current / 3.6;
    aiData.distanceAlongTrack = (aiData.distanceAlongTrack + speedMs * delta) % trackLen;
    aiData.totalDistanceTraveled += speedMs * delta;
    aiData.speedKmh = currentSpeed.current;

    // Lap tracking for AI
    aiData.lap = Math.floor(aiData.totalDistanceTraveled / trackLen) + 1;

    // 6. Update 3D Transform on Track
    const newSample = trackInstance.getSampleAtDistance(aiData.distanceAlongTrack);
    const pos = newSample.point
      .clone()
      .addScaledVector(newSample.binormal, currentLateralOffset.current);
    pos.y += 0.45;

    // Forward direction slightly angled towards lane change
    const forward = newSample.tangent
      .clone()
      .addScaledVector(newSample.binormal, steerAngle.current * 0.15)
      .normalize();

    const up = newSample.normal;
    const right = new THREE.Vector3().crossVectors(forward, up).normalize();

    const m = new THREE.Matrix4().makeBasis(right, up, forward.negate());
    const q = new THREE.Quaternion().setFromRotationMatrix(m);

    groupRef.current.position.copy(pos);
    groupRef.current.quaternion.copy(q);

    // Save in aiData for collision checking
    aiData.position = [pos.x, pos.y, pos.z];
    aiData.quaternion = [q.x, q.y, q.z, q.w];
    aiData.steerAngle = steerAngle.current;
    aiData.isNitro = isNitro.current;
    aiData.isBraking = isBraking.current;
  });

  return (
    <group ref={groupRef}>
      <CarModel
        color={aiData.color}
        steerAngle={steerAngle.current}
        wheelRotation={currentSpeed.current / 10}
        isNitroActive={isNitro.current}
        isBraking={isBraking.current}
        isHeadlightsOn={true}
        underglowColor={aiData.color}
      />
    </group>
  );
};
