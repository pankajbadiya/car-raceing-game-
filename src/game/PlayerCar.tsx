import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CarModel } from './CarModel';
import { CarPhysics } from './Physics';
import { gameState } from './GameState';
import { trackInstance } from './TrackData';
import { audioManager } from './AudioManager';
import { CarSpec } from '../types/game';

interface PlayerCarProps {
  carSpec: CarSpec;
  customColor?: string;
  isPaused?: boolean;
}

export const PlayerCar: React.FC<PlayerCarProps> = ({
  carSpec,
  customColor,
  isPaused = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const physicsRef = useRef<CarPhysics | null>(null);

  // Initialize physics on mount / spec change
  useEffect(() => {
    // Starting on grid: Player at lateral offset +4m, distance 0m
    physicsRef.current = new CarPhysics(carSpec, 0, 4);
    audioManager.startEngine();

    return () => {
      audioManager.stopEngine();
      audioManager.playNitro(false);
      audioManager.playDrift(false);
    };
  }, [carSpec]);

  // Main frame loop (60 FPS)
  useFrame((_, delta) => {
    if (isPaused || !physicsRef.current || !groupRef.current) return;

    const physics = physicsRef.current;
    const canControl = gameState.raceState.status === 'racing';
    const isCountdown = gameState.raceState.status === 'countdown';

    // 1. Update Physics
    // In countdown, allow revving RPM but lock movement
    if (isCountdown) {
      const isThrottling = gameState.inputs.forward;
      physics.rpm = isThrottling ? 6500 : 1200;
      audioManager.updateEngine(0, physics.rpm, isThrottling ? 1 : 0);
    } else {
      physics.update(delta, gameState.inputs, canControl);

      // Audio updates
      audioManager.updateEngine(
        physics.speedKmh,
        physics.rpm,
        gameState.inputs.forward ? 1 : 0
      );
      audioManager.playNitro(physics.isNitroActive);
      audioManager.playDrift(physics.isDrifting);

      // Race lap progress & finish detection
      const prevDist = physics.distanceAlongTrack;
      const trackLen = trackInstance.totalLength;

      // Checkpoint passing & lap crossing
      if (prevDist > trackLen - 50 && physics.distanceAlongTrack < 50) {
        // Crossed finish line!
        if (physics.currentLap <= gameState.raceState.totalLaps) {
          const lapTime = gameState.raceState.currentLapTime;
          if (
            gameState.raceState.bestLapTime === null ||
            lapTime < gameState.raceState.bestLapTime
          ) {
            gameState.raceState.bestLapTime = lapTime;
          }
          gameState.raceState.currentLapTime = 0;
          physics.currentLap++;
          gameState.raceState.lap = Math.min(physics.currentLap, gameState.raceState.totalLaps);
          audioManager.playCheckpoint();

          // Check if race finished
          if (physics.currentLap > gameState.raceState.totalLaps) {
            gameState.raceState.status = 'finished';
            const finalPos = gameState.raceState.position;
            const coinsEarned =
              finalPos === 1 ? 500 : finalPos === 2 ? 300 : finalPos === 3 ? 180 : 80;

            audioManager.playFinish(finalPos <= 3);

            if (gameState.onRaceFinish) {
              gameState.onRaceFinish({
                position: finalPos,
                totalTime: gameState.raceState.totalTime,
                bestLapTime: gameState.raceState.bestLapTime,
                score: Math.floor(gameState.raceState.driftScore + (4 - finalPos) * 1000),
                coinsEarned,
              });
            }
          }
        }
      }

      // Drift scoring
      if (physics.isDrifting && Math.abs(physics.speedKmh) > 40) {
        gameState.raceState.driftScore += Math.floor(delta * 120);
      }

      // Update positions
      physics.totalDistanceTraveled =
        (physics.currentLap - 1) * trackLen + physics.distanceAlongTrack;
      gameState.calculatePositions(physics.totalDistanceTraveled);
    }

    // 2. Collision checking with Opponents
    const playerPos = physics.position;
    for (const ai of gameState.opponents) {
      const aiPos = new THREE.Vector3(...ai.position);
      const dist = playerPos.distanceTo(aiPos);
      if (dist < 2.5) {
        // Collision!
        const pushDir = playerPos.clone().sub(aiPos).normalize();
        physics.position.addScaledVector(pushDir, 0.4);
        physics.speedKmh *= 0.8;
        physics.impactShake = 0.6;
        gameState.triggerCollisionSpark(playerPos.clone().lerp(aiPos, 0.5));
        audioManager.playCollision(0.7);
      }
    }

    // 3. Collision checking with Traffic
    for (const t of gameState.traffic) {
      const tPos = new THREE.Vector3(...t.position);
      const dist = playerPos.distanceTo(tPos);
      if (dist < 2.4) {
        // Collision with civilian car!
        const pushDir = playerPos.clone().sub(tPos).normalize();
        physics.position.addScaledVector(pushDir, 0.5);
        physics.speedKmh *= 0.6;
        physics.impactShake = 0.9;
        gameState.triggerCollisionSpark(playerPos.clone().lerp(tPos, 0.5));
        audioManager.playCollision(0.9);
      }
    }

    // 4. Update Group 3D Transform
    groupRef.current.position.copy(physics.position);
    groupRef.current.quaternion.copy(physics.quaternion);

    // 5. Expose Telemetry to GameState
    gameState.playerTransform.position = [physics.position.x, physics.position.y, physics.position.z];
    gameState.playerTransform.speed = physics.speedKmh;
    gameState.playerTransform.steerAngle = physics.steerAngle;
    gameState.playerTransform.isDrifting = physics.isDrifting;
    gameState.playerTransform.isNitro = physics.isNitroActive;
    gameState.playerTransform.isBraking = gameState.inputs.backward;

    gameState.playerPosVec.copy(physics.position);
    gameState.playerForwardVec.copy(physics.forward);
    gameState.playerQuat.copy(physics.quaternion);

    // Update race state stats
    gameState.raceState.speed = Math.floor(Math.abs(physics.speedKmh));
    gameState.raceState.rpm = Math.floor(physics.rpm);
    gameState.raceState.gear = physics.gear;
    gameState.raceState.nitroPercent = Math.floor(physics.nitroPercent);
    gameState.raceState.isNitroActive = physics.isNitroActive;
    gameState.raceState.isDrifting = physics.isDrifting;
    gameState.raceState.distanceAlongTrack = physics.distanceAlongTrack;

    if (canControl) {
      gameState.raceState.totalTime += delta;
      gameState.raceState.currentLapTime += delta;
    }
  });

  return (
    <group ref={groupRef}>
      <CarModel
        color={customColor || carSpec.defaultColor}
        steerAngle={physicsRef.current?.steerAngle || 0}
        wheelRotation={(physicsRef.current?.speedKmh || 0) / 10}
        isNitroActive={physicsRef.current?.isNitroActive || false}
        isBraking={gameState.inputs.backward}
        isHeadlightsOn={true}
        isPlayer={true}
        underglowColor="#06b6d4"
      />
    </group>
  );
};
