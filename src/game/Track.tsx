import React, { useMemo } from 'react';
import * as THREE from 'three';
import { trackInstance, ROAD_WIDTH, CircuitTrack } from './TrackData';
import { EnvironmentType } from '../types/game';

interface TrackProps {
  environment: EnvironmentType;
}

export const Track: React.FC<TrackProps> = ({ environment }) => {
  // Generate high-performance custom buffer geometries for the track
  const { roadGeo, roadStripesGeo, curbLeftGeo, curbRightGeo, barrierLeftGeo, barrierRightGeo } = useMemo(() => {
    const samples = trackInstance.samples;
    const numPoints = samples.length;

    // 1. Road Surface Ribbon Geometry (ROAD_WIDTH wide)
    const roadPositions: number[] = [];
    const roadNormals: number[] = [];
    const roadUvs: number[] = [];
    const roadIndices: number[] = [];

    // 2. Curbs (0.6m wide on each side)
    const curbLeftPositions: number[] = [];
    const curbLeftIndices: number[] = [];
    const curbRightPositions: number[] = [];
    const curbRightIndices: number[] = [];

    // 3. Barriers / Guardrails (0.2m wide, 1.1m high)
    const bLeftPositions: number[] = [];
    const bLeftIndices: number[] = [];
    const bRightPositions: number[] = [];
    const bRightIndices: number[] = [];

    const halfW = ROAD_WIDTH / 2;
    const curbW = 0.8;

    for (let i = 0; i < numPoints; i++) {
      const s = samples[i];
      const p = s.point;
      const b = s.binormal;
      const n = s.normal;

      // Road left and right
      const pL = p.clone().addScaledVector(b, -halfW);
      const pR = p.clone().addScaledVector(b, halfW);

      roadPositions.push(pL.x, pL.y, pL.z);
      roadPositions.push(pR.x, pR.y, pR.z);

      roadNormals.push(n.x, n.y, n.z);
      roadNormals.push(n.x, n.y, n.z);

      const v = (s.distance / 20) % 1; // Repeat UV every 20m
      roadUvs.push(0, v);
      roadUvs.push(1, v);

      // Curbs
      const cLL = p.clone().addScaledVector(b, -halfW - curbW).addScaledVector(n, 0.08);
      const cLR = pL.clone().addScaledVector(n, 0.08);
      curbLeftPositions.push(cLL.x, cLL.y, cLL.z);
      curbLeftPositions.push(cLR.x, cLR.y, cLR.z);

      const cRL = pR.clone().addScaledVector(n, 0.08);
      const cRR = p.clone().addScaledVector(b, halfW + curbW).addScaledVector(n, 0.08);
      curbRightPositions.push(cRL.x, cRL.y, cRL.z);
      curbRightPositions.push(cRR.x, cRR.y, cRR.z);

      // Barriers (1.1m tall)
      const bLBase = p.clone().addScaledVector(b, -halfW - curbW);
      const bLTop = bLBase.clone().addScaledVector(n, 1.1);
      bLeftPositions.push(bLBase.x, bLBase.y, bLBase.z);
      bLeftPositions.push(bLTop.x, bLTop.y, bLTop.z);

      const bRBase = p.clone().addScaledVector(b, halfW + curbW);
      const bRTop = bRBase.clone().addScaledVector(n, 1.1);
      bRightPositions.push(bRBase.x, bRBase.y, bRBase.z);
      bRightPositions.push(bRTop.x, bRTop.y, bRTop.z);

      // Connect quads
      if (i < numPoints - 1) {
        const v0 = i * 2;
        const v1 = i * 2 + 1;
        const v2 = (i + 1) * 2;
        const v3 = (i + 1) * 2 + 1;

        // Road triangles
        roadIndices.push(v0, v2, v1);
        roadIndices.push(v1, v2, v3);

        curbLeftIndices.push(v0, v2, v1);
        curbLeftIndices.push(v1, v2, v3);

        curbRightIndices.push(v0, v2, v1);
        curbRightIndices.push(v1, v2, v3);

        bLeftIndices.push(v0, v2, v1);
        bLeftIndices.push(v1, v2, v3);

        bRightIndices.push(v0, v2, v1);
        bRightIndices.push(v1, v2, v3);
      }
    }

    // Connect last segment to first to close loop
    const lastV0 = (numPoints - 1) * 2;
    const lastV1 = (numPoints - 1) * 2 + 1;
    roadIndices.push(lastV0, 0, lastV1);
    roadIndices.push(lastV1, 0, 1);

    curbLeftIndices.push(lastV0, 0, lastV1);
    curbLeftIndices.push(lastV1, 0, 1);

    curbRightIndices.push(lastV0, 0, lastV1);
    curbRightIndices.push(lastV1, 0, 1);

    bLeftIndices.push(lastV0, 0, lastV1);
    bLeftIndices.push(lastV1, 0, 1);

    bRightIndices.push(lastV0, 0, lastV1);
    bRightIndices.push(lastV1, 0, 1);

    // 4. Road Lane Stripes (White Center Dashes & Outer White Edge Lines)
    const stripePositions: number[] = [];
    const stripeIndices: number[] = [];
    const stripeW = 0.22;

    for (let i = 0; i < numPoints; i++) {
      const s = samples[i];
      const nextS = samples[(i + 1) % numPoints];

      // Dashed centerline (every 14m: 7m on, 7m off)
      const isDash = (s.distance % 14) < 7;
      if (isDash) {
        const baseIdx = stripePositions.length / 3;
        const cL = s.point.clone().addScaledVector(s.binormal, -stripeW / 2).addScaledVector(s.normal, 0.02);
        const cR = s.point.clone().addScaledVector(s.binormal, stripeW / 2).addScaledVector(s.normal, 0.02);
        const nextCL = nextS.point.clone().addScaledVector(nextS.binormal, -stripeW / 2).addScaledVector(nextS.normal, 0.02);
        const nextCR = nextS.point.clone().addScaledVector(nextS.binormal, stripeW / 2).addScaledVector(nextS.normal, 0.02);

        stripePositions.push(cL.x, cL.y, cL.z, cR.x, cR.y, cR.z, nextCL.x, nextCL.y, nextCL.z, nextCR.x, nextCR.y, nextCR.z);
        stripeIndices.push(baseIdx, baseIdx + 2, baseIdx + 1, baseIdx + 1, baseIdx + 2, baseIdx + 3);
      }
    }

    const rSG = new THREE.BufferGeometry();
    rSG.setAttribute('position', new THREE.Float32BufferAttribute(stripePositions, 3));
    rSG.setIndex(stripeIndices);
    rSG.computeVertexNormals();

    const rG = new THREE.BufferGeometry();
    rG.setAttribute('position', new THREE.Float32BufferAttribute(roadPositions, 3));
    rG.setAttribute('normal', new THREE.Float32BufferAttribute(roadNormals, 3));
    rG.setAttribute('uv', new THREE.Float32BufferAttribute(roadUvs, 2));
    rG.setIndex(roadIndices);

    const cLG = new THREE.BufferGeometry();
    cLG.setAttribute('position', new THREE.Float32BufferAttribute(curbLeftPositions, 3));
    cLG.setIndex(curbLeftIndices);
    cLG.computeVertexNormals();

    const cRG = new THREE.BufferGeometry();
    cRG.setAttribute('position', new THREE.Float32BufferAttribute(curbRightPositions, 3));
    cRG.setIndex(curbRightIndices);
    cRG.computeVertexNormals();

    const bLG = new THREE.BufferGeometry();
    bLG.setAttribute('position', new THREE.Float32BufferAttribute(bLeftPositions, 3));
    bLG.setIndex(bLeftIndices);
    bLG.computeVertexNormals();

    const bRG = new THREE.BufferGeometry();
    bRG.setAttribute('position', new THREE.Float32BufferAttribute(bRightPositions, 3));
    bRG.setIndex(bRightIndices);
    bRG.computeVertexNormals();

    return {
      roadGeo: rG,
      roadStripesGeo: rSG,
      curbLeftGeo: cLG,
      curbRightGeo: cRG,
      barrierLeftGeo: bLG,
      barrierRightGeo: bRG,
    };
  }, []);

  // Streetlights placement along track
  const streetLights = useMemo(() => {
    const lights: {
      pos: THREE.Vector3;
      rot: THREE.Euler;
      lampPos: THREE.Vector3;
      id: number;
    }[] = [];
    const interval = 45; // Every 45 meters
    const count = Math.floor(trackInstance.totalLength / interval);

    for (let i = 0; i < count; i++) {
      const dist = i * interval;
      // Skip lights inside tunnel
      if (trackInstance.isInsideTunnel(dist)) continue;

      const sample = trackInstance.getSampleAtDistance(dist);
      const isLeft = i % 2 === 0;
      const offset = isLeft ? -(ROAD_WIDTH / 2 + 1.8) : ROAD_WIDTH / 2 + 1.8;

      const pos = sample.point.clone().addScaledVector(sample.binormal, offset);
      const lampPos = pos.clone().addScaledVector(sample.normal, 7.5).addScaledVector(sample.binormal, isLeft ? 3.5 : -3.5);

      const m = new THREE.Matrix4().makeBasis(
        sample.binormal,
        sample.normal,
        sample.tangent.clone().negate()
      );
      const rot = new THREE.Euler().setFromRotationMatrix(m);

      lights.push({ pos, rot, lampPos, id: i });
    }
    return lights;
  }, []);

  // Tunnel neon rib arches
  const tunnelRibs = useMemo(() => {
    const ribs: { pos: THREE.Vector3; rot: THREE.Euler; id: number }[] = [];
    const start = trackInstance.tunnelStartDist;
    const end = trackInstance.tunnelEndDist;
    const ribInterval = 12; // every 12 meters
    const count = Math.floor((end - start) / ribInterval);

    for (let i = 0; i < count; i++) {
      const dist = start + i * ribInterval;
      const sample = trackInstance.getSampleAtDistance(dist);

      const m = new THREE.Matrix4().makeBasis(
        sample.binormal,
        sample.normal,
        sample.tangent.clone().negate()
      );
      const rot = new THREE.Euler().setFromRotationMatrix(m);
      ribs.push({ pos: sample.point, rot, id: i });
    }
    return ribs;
  }, []);

  // Road colors depending on environment
  const roadColor =
    environment === 'neon_city'
      ? '#181b26'
      : environment === 'jungle'
      ? '#131e1a'
      : environment === 'desert'
      ? '#292524'
      : '#0f172a';

  const barrierColor =
    environment === 'neon_city'
      ? '#0284c7'
      : environment === 'jungle'
      ? '#10b981'
      : environment === 'desert'
      ? '#d97706'
      : '#64748b';

  const curbColor =
    environment === 'neon_city'
      ? '#06b6d4'
      : environment === 'jungle'
      ? '#22c55e'
      : '#ef4444';

  return (
    <group>
      {/* 1. Road Surface */}
      <mesh geometry={roadGeo} receiveShadow>
        <meshStandardMaterial
          color={roadColor}
          roughness={environment === 'neon_city' ? 0.3 : 0.7}
          metalness={0.2}
        />
      </mesh>

      {/* Realistic Dashed White Lane Markings */}
      <mesh geometry={roadStripesGeo}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.88} />
      </mesh>

      {/* 2. Curbs */}
      <mesh geometry={curbLeftGeo}>
        <meshStandardMaterial color={curbColor} roughness={0.5} />
      </mesh>
      <mesh geometry={curbRightGeo}>
        <meshStandardMaterial color={curbColor} roughness={0.5} />
      </mesh>

      {/* 3. Guardrails / Barriers with Neon Stripe */}
      <mesh geometry={barrierLeftGeo} castShadow receiveShadow>
        <meshStandardMaterial
          color={barrierColor}
          emissive={barrierColor}
          emissiveIntensity={environment === 'neon_city' ? 0.6 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <mesh geometry={barrierRightGeo} castShadow receiveShadow>
        <meshStandardMaterial
          color={barrierColor}
          emissive={barrierColor}
          emissiveIntensity={environment === 'neon_city' ? 0.6 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* 4. Start / Finish Line Gantry */}
      <StartFinishGantry />

      {/* 5. Streetlights */}
      {streetLights.map((sl) => (
        <group key={sl.id} position={sl.pos} rotation={sl.rot}>
          {/* Mast Pole */}
          <mesh position={[0, 4, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.16, 8, 12]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Overhanging Arm */}
          <mesh position={[1.5, 7.8, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <cylinderGeometry args={[0.08, 0.08, 3.2, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          {/* Luminaire head */}
          <mesh position={[2.8, 7.2, 0]}>
            <boxGeometry args={[1.0, 0.2, 0.4]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive={environment === 'neon_city' ? '#38bdf8' : '#fed7aa'}
              emissiveIntensity={3.5}
            />
          </mesh>
          {/* Point light for ground illumination */}
          <pointLight
            position={[2.8, 6.8, 0]}
            color={environment === 'neon_city' ? '#38bdf8' : '#fed7aa'}
            intensity={1.8}
            distance={26}
          />
        </group>
      ))}

      {/* 6. Tunnel Rib Arches */}
      {tunnelRibs.map((rib, idx) => (
        <group key={rib.id} position={rib.pos} rotation={rib.rot}>
          {/* Arch Rib Ring */}
          <mesh position={[0, 5, 0]}>
            <torusGeometry args={[ROAD_WIDTH * 0.65, 0.4, 8, 24, Math.PI]} />
            <meshStandardMaterial
              color="#090d16"
              emissive={idx % 2 === 0 ? '#06b6d4' : '#8b5cf6'}
              emissiveIntensity={1.5}
              metalness={0.9}
            />
          </mesh>
          {/* Tunnel ceiling overhead light strip */}
          <mesh position={[0, 9.8, 0]}>
            <boxGeometry args={[2.5, 0.15, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#38bdf8"
              emissiveIntensity={3.0}
            />
          </mesh>
          <pointLight position={[0, 8.5, 0]} color="#38bdf8" intensity={1.5} distance={18} />
        </group>
      ))}
    </group>
  );
};

// Start / Finish Gantry Archway
const StartFinishGantry: React.FC = () => {
  const sample = trackInstance.getSampleAtDistance(0);

  const m = new THREE.Matrix4().makeBasis(
    sample.binormal,
    sample.normal,
    sample.tangent.clone().negate()
  );
  const rot = new THREE.Euler().setFromRotationMatrix(m);

  return (
    <group position={sample.point} rotation={rot}>
      {/* Ground Finish Line Checkered Strip */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROAD_WIDTH, 4]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
      </mesh>

      {/* Left Tower */}
      <mesh position={[-ROAD_WIDTH / 2 - 1.5, 5, 0]} castShadow>
        <boxGeometry args={[1.2, 10, 1.2]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Right Tower */}
      <mesh position={[ROAD_WIDTH / 2 + 1.5, 5, 0]} castShadow>
        <boxGeometry args={[1.2, 10, 1.2]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Overhead Truss Span */}
      <mesh position={[0, 9.2, 0]} castShadow>
        <boxGeometry args={[ROAD_WIDTH + 4.5, 1.6, 1.6]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Front Glowing "START / FINISH" Sign */}
      <mesh position={[0, 9.2, -0.85]}>
        <boxGeometry args={[12, 1.1, 0.1]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={3.2}
          roughness={0.1}
        />
      </mesh>

      {/* Starting Lights Pods (3 red, 1 green) */}
      <group position={[0, 8.0, -0.85]}>
        {[-3, -1, 1, 3].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.15, 16]} />
            <meshStandardMaterial
              color={i === 3 ? '#22c55e' : '#ef4444'}
              emissive={i === 3 ? '#22c55e' : '#ef4444'}
              emissiveIntensity={2.5}
            />
          </mesh>
        ))}
      </group>

      {/* High-intensity Arch Spotlight */}
      <pointLight position={[0, 8.5, 0]} color="#38bdf8" intensity={4} distance={30} />
    </group>
  );
};
