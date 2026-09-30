import React, { useMemo } from 'react';
import * as THREE from 'three';
import { trackInstance } from '../game/TrackData';

export const DesertEnvironment: React.FC = () => {
  // Red rock mesas & canyon formations
  const rockFormations = useMemo(() => {
    const list: { pos: [number, number, number]; scale: [number, number, number]; rot: number }[] = [];
    const samples = trackInstance.samples;

    for (let i = 0; i < samples.length; i += 10) {
      const s = samples[i];
      const offsets = [-50, -90, 50, 90];
      for (const off of offsets) {
        if (Math.random() < 0.65) {
          const pos = s.point.clone().addScaledVector(s.binormal, off);
          const height = 15 + Math.random() * 45;
          pos.y = height / 2 - 3;
          list.push({
            pos: [pos.x, pos.y, pos.z],
            scale: [20 + Math.random() * 30, height, 20 + Math.random() * 30],
            rot: Math.random() * Math.PI,
          });
        }
      }
    }
    return list;
  }, []);

  // Cacti along the highway
  const cacti = useMemo(() => {
    const list: { pos: [number, number, number]; rot: number; scale: number }[] = [];
    const samples = trackInstance.samples;

    for (let i = 0; i < samples.length; i += 6) {
      const s = samples[i];
      const offset = (Math.random() > 0.5 ? 1 : -1) * (14 + Math.random() * 12);
      const pos = s.point.clone().addScaledVector(s.binormal, offset);
      list.push({
        pos: [pos.x, pos.y, pos.z],
        rot: Math.random() * Math.PI,
        scale: 0.8 + Math.random() * 0.6,
      });
    }
    return list;
  }, []);

  return (
    <group>
      {/* Golden hour fog & lighting */}
      <fog attach="fog" args={['#b45309', 50, 320]} />
      <ambientLight color="#ffedd5" intensity={0.65} />
      <directionalLight
        position={[-150, 100, -80]}
        intensity={1.8}
        color="#fdba74"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Desert Ground Terrain */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1800, 1800]} />
        <meshStandardMaterial color="#78350f" roughness={0.95} />
      </mesh>

      {/* Red Sandstone Mesas */}
      {rockFormations.map((r, i) => (
        <mesh key={i} position={r.pos} rotation={[0, r.rot, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[r.scale[0] * 0.7, r.scale[0], r.scale[1], 7]} />
          <meshStandardMaterial color="#9a3412" roughness={0.9} />
        </mesh>
      ))}

      {/* Saguaro Cacti */}
      {cacti.map((c, i) => (
        <group key={i} position={c.pos} rotation={[0, c.rot, 0]} scale={c.scale}>
          {/* Main trunk */}
          <mesh position={[0, 2.2, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.35, 4.4, 8]} />
            <meshStandardMaterial color="#166534" roughness={0.8} />
          </mesh>
          {/* Left Arm */}
          <mesh position={[-0.8, 2.6, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.2, 0.2, 1.2, 6]} />
            <meshStandardMaterial color="#166534" />
          </mesh>
          <mesh position={[-1.3, 3.3, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 1.4, 6]} />
            <meshStandardMaterial color="#166534" />
          </mesh>
          {/* Right Arm */}
          <mesh position={[0.8, 1.8, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.2, 0.2, 1.2, 6]} />
            <meshStandardMaterial color="#166534" />
          </mesh>
          <mesh position={[1.3, 2.5, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 1.4, 6]} />
            <meshStandardMaterial color="#166534" />
          </mesh>
        </group>
      ))}
    </group>
  );
};
