import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { gameState } from './GameState';

interface CameraFollowProps {
  distanceMode?: 'low_rear' | 'close' | 'normal' | 'far';
  isPaused?: boolean;
}

export const CameraFollow: React.FC<CameraFollowProps> = ({
  distanceMode = 'low_rear',
  isPaused = false,
}) => {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 3, 8));
  const currentLookAt = useRef(new THREE.Vector3(0, 1, 0));
  const currentFov = useRef(64);

  useFrame((_, delta) => {
    if (isPaused) return;

    const playerPos = gameState.playerPosVec;
    const playerForward = gameState.playerForwardVec;
    const isNitro = gameState.raceState.isNitroActive;
    const speedKmh = gameState.raceState.speed;

    // Configurable distance preset
    // 'low_rear' matches the user's reference photo: low slung close chase camera behind rear bumper
    const baseDist =
      distanceMode === 'low_rear'
        ? 5.8
        : distanceMode === 'close'
        ? 7.2
        : distanceMode === 'far'
        ? 11.5
        : 8.8;

    const baseHeight =
      distanceMode === 'low_rear'
        ? 1.95
        : distanceMode === 'close'
        ? 2.8
        : distanceMode === 'far'
        ? 4.6
        : 3.5;

    // Speed stretch: camera pulls back slightly at higher speeds & nitro
    const speedRatio = Math.min(1.0, speedKmh / 220);
    const speedLagDist = speedRatio * 1.5 + (isNitro ? 1.4 : 0);
    const totalDist = baseDist + speedLagDist;
    const totalHeight = baseHeight + (isNitro ? 0.2 : 0);

    // Target camera position: behind car in opposite direction of forward vector
    const targetCamPos = playerPos
      .clone()
      .addScaledVector(playerForward, -totalDist);
    targetCamPos.y = playerPos.y + totalHeight;

    // Camera Collision Shake
    let shakeOffset = new THREE.Vector3(0, 0, 0);
    if (gameState.sparks.length > 0) {
      const shakeMag = 0.45;
      shakeOffset.set(
        (Math.random() - 0.5) * shakeMag,
        (Math.random() - 0.5) * shakeMag,
        (Math.random() - 0.5) * shakeMag
      );
    } else if (isNitro) {
      shakeOffset.set(
        (Math.random() - 0.5) * 0.08,
        (Math.random() - 0.5) * 0.08,
        (Math.random() - 0.5) * 0.08
      );
    }
    targetCamPos.add(shakeOffset);

    // Smooth Lerp Position
    const lerpFactor = Math.min(1.0, delta * 10.5);
    currentPos.current.lerp(targetCamPos, lerpFactor);
    camera.position.copy(currentPos.current);

    // Target look-at point: down the road ahead of car
    const lookAheadDist = distanceMode === 'low_rear' ? 22 + speedRatio * 8 : 12 + speedRatio * 6;
    const targetLookAt = playerPos
      .clone()
      .addScaledVector(playerForward, lookAheadDist);
    targetLookAt.y = playerPos.y + (distanceMode === 'low_rear' ? 1.05 : 1.3);

    currentLookAt.current.lerp(targetLookAt, Math.min(1.0, delta * 14.0));
    camera.lookAt(currentLookAt.current);

    // Dynamic FOV widening for speed sensation
    const baseFov = distanceMode === 'low_rear' ? 66 : 60;
    const targetFov = isNitro ? baseFov + 14 : baseFov + speedRatio * 7;
    currentFov.current += (targetFov - currentFov.current) * delta * 5.0;

    if ('fov' in camera) {
      const pCam = camera as THREE.PerspectiveCamera;
      if (Math.abs(pCam.fov - currentFov.current) > 0.1) {
        pCam.fov = currentFov.current;
        pCam.updateProjectionMatrix();
      }
    }
  });

  return null;
};
