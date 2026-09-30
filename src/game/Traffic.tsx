import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { gameState, TrafficCarData } from './GameState';
import { trackInstance, ROAD_WIDTH } from './TrackData';

export const Traffic: React.FC<{ isPaused?: boolean }> = ({ isPaused = false }) => {
  return (
    <group>
      {gameState.traffic.map((car) => (
        <TrafficVehicle key={car.id} carData={car} isPaused={isPaused} />
      ))}
    </group>
  );
};

const TrafficVehicle: React.FC<{ carData: TrafficCarData; isPaused: boolean }> = ({
  carData,
  isPaused,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const currentLateral = useRef(carData.laneOffset);

  useFrame((_, delta) => {
    if (isPaused || !groupRef.current) return;

    const trackLen = trackInstance.totalLength;
    const playerDist = gameState.raceState.distanceAlongTrack;

    // 1. Advance along track
    const speedMs = carData.speedKmh / 3.6;
    carData.distanceAlongTrack = (carData.distanceAlongTrack + speedMs * delta) % trackLen;

    // 2. Recycle traffic when too far behind
    const relDist = (carData.distanceAlongTrack - playerDist + trackLen) % trackLen;
    // relDist: 0 to trackLen.
    // If between (trackLen - 120) and trackLen, it is 0-120m behind player.
    // When it falls > 120m behind, respawn it 160m - 280m ahead of player
    if (relDist > trackLen - 120 && relDist < trackLen - 60) {
      const respawnAhead = (playerDist + 160 + Math.random() * 120) % trackLen;
      carData.distanceAlongTrack = respawnAhead;
      const lanes = [-6, -2, 2, 6];
      carData.laneOffset = lanes[Math.floor(Math.random() * lanes.length)];
      carData.targetLaneOffset = carData.laneOffset;
      currentLateral.current = carData.laneOffset;
      carData.speedKmh = 65 + Math.random() * 30;
    }

    // 3. Occasional lane change
    if (Math.random() < 0.003) {
      const lanes = [-6, -2, 2, 6];
      carData.targetLaneOffset = lanes[Math.floor(Math.random() * lanes.length)];
    }

    // Smooth lateral change
    currentLateral.current += (carData.targetLaneOffset - currentLateral.current) * delta * 1.5;

    // 4. Update 3D Position
    const sample = trackInstance.getSampleAtDistance(carData.distanceAlongTrack);
    const pos = sample.point
      .clone()
      .addScaledVector(sample.binormal, currentLateral.current);
    pos.y += 0.42;

    const steerFactor = (carData.targetLaneOffset - currentLateral.current) * 0.1;
    const forward = sample.tangent
      .clone()
      .addScaledVector(sample.binormal, steerFactor)
      .normalize();

    const up = sample.normal;
    const right = new THREE.Vector3().crossVectors(forward, up).normalize();

    const m = new THREE.Matrix4().makeBasis(right, up, forward.negate());
    const q = new THREE.Quaternion().setFromRotationMatrix(m);

    groupRef.current.position.copy(pos);
    groupRef.current.quaternion.copy(q);

    // Save in telemetry
    carData.position = [pos.x, pos.y, pos.z];
    carData.quaternion = [q.x, q.y, q.z, q.w];
  });

  return (
    <group ref={groupRef}>
      {carData.modelType === 'taxi' ? (
        <TaxiModel />
      ) : carData.modelType === 'suv' ? (
        <SUVModel color={carData.color} />
      ) : (
        <SedanModel color={carData.color} />
      )}
    </group>
  );
};

// Civilian Sedan Model
const SedanModel: React.FC<{ color: string }> = ({ color }) => {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1.7, 0.35, 3.8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.55, -0.1]} castShadow>
        <boxGeometry args={[1.35, 0.38, 2.0]} />
        <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Headlights */}
      <mesh position={[-0.6, 0.25, -1.91]}>
        <boxGeometry args={[0.3, 0.1, 0.05]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.6, 0.25, -1.91]}>
        <boxGeometry args={[0.3, 0.1, 0.05]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
      </mesh>
      {/* Taillights */}
      <mesh position={[0, 0.28, 1.91]}>
        <boxGeometry args={[1.4, 0.08, 0.05]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
      </mesh>
      {/* Wheels */}
      <CivilianWheels width={1.65} length={2.4} />
    </group>
  );
};

// Civilian SUV Model
const SUVModel: React.FC<{ color: string }> = ({ color }) => {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[1.9, 0.5, 4.2]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.4} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.75, 0.2]} castShadow>
        <boxGeometry args={[1.5, 0.45, 2.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.7} />
      </mesh>
      {/* Roof rack */}
      <mesh position={[0, 1.02, 0.2]}>
        <boxGeometry args={[1.2, 0.06, 2.0]} />
        <meshStandardMaterial color="#030712" />
      </mesh>
      {/* Headlights */}
      <mesh position={[-0.65, 0.35, -2.11]}>
        <boxGeometry args={[0.35, 0.15, 0.05]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.5} />
      </mesh>
      <mesh position={[0.65, 0.35, -2.11]}>
        <boxGeometry args={[0.35, 0.15, 0.05]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.5} />
      </mesh>
      {/* Taillights */}
      <mesh position={[0, 0.4, 2.11]}>
        <boxGeometry args={[1.6, 0.12, 0.05]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.5} />
      </mesh>
      {/* Wheels */}
      <CivilianWheels width={1.85} length={2.6} radius={0.38} />
    </group>
  );
};

// Yellow City Taxi
const TaxiModel: React.FC = () => {
  return (
    <group>
      <SedanModel color="#facc15" />
      {/* Taxi Roof Sign */}
      <mesh position={[0, 0.82, -0.1]}>
        <boxGeometry args={[0.45, 0.14, 0.2]} />
        <meshStandardMaterial color="#ffffff" emissive="#fef08a" emissiveIntensity={2} />
      </mesh>
      {/* Checker Stripe along side */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.72, 0.06, 3.2]} />
        <meshStandardMaterial color="#000000" roughness={0.8} />
      </mesh>
    </group>
  );
};

const CivilianWheels: React.FC<{ width?: number; length?: number; radius?: number }> = ({
  width = 1.65,
  length = 2.4,
  radius = 0.32,
}) => {
  const halfW = width / 2;
  const halfL = length / 2;

  return (
    <group>
      {/* 4 Wheels */}
      {[
        [-halfW, 0.22, -halfL],
        [halfW, 0.22, -halfL],
        [-halfW, 0.22, halfL],
        [halfW, 0.22, halfL],
      ].map((pos, idx) => (
        <mesh key={idx} position={pos as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[radius, radius, 0.24, 16]} />
          <meshStandardMaterial color="#1f2937" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};
