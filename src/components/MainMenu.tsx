import React from 'react';
import { Play, Car, Map, Settings, Coins, Trophy, Zap, Shield, Star, Trees, Sparkles } from 'lucide-react';
import { audioManager } from '../game/AudioManager';
import { CAR_SPECS, ENVIRONMENTS } from '../game/TrackData';
import { PlayerStats, EnvironmentType } from '../types/game';

interface MainMenuProps {
  playerStats: PlayerStats;
  onPlay: () => void;
  onOpenLevels: () => void;
  onOpenGarage: () => void;
  onOpenTrackSelect: () => void;
  onOpenSettings: () => void;
  onQuickChangeEnv: (env: EnvironmentType) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  playerStats,
  onPlay,
  onOpenLevels,
  onOpenGarage,
  onOpenTrackSelect,
  onOpenSettings,
  onQuickChangeEnv,
}) => {
  const currentCar = CAR_SPECS.find((c) => c.id === playerStats.selectedCarId) || CAR_SPECS[0];
  const currentEnv = ENVIRONMENTS.find((e) => e.id === playerStats.selectedEnvironment) || ENVIRONMENTS[0];
  const totalStars = Object.values(playerStats.levelStars || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden">
      {/* Cinematic Background Image with dark vignette */}
      <div className="absolute inset-0 z-0">
        <img
          src={currentEnv.bgImage}
          alt={currentEnv.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover scale-105 filter brightness-[0.45] contrast-125 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-slate-950/80" />
      </div>

      {/* TOP HEADER: Clean Top Bar */}
      <header className="relative z-10 flex items-center justify-between">
        {/* Brand mark */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 via-emerald-400 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
            <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black italic tracking-wider font-display text-white block leading-none">
              NEON STREET RACING
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
              JUNGLE & HIGHWAY CHAMPIONSHIP
            </span>
          </div>
        </div>

        {/* Currency & Stars */}
        <div className="flex items-center gap-3">
          {/* Campaign Stars */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-950/80 border border-amber-500/40 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-bold font-mono-numbers text-amber-300 text-sm">
              {totalStars} / 30
            </span>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-bold font-mono-numbers text-amber-300 text-sm sm:text-base">
              {playerStats.coins.toLocaleString()}
            </span>
          </div>

          <button
            onClick={() => {
              audioManager.playClick();
              onOpenSettings();
            }}
            className="p-2.5 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all backdrop-blur-md shadow-lg cursor-pointer"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* CENTER / HERO SECTION */}
      <div className="relative z-10 max-w-xl my-auto">
        <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-emerald-400 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          NEW: TROPICAL NEON JUNGLE CIRCUIT
        </div>

        <h1 className="text-5xl sm:text-7xl font-black italic tracking-tighter font-display text-white leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
          HIGH OCTANE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-500">
            NIGHT RACING
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed max-w-md">
          Race through bioluminescent rainforest canopies, drift around ancient ruins, and outmaneuver rivals under the city neon lights.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          {/* LEVELS / CAMPAIGN CTA */}
          <button
            onClick={() => {
              audioManager.init();
              audioManager.playClick();
              onOpenLevels();
            }}
            className="w-full sm:w-88 py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 active:scale-95 text-slate-950 font-black font-display text-lg tracking-wider flex items-center justify-center gap-3 transition-all shadow-[0_0_30px_rgba(16,185,129,0.5)] cursor-pointer"
          >
            <Trophy className="w-5 h-5 fill-slate-950" />
            CAMPAIGN LEVELS (1 - 10)
          </button>

          {/* QUICK RACE BUTTON */}
          <button
            onClick={() => {
              audioManager.init();
              audioManager.resume();
              audioManager.playClick();
              onPlay();
            }}
            className="w-full sm:w-88 py-3.5 px-8 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 border border-cyan-500/50 hover:border-cyan-400 text-white font-black font-display text-base tracking-wider flex items-center justify-center gap-3 transition-all shadow-lg cursor-pointer"
          >
            <Play className="w-5 h-5 fill-cyan-400 text-cyan-400" />
            QUICK RACE ({currentEnv.name})
          </button>

          <div className="flex gap-3 w-full sm:w-88">
            <button
              onClick={() => {
                audioManager.init();
                audioManager.playClick();
                onOpenGarage();
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-950/80 hover:bg-slate-900 active:scale-95 border border-slate-800 hover:border-slate-600 text-white font-bold font-display text-sm tracking-wider flex items-center justify-center gap-2 backdrop-blur-md transition-all shadow-lg cursor-pointer"
            >
              <Car className="w-4 h-4 text-cyan-400" />
              GARAGE
            </button>

            <button
              onClick={() => {
                audioManager.init();
                audioManager.playClick();
                onOpenTrackSelect();
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-950/80 hover:bg-slate-900 active:scale-95 border border-slate-800 hover:border-slate-600 text-white font-bold font-display text-sm tracking-wider flex items-center justify-center gap-2 backdrop-blur-md transition-all shadow-lg cursor-pointer"
            >
              <Map className="w-4 h-4 text-emerald-400" />
              TRACKS
            </button>
          </div>
        </div>

        {/* Quick Backdrop Theme Switcher */}
        <div className="mt-6 flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Theme:
          </span>
          {ENVIRONMENTS.map((env) => (
            <button
              key={env.id}
              onClick={() => {
                audioManager.playClick();
                onQuickChangeEnv(env.id);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                playerStats.selectedEnvironment === env.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {env.name}
            </button>
          ))}
        </div>
      </div>

      {/* BOTTOM BAR: Unboxed Clean Career Metadata */}
      <footer className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/60 text-xs text-slate-400">
        {/* Car & Track Active Setup */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-slate-200">
            <span
              className="w-3 h-3 rounded-full border border-white/20"
              style={{ backgroundColor: playerStats.selectedColor || currentCar.defaultColor }}
            />
            <span className="font-bold">{currentCar.name}</span>
          </div>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-emerald-300 font-semibold">{currentEnv.name}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{currentEnv.laps} Laps</span>
        </div>

        {/* Career Stats */}
        <div className="flex items-center gap-3">
          <span>{playerStats.racesCompleted} Races Completed</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-amber-400 font-semibold">{playerStats.racesWon} Victories</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-amber-300 font-semibold">⭐ {totalStars} Stars</span>
        </div>
      </footer>
    </div>
  );
};
