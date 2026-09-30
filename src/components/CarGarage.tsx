import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { ArrowLeft, Coins, Check, Lock, ChevronLeft, ChevronRight, Palette, Gauge, Zap, Compass, Flame } from 'lucide-react';
import { CAR_SPECS } from '../game/TrackData';
import { CarModel } from '../game/CarModel';
import { audioManager } from '../game/AudioManager';
import { CarSpec, PlayerStats } from '../types/game';

interface CarGarageProps {
  playerStats: PlayerStats;
  onUpdateStats: (newStats: Partial<PlayerStats>) => void;
  onBack: () => void;
}

const CAR_COLORS = [
  { name: 'Electric Blue', hex: '#3b82f6' },
  { name: 'Inferno Red', hex: '#ef4444' },
  { name: 'Amber Gold', hex: '#f59e0b' },
  { name: 'Neon Violet', hex: '#8b5cf6' },
  { name: 'Cyan Plasma', hex: '#06b6d4' },
  { name: 'Emerald Speed', hex: '#10b981' },
  { name: 'Obsidian Black', hex: '#18181b' },
  { name: 'Hyper White', hex: '#f8fafc' },
];

export const CarGarage: React.FC<CarGarageProps> = ({
  playerStats,
  onUpdateStats,
  onBack,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(() => {
    const idx = CAR_SPECS.findIndex((c) => c.id === playerStats.selectedCarId);
    return idx >= 0 ? idx : 0;
  });

  const [currentColor, setCurrentColor] = useState(
    playerStats.selectedColor || CAR_SPECS[selectedIdx].defaultColor
  );

  const activeCar = CAR_SPECS[selectedIdx];
  const isUnlocked = playerStats.unlockedCars.includes(activeCar.id);
  const isSelected = playerStats.selectedCarId === activeCar.id;

  const handleSelectCar = () => {
    if (!isUnlocked) return;
    audioManager.playClick();
    onUpdateStats({
      selectedCarId: activeCar.id,
      selectedColor: currentColor,
    });
  };

  const handleBuyCar = () => {
    if (playerStats.coins < activeCar.cost) return;
    audioManager.playFinish(true);
    const newUnlocked = [...playerStats.unlockedCars, activeCar.id];
    onUpdateStats({
      coins: playerStats.coins - activeCar.cost,
      unlockedCars: newUnlocked,
      selectedCarId: activeCar.id,
      selectedColor: currentColor,
    });
  };

  const handleNextCar = () => {
    audioManager.playClick();
    const next = (selectedIdx + 1) % CAR_SPECS.length;
    setSelectedIdx(next);
    setCurrentColor(CAR_SPECS[next].defaultColor);
  };

  const handlePrevCar = () => {
    audioManager.playClick();
    const prev = (selectedIdx - 1 + CAR_SPECS.length) % CAR_SPECS.length;
    setSelectedIdx(prev);
    setCurrentColor(CAR_SPECS[prev].defaultColor);
  };

  return (
    <div className="absolute inset-0 z-40 bg-slate-950 flex flex-col justify-between overflow-hidden select-none">
      {/* Background Showroom Floor Image */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="/src/assets/images/bg_realistic_garage_1790753277744.jpg"
          alt="Luxury Supercar Showroom"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover filter brightness-[0.35] contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/95" />
      </div>

      {/* TOP HEADER */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <button
          onClick={() => {
            audioManager.playClick();
            onBack();
          }}
          className="flex items-center gap-2 text-slate-300 hover:text-white font-semibold transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-900"
        >
          <ArrowLeft className="w-5 h-5 text-cyan-400" />
          <span>BACK TO MENU</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-black italic tracking-wider font-display text-white">
          CAR GARAGE
        </h1>

        {/* Coin balance */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 px-4 py-1.5 rounded-2xl shadow-sm">
          <Coins className="w-5 h-5 text-amber-400" />
          <span className="font-bold font-mono-numbers text-amber-300 text-lg">
            {playerStats.coins.toLocaleString()}
          </span>
        </div>
      </header>

      {/* 3D TURNTABLE VIEWPORT */}
      <div className="relative flex-1 w-full h-full min-h-[300px]">
        {/* Next / Previous Car arrows */}
        <button
          onClick={handlePrevCar}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-2xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800 flex items-center justify-center text-white backdrop-blur-md transition-all active:scale-95 shadow-xl"
          aria-label="Previous Car"
        >
          <ChevronLeft className="w-7 h-7 text-cyan-400" />
        </button>

        <button
          onClick={handleNextCar}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-2xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800 flex items-center justify-center text-white backdrop-blur-md transition-all active:scale-95 shadow-xl"
          aria-label="Next Car"
        >
          <ChevronRight className="w-7 h-7 text-cyan-400" />
        </button>

        <Canvas
          shadows
          camera={{ position: [4.5, 2.2, 5.5], fov: 45 }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow />
            <directionalLight position={[-10, 10, -10]} intensity={0.8} color="#38bdf8" />

            {/* Turntable Showcase Platform */}
            <ShowcasePlatform />

            {/* Rotating Car Model */}
            <TurntableCar color={currentColor} />

            <OrbitControls
              enablePan={false}
              maxPolarAngle={Math.PI / 2 - 0.05}
              minDistance={3.5}
              maxDistance={9.0}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* BOTTOM CONTROL & STATS PANEL */}
      <div className="relative z-10 bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-xl p-5 sm:p-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Column 1: Car Identity & Price */}
          <div>
            <div className="text-xs uppercase font-bold tracking-widest text-cyan-400 mb-1">
              {activeCar.subtitle}
            </div>
            <h2 className="text-3xl font-black italic tracking-wide font-display text-white">
              {activeCar.name}
            </h2>
            <div className="text-sm text-slate-400 mt-1">
              Top Speed: <span className="text-white font-bold">{activeCar.topSpeedKmh} KM/H</span>
            </div>

            {/* Action CTA */}
            <div className="mt-4">
              {isSelected ? (
                <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold font-display text-sm">
                  <Check className="w-5 h-5" />
                  SELECTED VEHICLE
                </div>
              ) : isUnlocked ? (
                <button
                  onClick={handleSelectCar}
                  className="px-8 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-black font-display text-base tracking-wider transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                >
                  DRIVE THIS CAR
                </button>
              ) : (
                <button
                  onClick={handleBuyCar}
                  disabled={playerStats.coins < activeCar.cost}
                  className={`px-8 py-3.5 rounded-2xl font-black font-display text-base tracking-wider transition-all flex items-center gap-2.5 ${
                    playerStats.coins >= activeCar.cost
                      ? 'bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  UNLOCK FOR {activeCar.cost} COINS
                </button>
              )}
            </div>
          </div>

          {/* Column 2: Stats Bars */}
          <div className="space-y-2.5 bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl">
            <StatBar label="Top Speed" value={activeCar.speed} icon={Gauge} color="from-blue-500 to-cyan-400" />
            <StatBar label="Acceleration" value={activeCar.acceleration} icon={Zap} color="from-amber-500 to-yellow-400" />
            <StatBar label="Handling" value={activeCar.handling} icon={Compass} color="from-emerald-500 to-teal-400" />
            <StatBar label="Nitro Capacity" value={activeCar.nitro} icon={Flame} color="from-rose-500 to-pink-400" />
          </div>

          {/* Column 3: Custom Paint Palette */}
          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              <Palette className="w-4 h-4 text-cyan-400" />
              Custom Paint Finish
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {CAR_COLORS.map((col) => (
                <button
                  key={col.hex}
                  onClick={() => {
                    audioManager.playClick();
                    setCurrentColor(col.hex);
                    if (isUnlocked && isSelected) {
                      onUpdateStats({ selectedColor: col.hex });
                    }
                  }}
                  title={col.name}
                  className={`w-full aspect-square rounded-xl transition-all relative ${
                    currentColor === col.hex
                      ? 'ring-2 ring-white scale-105 shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: col.hex }}
                >
                  {currentColor === col.hex && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Car rotating slowly in turntable
const TurntableCar: React.FC<{ color: string }> = ({ color }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.45;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.45, 0]}>
      <CarModel color={color} isHeadlightsOn={true} underglowColor={color} />
    </group>
  );
};

// Illuminated Showcase Platform
const ShowcasePlatform: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* Cylindrical Platform */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <cylinderGeometry args={[3.2, 3.4, 0.3, 48]} />
        <meshStandardMaterial color="#090d16" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Outer Neon Glow Ring */}
      <mesh position={[0, 0.31, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.9, 3.1, 48]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>
      {/* Floor Mirror Plate */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#030712" roughness={0.1} metalness={0.9} />
      </mesh>
    </group>
  );
};

// Stat Progress Bar
const StatBar: React.FC<{
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = ({ label, value, icon: Icon, color }) => {
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold mb-1">
        <span className="flex items-center gap-1.5 text-slate-300">
          <Icon className="w-3.5 h-3.5 text-slate-400" />
          {label}
        </span>
        <span className="font-mono-numbers text-slate-400 font-bold">{value}%</span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-300`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};
