import React, { useMemo } from 'react';
import * as THREE from 'three';
import { trackInstance } from '../game/TrackData';

export const JungleEnvironment: React.FC = () => {
  // Tropical Canopy Trees along track borders
  const jungleTrees = useMemo(() => {
    const list: {
      pos: [number, number, number];
      scale: number;
      rot: number;
      trunkColor: string;
      leavesColor: string;
    }[] = [];

    const samples = trackInstance.samples;
    const leavesPalettes = ['#059669', '#10b981', '#047857', '#065f46', '#15803d'];

    for (let i = 0; i < samples.length; i += 4) {
      const s = samples[i];
      // Left and right sides of track
      const offsets = [-22, -38, -60, 22, 38, 60];
      for (const off of offsets) {
        if (Math.random() < 0.75) {
          const pos = s.point.clone().addScaledVector(s.binormal, off);
          const scale = 1.2 + Math.random() * 1.5;
          pos.y += 0;

          list.push({
            pos: [pos.x, pos.y, pos.z],
            scale,
            rot: Math.random() * Math.PI * 2,
            trunkColor: '#3f2e18',
            leavesColor: leavesPalettes[Math.floor(Math.random() * leavesPalettes.length)],
          });
        }
      }
    }
    return list;
  }, []);

  // Bioluminescent Glowing Jungle Flora & Giant Mushrooms
  const bioFlora = useMemo(() => {
    const list: {
      pos: [number, number, number];
      color: string;
      scale: number;
    }[] = [];

    const samples = trackInstance.samples;
    const neonColors = ['#10b981', '#06b6d4', '#22c55e', '#a855f7', '#38bdf8'];

    for (let i = 0; i < samples.length; i += 6) {
      const s = samples[i];
      const side = Math.random() > 0.5 ? 1 : -1;
      const offset = side * (13 + Math.random() * 6);
      const pos = s.point.clone().addScaledVector(s.binormal, offset);
      pos.y += 0.5;

      list.push({
        pos: [pos.x, pos.y, pos.z],
        color: neonColors[Math.floor(Math.random() * neonColors.length)],
        scale: 0.8 + Math.random() * 0.8,
      });
    }
    return list;
  }, []);

  // Ancient Overgrown Temple Stone Ruins
  const templeRuins = useMemo(() => {
    const list: {
      pos: [number, number, number];
      rot: THREE.Euler;
      size: [number, number, number];
    }[] = [];

    const distances = [180, 480, 850, 1150];

    for (const d of distances) {
      const s = trackInstance.getSampleAtDistance(d);
      const pos = s.point.clone().addScaledVector(s.binormal, -35);
      pos.y += 6;

      const m = new THREE.Matrix4().makeBasis(
        s.binormal,
        s.normal,
        s.tangent.clone().negate()
      );
      const rot = new THREE.Euler().setFromRotationMatrix(m);

      list.push({
        pos: [pos.x, pos.y, pos.z],
        rot,
        size: [18, 14, 18],
      });
    }
    return list;
  }, []);

  return (
    <group>
      {/* Deep Emerald Rainforest Fog & Atmosphere */}
      <fog attach="fog" args={['#032319', 30, 240]} />
      <ambientLight color="#10b981" intensity={0.55} />
      <directionalLight
        position={[80, 140, 60]}
        intensity={1.2}
        color="#a7f3d0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Jungle Rainforest Ground Plane */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1800, 1800]} />
        <meshStandardMaterial color="#064e3b" roughness={0.9} />
      </mesh>

      {/* Ancient Overgrown Temple Ruins */}
      {templeRuins.map((r, idx) => (
        <group key={idx} position={r.pos} rotation={r.rot}>
          {/* Main Stepped Pyramid Platform */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={r.size} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          {/* Upper Altar */}
          <mesh position={[0, r.size[1] / 2 + 2, 0]} castShadow>
            <boxGeometry args={[r.size[0] * 0.6, 4, r.size[2] * 0.6]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          {/* Glowing Moss Glyphs */}
          <mesh position={[0, 0, r.size[2] / 2 + 0.1]}>
            <planeGeometry args={[r.size[0] * 0.8, r.size[1] * 0.7]} />
            <meshStandardMaterial
              color="#047857"
              emissive="#10b981"
              emissiveIntensity={1.2}
              roughness={0.4}
            />
          </mesh>
          <pointLight position={[0, 4, r.size[2] / 2 + 2]} color="#10b981" intensity={2} distance={20} />
        </group>
      ))}

      {/* Tropical Canopy Trees */}
      {jungleTrees.map((tree, i) => (
        <group key={i} position={tree.pos} rotation={[0, tree.rot, 0]} scale={tree.scale}>
          {/* Tree Trunk */}
          <mesh position={[0, 4.5, 0]} castShadow>
            <cylinderGeometry args={[0.6, 1.1, 9, 7]} />
            <meshStandardMaterial color={tree.trunkColor} roughness={0.9} />
          </mesh>
          {/* Broad Lower Foliage Canopy */}
          <mesh position={[0, 8.5, 0]} castShadow>
            <coneGeometry args={[4.2, 5, 8]} />
            <meshStandardMaterial color={tree.leavesColor} roughness={0.7} />
          </mesh>
          {/* Upper Foliage Crown */}
          <mesh position={[0, 11.5, 0]} castShadow>
            <coneGeometry args={[3.0, 4.5, 8]} />
            <meshStandardMaterial color={tree.leavesColor} roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Giant Bioluminescent Mushrooms & Exotic Flowers */}
      {bioFlora.map((flora, i) => (
        <group key={i} position={flora.pos} scale={flora.scale}>
          {/* Stalk */}
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.15, 0.25, 1.6, 8]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Bioluminescent Cap */}
          <mesh position={[0, 1.7, 0]}>
            <sphereGeometry args={[0.8, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial
              color={flora.color}
              emissive={flora.color}
              emissiveIntensity={2.5}
              roughness={0.2}
            />
          </mesh>
          {/* Spores glow */}
          {i % 3 === 0 && (
            <pointLight position={[0, 1.8, 0]} color={flora.color} intensity={1.4} distance={8} />
          )}
        </group>
      ))}
    </group>
  );
};
