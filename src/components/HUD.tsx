import React, { useState, useEffect, useRef } from 'react';
import { Pause, Flame, Trophy, Timer, Camera, Eye, Flag, Activity } from 'lucide-react';
import { gameState } from '../game/GameState';
import { audioManager } from '../game/AudioManager';
import { LevelSpec } from '../types/game';

interface HUDProps {
  onPause: () => void;
  totalLaps?: number;
  level?: LevelSpec;
  currentCameraView?: string;
  onCycleCamera?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  onPause,
  totalLaps = 3,
  level,
  currentCameraView = 'low_rear',
  onCycleCamera,
}) => {
  const [hudData, setHudData] = useState({
    speed: 0,
    rpm: 1000,
    gear: 1,
    nitro: 100,
    isNitro: false,
    isDrifting: false,
    isBraking: false,
    throttle: 0,
    position: 4,
    lap: 1,
    totalTime: 0,
    lapTime: 0,
    bestLap: null as number | null,
    driftScore: 0,
    countdown: 3,
    status: 'countdown',
    trackProgress: 0,
    aiProgress: [0, 0, 0],
    trailingCars: [] as { name: string; dist: number; color: string }[],
  });

  const [lastCountdownSound, setLastCountdownSound] = useState<number | null>(null);

  useEffect(() => {
    let animId: number;

    const updateHud = () => {
      const rs = gameState.raceState;
      const playerDist = rs.distanceAlongTrack;

      // Handle countdown audio
      if (rs.status === 'countdown' && rs.countdown !== lastCountdownSound) {
        audioManager.playCountdown(rs.countdown);
        setLastCountdownSound(rs.countdown);
      }

      // Calculate trailing cars for rear-view mirror
      const trailing = gameState.opponents
        .map((ai) => {
          const delta = (playerDist - ai.distanceAlongTrack + 1400) % 1400;
          return {
            name: ai.name,
            dist: Math.round(delta),
            color: ai.color,
          };
        })
        .filter((c) => c.dist > 0 && c.dist < 85)
        .sort((a, b) => a.dist - b.dist);

      const throttleInput = gameState.inputs.forward ? 100 : 0;
      const isBraking = gameState.inputs.backward;

      setHudData({
        speed: rs.speed,
        rpm: rs.rpm,
        gear: rs.gear,
        nitro: rs.nitroPercent,
        isNitro: rs.isNitroActive,
        isDrifting: rs.isDrifting,
        isBraking,
        throttle: throttleInput,
        position: rs.position,
        lap: rs.lap,
        totalTime: rs.totalTime,
        lapTime: rs.currentLapTime,
        bestLap: rs.bestLapTime,
        driftScore: rs.driftScore,
        countdown: rs.countdown,
        status: rs.status,
        trackProgress: (rs.distanceAlongTrack % 1400) / 1400,
        aiProgress: gameState.opponents.map((ai) => (ai.distanceAlongTrack % 1400) / 1400),
        trailingCars: trailing,
      });

      animId = requestAnimationFrame(updateHud);
    };

    animId = requestAnimationFrame(updateHud);
    return () => cancelAnimationFrame(animId);
  }, [lastCountdownSound]);

  // Handle countdown ticks on mount
  useEffect(() => {
    if (gameState.raceState.status !== 'countdown') return;

    let count = 3;
    gameState.raceState.countdown = 3;

    const interval = setInterval(() => {
      count--;
      if (count >= 0) {
        gameState.raceState.countdown = count;
      }
      if (count === 0) {
        gameState.raceState.status = 'racing';
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds * 100) % 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Speed-based dynamic motion blur
  const speedRatio = Math.max(0, Math.min(1, hudData.speed / 260));
  const motionBlurDist = Math.max(1, Math.min(8, speedRatio * 6 + (hudData.isNitro ? 3 : 0)));
  const isRedline = hudData.rpm > 6600;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between p-3.5 sm:p-5 overflow-hidden cockpit-scanlines">
      {/* Nitro Screen Edge Speed Lines */}
      {hudData.isNitro && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-cyan-500/20 via-blue-500/5 to-transparent animate-pulse" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-cyan-500/20 via-blue-500/5 to-transparent animate-pulse" />
        </div>
      )}

      {/* 3... 2... 1... GO! Clean Glass Countdown */}
      {hudData.status === 'countdown' && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="glass-cockpit-panel px-10 py-6 rounded-3xl text-center shadow-2xl border border-white/20">
            <span
              className={`text-8xl sm:text-9xl font-black italic tracking-wider font-display motion-blur-text block ${
                hudData.countdown === 0 ? 'text-emerald-400' : 'text-cyan-400'
              }`}
              style={{ '--mb-dist': '4px' } as React.CSSProperties}
            >
              {hudData.countdown === 0 ? 'GO!' : hudData.countdown}
            </span>
            <div className="text-[11px] font-mono font-bold tracking-widest text-slate-300 uppercase mt-2">
              REV TO ACCELERATE · PRESS [W]
            </div>
          </div>
        </div>
      )}

      {/* ================= TOP TELEMETRY BAR ================= */}
      <div className="w-full flex items-start justify-between z-10 gap-3">
        {/* Top-Left: Clean Position & Lap Counter Pill */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            {/* Clean Position Badge */}
            <div className="glass-cockpit-panel px-3.5 py-1.5 rounded-xl flex items-center gap-2 border border-white/10 shadow-lg">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">POS</span>
                <span className="text-xl sm:text-2xl font-black font-display text-amber-400 leading-none">
                  {hudData.position}
                </span>
                <span className="text-xs text-slate-400 font-mono">/4</span>
              </div>
            </div>

            {/* Clean Lap Counter Badge */}
            <div className="glass-cockpit-panel px-3.5 py-1.5 rounded-xl flex items-center gap-2 border border-white/10 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-ping" />
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">LAP</span>
                <span className="text-xl sm:text-2xl font-black font-display text-white leading-none motion-blur-lap">
                  {hudData.lap}
                </span>
                <span className="text-xs text-slate-400 font-mono">/{totalLaps}</span>
              </div>
            </div>
          </div>

          {/* Minimalist Live Rivals Strip */}
          <div className="hidden sm:flex items-center gap-2 glass-cockpit-panel px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-mono">
            <span className="text-emerald-400 font-bold">P1 YOU</span>
            <span className="text-slate-600">|</span>
            {gameState.opponents.slice(0, 2).map((ai, idx) => (
              <span key={ai.id} className="text-slate-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ai.color }} />
                <span>{ai.name}</span>
                <span className="text-slate-400">+{Math.round((idx + 1) * 1.4)}s</span>
              </span>
            ))}
          </div>
        </div>

        {/* Top-Center: Realistic Racing Rear-View Mirror */}
        <div className="flex flex-col items-center">
          <div className="glass-cockpit-panel relative w-48 sm:w-56 h-9 rounded-xl flex items-center justify-center border border-white/15 shadow-xl overflow-hidden">
            <div className="absolute inset-x-0 top-1/2 h-px bg-slate-700/40" />
            <div className="absolute top-0.5 left-2 text-[7px] font-mono text-cyan-400/80 uppercase">
              REAR MIRROR
            </div>

            {hudData.trailingCars.length === 0 ? (
              <span className="text-[9px] uppercase font-mono font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Eye className="w-3 h-3 text-cyan-400" />
                CLEAR
              </span>
            ) : (
              <div className="flex items-center gap-2 z-10">
                {hudData.trailingCars.slice(0, 2).map((car, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded border border-white/10"
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: car.color }} />
                    <span className="text-[9px] font-bold text-white uppercase">{car.name}</span>
                    <span className="text-[8px] font-mono text-amber-400">{car.dist}m</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clean Level Tag */}
          {level && (
            <div className="mt-1 text-[9px] uppercase font-mono font-semibold text-cyan-300 glass-cockpit-panel px-2.5 py-0.5 rounded-full border border-cyan-500/30">
              {level.name}
            </div>
          )}
        </div>

        {/* Top-Right: Clean Time, Camera Button & Pause */}
        <div className="flex items-center gap-2">
          {/* Lap Time */}
          <div className="glass-cockpit-panel px-3.5 py-1.5 rounded-xl text-right border border-white/10 shadow-lg">
            <div className="text-[9px] uppercase font-mono font-bold text-slate-400 flex items-center justify-end gap-1">
              <Timer className="w-3 h-3 text-cyan-400" />
              TIME
            </div>
            <div className="text-lg sm:text-xl font-mono-numbers font-bold text-cyan-300 leading-none mt-0.5">
              {formatTime(hudData.totalTime)}
            </div>
          </div>

          {/* Camera View Switcher Button [C] */}
          {onCycleCamera && (
            <button
              onClick={() => {
                audioManager.playClick();
                onCycleCamera();
              }}
              className="pointer-events-auto glass-cockpit-panel hover:bg-slate-900/60 active:scale-95 p-2 rounded-xl transition-all shadow-lg text-slate-300 hover:text-cyan-400 flex flex-col items-center cursor-pointer border border-white/15"
              title="Switch Camera View [C]"
              aria-label="Switch Camera View"
            >
              <Camera className="w-4 h-4 text-cyan-400" />
              <span className="text-[8px] font-mono font-bold uppercase text-slate-300">
                {currentCameraView === 'low_rear'
                  ? 'LOW'
                  : currentCameraView === 'close'
                  ? 'CLOSE'
                  : currentCameraView === 'far'
                  ? 'FAR'
                  : 'NORM'}
              </span>
            </button>
          )}

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="pointer-events-auto glass-cockpit-panel hover:bg-slate-900/60 active:scale-95 p-2 rounded-xl transition-all shadow-lg text-white cursor-pointer border border-white/15"
            aria-label="Pause Game"
          >
            <Pause className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Drift Points notification pop-in */}
      {hudData.driftScore > 0 && (
        <div className="self-center">
          <div
            className={`glass-cockpit-panel px-4 py-1.5 rounded-xl border transition-all ${
              hudData.isDrifting
                ? 'border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-105'
                : 'text-slate-400'
            }`}
          >
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest mr-2">DRIFT</span>
            <span className="text-lg font-black font-mono-numbers">
              +{hudData.driftScore.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* ================= BOTTOM TELEMETRY SECTION ================= */}
      <div className="w-full flex items-end justify-between z-10 gap-3">
        {/* Bottom-Left: Clean Circular Circuit Radar */}
        <div className="glass-cockpit-panel p-2.5 rounded-2xl shadow-xl flex flex-col justify-between w-36 sm:w-40 h-36 sm:h-40 border border-white/10">
          <div className="flex items-center justify-between text-[8px] uppercase font-mono font-bold text-slate-400 tracking-wider">
            <span className="text-cyan-400">TRACK GPS</span>
            <span className="text-emerald-400 font-bold">● LIVE</span>
          </div>

          {/* Track Spline Loop SVG Radar */}
          <div className="relative w-full h-20 my-auto">
            <svg className="w-full h-full" viewBox="0 0 160 80">
              <path
                d="M 25,40 C 25,18 45,15 80,15 C 115,15 135,22 135,42 C 135,62 105,65 75,65 C 45,65 25,62 25,40 Z"
                fill="none"
                stroke="rgba(30, 41, 59, 0.7)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M 25,40 C 25,18 45,15 80,15 C 115,15 135,22 135,42 C 135,62 105,65 75,65 C 45,65 25,62 25,40 Z"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
              <line x1="22" y1="36" x2="28" y2="44" stroke="#ffffff" strokeWidth="2.5" />
            </svg>

            {/* AI Opponent dots */}
            {hudData.aiProgress.map((prog, idx) => {
              const angle = prog * Math.PI * 2;
              const x = 50 + Math.sin(angle) * 38;
              const y = 50 - Math.cos(angle) * 32;
              return (
                <div
                  key={idx}
                  className="absolute w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e] -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${x}%`, top: `${y}%` }}
                />
              );
            })}

            {/* Player triangular arrow marker */}
            {(() => {
              const pAngle = hudData.trackProgress * Math.PI * 2;
              const px = 50 + Math.sin(pAngle) * 38;
              const py = 50 - Math.cos(pAngle) * 32;
              return (
                <div
                  className="absolute w-3 h-3 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_10px_#38bdf8] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                  style={{ left: `${px}%`, top: `${py}%` }}
                >
                  <div className="w-0.5 h-0.5 bg-slate-950 rounded-full" />
                </div>
              );
            })()}
          </div>

          {/* Minimalist Throttle & Brake Pedals */}
          <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800/80 text-[8px] font-mono">
            <div>
              <div className="flex justify-between text-slate-400 mb-0.5">
                <span>THR</span>
                <span className="text-emerald-400 font-bold">{hudData.throttle}%</span>
              </div>
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-75 shadow-[0_0_6px_#10b981]"
                  style={{ width: `${hudData.throttle}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-slate-400 mb-0.5">
                <span>BRK</span>
                <span className="text-rose-400 font-bold">{hudData.isBraking ? '100%' : '0%'}</span>
              </div>
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-rose-500 transition-all duration-75 ${
                    hudData.isBraking ? 'w-full shadow-[0_0_6px_#ef4444]' : 'w-0'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom-Right: Realistic Clean Digital Instrument Dash (With Small/Chota Gear Indicator) */}
        <div className="glass-cockpit-panel p-3 sm:p-4 rounded-2xl shadow-xl flex items-center gap-4 border border-white/10">
          {/* Radial Tachometer Arc (Slim & Crisp) */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
            {/* Shift Light Dot Array */}
            <div className="absolute -top-0.5 inset-x-2 flex justify-between gap-1 z-10">
              {[0, 1, 2, 3, 4, 5, 6].map((seg) => {
                const threshold = (seg + 1) * 1100;
                const isLit = hudData.rpm >= threshold - 400;
                const isRed = seg >= 5;
                const isYellow = seg >= 3 && seg < 5;

                return (
                  <div
                    key={seg}
                    className={`h-1 flex-1 rounded-full transition-all duration-75 ${
                      isLit
                        ? isRed
                          ? 'bg-rose-500 shadow-[0_0_8px_#ef4444] animate-pulse'
                          : isYellow
                          ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'
                          : 'bg-emerald-400 shadow-[0_0_6px_#10b981]'
                        : 'bg-slate-800/80'
                    }`}
                  />
                );
              })}
            </div>

            {/* Tachometer SVG Arc */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="rgba(30, 41, 59, 0.6)"
                strokeWidth="5"
                fill="none"
                strokeDasharray="210"
                strokeDashoffset="0"
                strokeLinecap="round"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke={isRedline ? '#ef4444' : '#06b6d4'}
                strokeWidth="5"
                fill="none"
                strokeDasharray="210"
                strokeDashoffset={210 - (hudData.rpm / 8000) * 180}
                strokeLinecap="round"
                className="transition-all duration-75"
              />
            </svg>

            {/* Clean Center: RPM value (RPM displayed in center, Gear neatly placed outside or in compact pill) */}
            <div className="absolute text-center flex flex-col items-center">
              <span className="text-[11px] sm:text-xs font-mono font-bold text-white leading-none">
                {Math.round(hudData.rpm)}
              </span>
              <span className="text-[7px] font-mono uppercase text-slate-400 tracking-wider mt-0.5">
                RPM
              </span>
            </div>
          </div>

          {/* Digital Telemetry: Small Compact Gear Badge + Motion-Blurred Speedometer + NOS */}
          <div className="flex flex-col justify-between h-full min-w-[110px]">
            {/* Top row: Small Compact Gear Pill ("gear ko chota kar do") & Speed Unit */}
            <div className="flex items-center justify-between gap-2 mb-1">
              {/* Compact Sleek Gear Box (Small and neat) */}
              <div
                className={`px-2 py-0.5 rounded-md border flex items-center gap-1 transition-all ${
                  isRedline
                    ? 'bg-rose-950/80 border-rose-500/60 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                    : 'bg-slate-900/90 border-slate-700/80'
                }`}
              >
                <span className="text-[8px] font-mono uppercase text-slate-400 font-bold">GEAR</span>
                <span
                  className={`text-sm sm:text-base font-black font-display leading-none ${
                    isRedline ? 'text-rose-400' : 'text-white'
                  }`}
                >
                  {hudData.gear}
                </span>
              </div>

              <div className="text-[9px] font-mono font-bold text-cyan-400 tracking-wider">
                KM / H
              </div>
            </div>

            {/* Speedometer with Dynamic Motion Blur Trail */}
            <div className="text-right relative">
              {/* Ghost motion-blur layer */}
              <div
                className="absolute inset-0 text-4xl sm:text-5xl font-black font-mono-numbers text-cyan-400/30 select-none pointer-events-none transform -translate-x-1 blur-[1px]"
                aria-hidden="true"
              >
                {hudData.speed}
              </div>

              {/* Primary Speed Digit */}
              <div
                className="text-4xl sm:text-5xl font-black font-mono-numbers text-white tracking-tight leading-none motion-blur-text relative z-10"
                style={{ '--mb-dist': `${motionBlurDist}px` } as React.CSSProperties}
              >
                {hudData.speed}
              </div>
            </div>

            {/* Slim Clean NOS Boost Bar */}
            <div className="mt-2 bg-slate-950/80 border border-slate-800/80 px-2 py-1.5 rounded-lg">
              <div className="flex items-center justify-between text-[8px] font-mono font-bold mb-1">
                <span className="flex items-center gap-1 text-cyan-400">
                  <Flame className="w-2.5 h-2.5 fill-cyan-400" />
                  NOS
                </span>
                <span className="font-mono-numbers text-slate-300">{hudData.nitro}%</span>
              </div>
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-75 ${
                    hudData.isNitro
                      ? 'bg-gradient-to-r from-cyan-400 via-sky-200 to-white shadow-[0_0_8px_#38bdf8]'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-400'
                  }`}
                  style={{ width: `${hudData.nitro}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
