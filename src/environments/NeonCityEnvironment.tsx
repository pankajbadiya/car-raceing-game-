import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { trackInstance } from '../game/TrackData';

export const NeonCityEnvironment: React.FC = () => {
  // Generate buildings along the outside of the circuit
  const buildings = useMemo(() => {
    const list: {
      pos: [number, number, number];
      size: [number, number, number];
      color: string;
      neonColor: string;
    }[] = [];

    const neonPalettes = ['#06b6d4', '#8b5cf6', '#ec4899', '#3b82f6', '#f43f5e'];
    const totalSamples = trackInstance.samples.length;

    // Distribute 90 skyscrapers surrounding track
    for (let i = 0; i < totalSamples; i += 7) {
      const s = trackInstance.samples[i];
      // Place buildings on both left and right at offsets (35m to 120m away)
      const offsets = [-45, -75, -110, 45, 80, 115];
      for (const off of offsets) {
        if (Math.random() < 0.6) {
          const pos = s.point.clone().addScaledVector(s.binormal, off);
          const width = 16 + Math.random() * 24;
          const depth = 16 + Math.random() * 24;
          const height = 45 + Math.random() * 110;
          pos.y = height / 2 - 5;

          const neon = neonPalettes[Math.floor(Math.random() * neonPalettes.length)];

          list.push({
            pos: [pos.x, pos.y, pos.z],
            size: [width, height, depth],
            color: '#080c16',
            neonColor: neon,
          });
        }
      }
    }
    return list;
  }, []);

  return (
    <group>
      {/* Fog and Ambient */}
      <fog attach="fog" args={['#070814', 35, 260]} />
      <ambientLight color="#1e293b" intensity={0.5} />
      <directionalLight
        position={[80, 120, 50]}
        intensity={0.8}
        color="#38bdf8"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Ground plane */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1600, 1600]} />
        <meshStandardMaterial color="#050811" roughness={0.9} />
      </mesh>

      {/* Instanced or clustered Skyscraper Buildings */}
      {buildings.map((b, idx) => (
        <group key={idx} position={b.pos}>
          {/* Main Tower Box */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={b.size} />
            <meshStandardMaterial color={b.color} roughness={0.3} metalness={0.7} />
          </mesh>
          {/* Top Neon Spire / Crown */}
          <mesh position={[0, b.size[1] / 2 + 3, 0]}>
            <cylinderGeometry args={[0.2, 0.8, 8, 8]} />
            <meshStandardMaterial
              color={b.neonColor}
              emissive={b.neonColor}
              emissiveIntensity={2.5}
            />
          </mesh>
          {/* Glowing Window Strips */}
          <mesh position={[0, 0, b.size[2] / 2 + 0.1]}>
            <planeGeometry args={[b.size[0] * 0.75, b.size[1] * 0.8]} />
            <meshStandardMaterial
              color="#030712"
              emissive={b.neonColor}
              emissiveIntensity={0.65}
              roughness={0.5}
            />
          </mesh>
        </group>
      ))}

      {/* Cyber Neon Billboards */}
      <NeonBillboards />
    </group>
  );
};

const NeonBillboards: React.FC = () => {
  const billboardData = useMemo(() => {
    return [
      { dist: 140, text: 'CYBER NITRO', color: '#06b6d4', offset: -24 },
      { dist: 380, text: 'HYPER GT', color: '#ec4899', offset: 26 },
      { dist: 720, text: 'TOKYO NIGHTS', color: '#8b5cf6', offset: -25 },
      { dist: 1050, text: 'MAX VELOCITY', color: '#ef4444', offset: 25 },
    ];
  }, []);

  return (
    <group>
      {billboardData.map((b, i) => {
        const s = trackInstance.getSampleAtDistance(b.dist);
        const pos = s.point.clone().addScaledVector(s.binormal, b.offset);
        pos.y += 18;

        const m = new THREE.Matrix4().makeBasis(
          s.binormal,
          s.normal,
          s.tangent.clone().negate()
        );
        const rot = new THREE.Euler().setFromRotationMatrix(m);

        return (
          <group key={i} position={pos} rotation={rot}>
            {/* Supporting Pylon */}
            <mesh position={[0, -9, 0]}>
              <cylinderGeometry args={[0.6, 0.8, 18, 12]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
            {/* Billboard Screen Frame */}
            <mesh>
              <boxGeometry args={[18, 7, 0.8]} />
              <meshStandardMaterial color="#020617" roughness={0.2} metalness={0.9} />
            </mesh>
            {/* Illuminated Front Face */}
            <mesh position={[0, 0, 0.45]}>
              <planeGeometry args={[17.2, 6.2]} />
              <meshStandardMaterial
                color={b.color}
                emissive={b.color}
                emissiveIntensity={2.8}
                roughness={0.1}
              />
            </mesh>
            <pointLight position={[0, 0, 3]} color={b.color} intensity={2.5} distance={25} />
          </group>
        );
      })}
    </group>
  );
};
