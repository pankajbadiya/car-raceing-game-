import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { gameState } from './GameState';

export const ParticleEffects: React.FC<{ rain?: boolean }> = ({ rain = false }) => {
  // Drift Smoke Particles
  const smokeCount = 40;
  const smokePoints = useRef<THREE.Points>(null);
  const smokeData = useMemo(() => {
    const pos = new Float32Array(smokeCount * 3);
    const life = new Float32Array(smokeCount);
    for (let i = 0; i < smokeCount; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = -100; // hidden initially
      pos[i * 3 + 2] = 0;
      life[i] = 0;
    }
    return { pos, life };
  }, []);

  // Sparks Particles
  const sparkCount = 60;
  const sparkPoints = useRef<THREE.Points>(null);
  const sparkData = useMemo(() => {
    const pos = new Float32Array(sparkCount * 3);
    const vel = new Float32Array(sparkCount * 3);
    const life = new Float32Array(sparkCount);
    for (let i = 0; i < sparkCount; i++) {
      pos[i * 3 + 1] = -100;
      life[i] = 0;
    }
    return { pos, vel, life };
  }, []);

  // Rain Particles
  const rainCount = 1200;
  const rainPoints = useRef<THREE.Points>(null);
  const rainPositions = useMemo(() => {
    const pos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = Math.random() * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    return pos;
  }, [rainCount]);

  useFrame((_, delta) => {
    const playerPos = gameState.playerPosVec;
    const isDrifting = gameState.playerTransform.isDrifting;

    // 1. Drift Smoke update
    if (smokePoints.current) {
      const posAttr = smokePoints.current.geometry.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;

      for (let i = 0; i < smokeCount; i++) {
        if (smokeData.life[i] > 0) {
          smokeData.life[i] -= delta * 2.5;
          positions[i * 3 + 1] += delta * 1.5; // rise up
          if (smokeData.life[i] <= 0) {
            positions[i * 3 + 1] = -100;
          }
        } else if (isDrifting && Math.random() < 0.25) {
          // Spawn new smoke puff at player rear tire
          smokeData.life[i] = 1.0;
          const side = Math.random() > 0.5 ? 0.8 : -0.8;
          positions[i * 3] = playerPos.x + (Math.random() - 0.5) * 0.4;
          positions[i * 3 + 1] = playerPos.y + 0.1;
          positions[i * 3 + 2] = playerPos.z + (Math.random() - 0.5) * 0.4;
        }
      }
      posAttr.needsUpdate = true;
    }

    // 2. Collision Sparks update
    // Check if new sparks were requested in gameState
    if (gameState.sparks.length > 0) {
      const activeSpark = gameState.sparks.pop()!;
      if (sparkPoints.current) {
        const posAttr = sparkPoints.current.geometry.attributes.position as THREE.BufferAttribute;
        const posArray = posAttr.array as Float32Array;

        for (let i = 0; i < 20; i++) {
          const idx = Math.floor(Math.random() * sparkCount);
          sparkData.life[idx] = 1.0;
          posArray[idx * 3] = activeSpark.pos.x;
          posArray[idx * 3 + 1] = activeSpark.pos.y + 0.3;
          posArray[idx * 3 + 2] = activeSpark.pos.z;

          sparkData.vel[idx * 3] = (Math.random() - 0.5) * 14;
          sparkData.vel[idx * 3 + 1] = 4 + Math.random() * 8;
          sparkData.vel[idx * 3 + 2] = (Math.random() - 0.5) * 14;
        }
        posAttr.needsUpdate = true;
      }
    }

    if (sparkPoints.current) {
      const posAttr = sparkPoints.current.geometry.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      for (let i = 0; i < sparkCount; i++) {
        if (sparkData.life[i] > 0) {
          sparkData.life[i] -= delta * 3.0;
          posArray[i * 3] += sparkData.vel[i * 3] * delta;
          posArray[i * 3 + 1] += sparkData.vel[i * 3 + 1] * delta;
          posArray[i * 3 + 2] += sparkData.vel[i * 3 + 2] * delta;
          sparkData.vel[i * 3 + 1] -= 9.8 * delta; // gravity
          if (sparkData.life[i] <= 0) {
            posArray[i * 3 + 1] = -100;
          }
        }
      }
      posAttr.needsUpdate = true;
    }

    // 3. Rain update
    if (rain && rainPoints.current) {
      const posAttr = rainPoints.current.geometry.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      for (let i = 0; i < rainCount; i++) {
        posArray[i * 3 + 1] -= delta * 45;
        if (posArray[i * 3 + 1] < 0) {
          posArray[i * 3 + 1] = 35 + Math.random() * 5;
          posArray[i * 3] = playerPos.x + (Math.random() - 0.5) * 80;
          posArray[i * 3 + 2] = playerPos.z + (Math.random() - 0.5) * 80;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Drift Smoke Points */}
      <points ref={smokePoints}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[smokeData.pos, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={1.6}
          color="#d1d5db"
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </points>

      {/* Collision Sparks Points */}
      <points ref={sparkPoints}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[sparkData.pos, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.6}
          color="#fbbf24"
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </points>

      {/* Rain Points */}
      {rain && (
        <points ref={rainPoints}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[rainPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.35}
            color="#93c5fd"
            transparent
            opacity={0.6}
            depthWrite={false}
          />
        </points>
      )}
    </group>
  );
};
