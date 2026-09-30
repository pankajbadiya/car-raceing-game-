import React, { useMemo } from 'react';
import * as THREE from 'three';
import { trackInstance, ROAD_WIDTH } from '../game/TrackData';

export const NightHighwayEnvironment: React.FC = () => {
  // Distant mountain silhouettes
  const mountains = useMemo(() => {
    const list: { pos: [number, number, number]; scale: [number, number, number] }[] = [];
    const radius = 600;
    const count = 36;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const height = 90 + Math.random() * 120;
      list.push({
        pos: [x, height / 2 - 10, z],
        scale: [120, height, 120],
      });
    }
    return list;
  }, []);

  // Highway Overpass Bridges
  const overpassBridges = useMemo(() => {
    return [
      { dist: 220 },
      { dist: 840 },
    ];
  }, []);

  return (
    <group>
      {/* Fog and Lighting */}
      <fog attach="fog" args={['#030712', 40, 300]} />
      <ambientLight color="#1e293b" intensity={0.35} />
      <directionalLight
        position={[200, 300, 100]}
        intensity={0.6}
        color="#93c5fd"
        castShadow
      />

      {/* Ground Terrain */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1800, 1800]} />
        <meshStandardMaterial color="#090d16" roughness={0.9} />
      </mesh>

      {/* Full Moon */}
      <mesh position={[300, 220, -400]}>
        <sphereGeometry args={[26, 32, 32]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>
      <pointLight position={[300, 220, -400]} color="#dbeafe" intensity={1.5} distance={1200} />

      {/* Mountain Silhouettes */}
      {mountains.map((m, i) => (
        <mesh key={i} position={m.pos}>
          <coneGeometry args={[m.scale[0], m.scale[1], 5]} />
          <meshStandardMaterial color="#020617" roughness={0.95} />
        </mesh>
      ))}

      {/* Highway Overpass Bridges */}
      {overpassBridges.map((b, i) => {
        const s = trackInstance.getSampleAtDistance(b.dist);
        const pos = s.point.clone().addScaledVector(s.normal, 11);

        const m = new THREE.Matrix4().makeBasis(
          s.binormal,
          s.normal,
          s.tangent.clone().negate()
        );
        const rot = new THREE.Euler().setFromRotationMatrix(m);

        return (
          <group key={i} position={pos} rotation={rot}>
            {/* Bridge Deck spanning track */}
            <mesh castShadow>
              <boxGeometry args={[ROAD_WIDTH + 14, 2.2, 10]} />
              <meshStandardMaterial color="#1e293b" roughness={0.7} />
            </mesh>
            {/* Bridge Railing */}
            <mesh position={[0, 1.8, 4.6]}>
              <boxGeometry args={[ROAD_WIDTH + 14, 1.2, 0.4]} />
              <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={1} />
            </mesh>
            <mesh position={[0, 1.8, -4.6]}>
              <boxGeometry args={[ROAD_WIDTH + 14, 1.2, 0.4]} />
              <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={1} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
