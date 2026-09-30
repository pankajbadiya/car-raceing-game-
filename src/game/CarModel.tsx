import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface CarModelProps {
  color?: string;
  steerAngle?: number;
  wheelRotation?: number;
  isNitroActive?: boolean;
  isBraking?: boolean;
  isHeadlightsOn?: boolean;
  scale?: number;
  underglowColor?: string;
  isPlayer?: boolean;
}

export const CarModel: React.FC<CarModelProps> = ({
  color = '#f8fafc',
  steerAngle = 0,
  wheelRotation = 0,
  isNitroActive = false,
  isBraking = false,
  isHeadlightsOn = true,
  scale = 1.0,
  underglowColor = '#06b6d4',
  isPlayer = false,
}) => {
  const frontLeftWheelRef = useRef<THREE.Group>(null);
  const frontRightWheelRef = useRef<THREE.Group>(null);
  const rearLeftWheelRef = useRef<THREE.Group>(null);
  const rearRightWheelRef = useRef<THREE.Group>(null);
  const nitroFlamesRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    // Steer front wheels
    const steerRad = steerAngle * 0.42;
    if (frontLeftWheelRef.current) {
      frontLeftWheelRef.current.rotation.y = steerRad;
      frontLeftWheelRef.current.children[0].rotation.x += delta * wheelRotation * 10;
    }
    if (frontRightWheelRef.current) {
      frontRightWheelRef.current.rotation.y = steerRad;
      frontRightWheelRef.current.children[0].rotation.x += delta * wheelRotation * 10;
    }
    if (rearLeftWheelRef.current) {
      rearLeftWheelRef.current.rotation.x += delta * wheelRotation * 10;
    }
    if (rearRightWheelRef.current) {
      rearRightWheelRef.current.rotation.x += delta * wheelRotation * 10;
    }

    // Nitro flame pulsating
    if (nitroFlamesRef.current && isNitroActive) {
      const pulse = 0.85 + Math.random() * 0.45;
      nitroFlamesRef.current.scale.set(1, 1, pulse);
    }
  });

  return (
    <group scale={scale}>
      {/* 1. Main Sculpted Sports Coupe Body (Matching reference GT coupe) */}
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.88, 0.38, 4.3]} />
        <meshStandardMaterial color={color} metalness={0.82} roughness={0.18} />
      </mesh>

      {/* Aerodynamic Front Hood & Bumper */}
      <mesh position={[0, 0.25, -1.82]} rotation={[-0.09, 0, 0]} castShadow>
        <boxGeometry args={[1.78, 0.26, 1.0]} />
        <meshStandardMaterial color={color} metalness={0.82} roughness={0.18} />
      </mesh>

      {/* Front Carbon Splitter */}
      <mesh position={[0, 0.1, -2.18]} castShadow>
        <boxGeometry args={[1.86, 0.05, 0.4]} />
        <meshStandardMaterial color="#090d16" roughness={0.8} />
      </mesh>

      {/* Front Grille */}
      <mesh position={[0, 0.22, -2.2]}>
        <boxGeometry args={[1.25, 0.2, 0.05]} />
        <meshStandardMaterial color="#020617" roughness={0.9} />
      </mesh>

      {/* Cockpit / Roof Cabin */}
      <mesh position={[0, 0.63, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[1.36, 0.42, 2.15]} />
        <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Tinted Front Windshield */}
      <mesh position={[0, 0.61, -1.22]} rotation={[-0.45, 0, 0]}>
        <boxGeometry args={[1.28, 0.02, 0.72]} />
        <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} transparent opacity={0.65} />
      </mesh>

      {/* Tinted Fastback Rear Window */}
      <mesh position={[0, 0.61, 0.82]} rotation={[0.42, 0, 0]}>
        <boxGeometry args={[1.26, 0.02, 0.7]} />
        <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} transparent opacity={0.65} />
      </mesh>

      {/* Side Windows */}
      <mesh position={[-0.68, 0.61, -0.2]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[0.02, 0.32, 1.45]} />
        <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} transparent opacity={0.65} />
      </mesh>
      <mesh position={[0.68, 0.61, -0.2]} rotation={[0, 0, -0.08]}>
        <boxGeometry args={[0.02, 0.32, 1.45]} />
        <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} transparent opacity={0.65} />
      </mesh>

      {/* Side Carbon Skirts */}
      <mesh position={[-0.94, 0.15, 0]}>
        <boxGeometry args={[0.1, 0.12, 2.6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>
      <mesh position={[0.94, 0.15, 0]}>
        <boxGeometry args={[0.1, 0.12, 2.6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      {/* Sculpted Rear Trunk & Ducktail Spoiler (Matching reference car) */}
      <group position={[0, 0.44, 1.95]}>
        {/* Trunk lid curve */}
        <mesh position={[0, 0, 0]} rotation={[0.08, 0, 0]} castShadow>
          <boxGeometry args={[1.76, 0.14, 0.65]} />
          <meshStandardMaterial color={color} metalness={0.82} roughness={0.18} />
        </mesh>
        {/* Integrated Ducktail Lip Spoiler */}
        <mesh position={[0, 0.1, 0.28]} rotation={[-0.15, 0, 0]} castShadow>
          <boxGeometry args={[1.82, 0.06, 0.22]} />
          <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Rear Aggressive L-Shaped LED Taillights (Matching reference image) */}
      <group position={[0, 0.35, 2.16]}>
        {/* Left Taillight Unit */}
        <mesh position={[-0.66, 0, 0]}>
          <boxGeometry args={[0.42, 0.1, 0.05]} />
          <meshStandardMaterial
            color={isBraking ? '#ff1e1e' : '#dc2626'}
            emissive="#ef4444"
            emissiveIntensity={isBraking ? 7.0 : 3.0}
          />
        </mesh>
        {/* Left Downward L-Blade */}
        <mesh position={[-0.82, -0.06, 0]}>
          <boxGeometry args={[0.08, 0.14, 0.05]} />
          <meshStandardMaterial
            color={isBraking ? '#ff1e1e' : '#dc2626'}
            emissive="#ef4444"
            emissiveIntensity={isBraking ? 7.0 : 3.0}
          />
        </mesh>

        {/* Right Taillight Unit */}
        <mesh position={[0.66, 0, 0]}>
          <boxGeometry args={[0.42, 0.1, 0.05]} />
          <meshStandardMaterial
            color={isBraking ? '#ff1e1e' : '#dc2626'}
            emissive="#ef4444"
            emissiveIntensity={isBraking ? 7.0 : 3.0}
          />
        </mesh>
        {/* Right Downward L-Blade */}
        <mesh position={[0.82, -0.06, 0]}>
          <boxGeometry args={[0.08, 0.14, 0.05]} />
          <meshStandardMaterial
            color={isBraking ? '#ff1e1e' : '#dc2626'}
            emissive="#ef4444"
            emissiveIntensity={isBraking ? 7.0 : 3.0}
          />
        </mesh>

        {/* Center License Plate & Trunk Recess */}
        <mesh position={[0, -0.05, -0.02]}>
          <boxGeometry args={[0.65, 0.22, 0.04]} />
          <meshStandardMaterial color="#020617" roughness={0.9} />
        </mesh>
      </group>

      {/* Rear Bumper & Diffuser with Quad Exhausts */}
      <group position={[0, 0.15, 2.16]}>
        {/* Lower Diffuser Panel */}
        <mesh castShadow>
          <boxGeometry args={[1.72, 0.18, 0.18]} />
          <meshStandardMaterial color="#090d16" roughness={0.8} />
        </mesh>

        {/* Diffuser Aerodynamic Fins */}
        {[-0.24, -0.08, 0.08, 0.24].map((x, i) => (
          <mesh key={i} position={[x, -0.04, 0.06]}>
            <boxGeometry args={[0.03, 0.12, 0.2]} />
            <meshStandardMaterial color="#020617" roughness={0.6} />
          </mesh>
        ))}

        {/* Quad Chrome Exhaust Tips (2 Left, 2 Right) */}
        {[-0.64, -0.52, 0.52, 0.64].map((x, idx) => (
          <mesh key={idx} position={[x, -0.02, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.065, 0.065, 0.14, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
          </mesh>
        ))}
      </group>

      {/* Headlights & Projector Lenses */}
      <group position={[0, 0.3, -2.14]}>
        <mesh position={[-0.66, 0, 0]}>
          <boxGeometry args={[0.36, 0.11, 0.05]} />
          <meshStandardMaterial
            color="#e0f2fe"
            emissive="#38bdf8"
            emissiveIntensity={isHeadlightsOn ? 3.5 : 0.2}
          />
        </mesh>
        <mesh position={[0.66, 0, 0]}>
          <boxGeometry args={[0.36, 0.11, 0.05]} />
          <meshStandardMaterial
            color="#e0f2fe"
            emissive="#38bdf8"
            emissiveIntensity={isHeadlightsOn ? 3.5 : 0.2}
          />
        </mesh>

        {/* Forward Headlight Beams */}
        {isHeadlightsOn && isPlayer && (
          <>
            <spotLight
              position={[-0.66, 0, -0.2]}
              target-position={[-0.66, -0.5, -28]}
              angle={0.45}
              penumbra={0.6}
              intensity={4.5}
              distance={45}
              color="#e0f2fe"
            />
            <spotLight
              position={[0.66, 0, -0.2]}
              target-position={[0.66, -0.5, -28]}
              angle={0.45}
              penumbra={0.6}
              intensity={4.5}
              distance={45}
              color="#e0f2fe"
            />
          </>
        )}
      </group>

      {/* Nitro Flame Jet Exhausts */}
      {isNitroActive && (
        <group ref={nitroFlamesRef} position={[0, 0.13, 2.25]}>
          {/* Left Dual Flames */}
          <mesh position={[-0.58, 0, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.13, 1.3, 12]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.88} />
          </mesh>
          <mesh position={[-0.58, 0, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.07, 0.85, 12]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.95} />
          </mesh>

          {/* Right Dual Flames */}
          <mesh position={[0.58, 0, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.13, 1.3, 12]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.88} />
          </mesh>
          <mesh position={[0.58, 0, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.07, 0.85, 12]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.95} />
          </mesh>

          <pointLight position={[0, 0, 0.8]} color="#06b6d4" intensity={4.5} distance={8} />
        </group>
      )}

      {/* Realistic Ground Contact Ambient Occlusion Shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.0, 4.4]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.65} />
      </mesh>

      {/* WHEELS */}
      {/* Front Left */}
      <group ref={frontLeftWheelRef} position={[-0.95, 0.26, -1.3]}>
        <group>
          <WheelMesh isLeft={true} />
        </group>
      </group>

      {/* Front Right */}
      <group ref={frontRightWheelRef} position={[0.95, 0.26, -1.3]}>
        <group>
          <WheelMesh isLeft={false} />
        </group>
      </group>

      {/* Rear Left (Wide stance like reference image) */}
      <group ref={rearLeftWheelRef} position={[-0.97, 0.26, 1.32]}>
        <WheelMesh isLeft={true} isWide={true} />
      </group>

      {/* Rear Right (Wide stance like reference image) */}
      <group ref={rearRightWheelRef} position={[0.97, 0.26, 1.32]}>
        <WheelMesh isLeft={false} isWide={true} />
      </group>
    </group>
  );
};

// Reusable Wheel Mesh
const WheelMesh: React.FC<{ isLeft: boolean; isWide?: boolean }> = ({ isLeft, isWide = false }) => {
  const width = isWide ? 0.34 : 0.28;
  const radius = 0.34;

  return (
    <group rotation={[0, 0, isLeft ? Math.PI / 2 : -Math.PI / 2]}>
      {/* Rubber Tire with Tread */}
      <mesh castShadow>
        <cylinderGeometry args={[radius, radius, width, 24]} />
        <meshStandardMaterial color="#111827" roughness={0.85} />
      </mesh>

      {/* Multi-Spoke Metallic Rim */}
      <mesh>
        <cylinderGeometry args={[radius * 0.72, radius * 0.72, width + 0.01, 20]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.92} roughness={0.15} />
      </mesh>

      {/* Performance Brake Caliper (Racing Red) */}
      <mesh position={[radius * 0.45, 0, 0]}>
        <boxGeometry args={[0.08, width - 0.04, 0.12]} />
        <meshStandardMaterial color="#ef4444" roughness={0.25} />
      </mesh>
    </group>
  );
};
