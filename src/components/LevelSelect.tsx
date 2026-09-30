import React, { useState } from 'react';
import { ArrowLeft, Star, Lock, Play, Trophy, Flag, Clock, Coins, CloudRain, Sparkles } from 'lucide-react';
import { LEVELS, ENVIRONMENTS } from '../game/TrackData';
import { audioManager } from '../game/AudioManager';
import { LevelSpec, PlayerStats } from '../types/game';

interface LevelSelectProps {
  playerStats: PlayerStats;
  onSelectLevel: (level: LevelSpec) => void;
  onBack: () => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  playerStats,
  onSelectLevel,
  onBack,
}) => {
  const [selectedLevelId, setSelectedLevelId] = useState<number>(() => {
    // Default to latest unlocked level
    const maxUnlocked = Math.max(...playerStats.unlockedLevels, 1);
    return maxUnlocked;
  });

  const selectedLevel = LEVELS.find((l) => l.id === selectedLevelId) || LEVELS[0];
  const envSpec = ENVIRONMENTS.find((e) => e.id === selectedLevel.environment) || ENVIRONMENTS[0];
  const isSelectedUnlocked = playerStats.unlockedLevels.includes(selectedLevel.id);

  // Calculate total stars
  const totalStars = Object.values(playerStats.levelStars).reduce((sum, s) => sum + s, 0);

  const formatTargetTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}.00`;
  };

  return (
    <div className="absolute inset-0 z-40 bg-slate-950 flex flex-col justify-between overflow-y-auto select-none">
      {/* Background Graphic */}
      <div className="absolute inset-0 z-0">
        <img
          src={envSpec.bgImage}
          alt="Level Background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover filter brightness-[0.25] blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/95" />
      </div>

      {/* TOP HEADER */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0">
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
          CHAMPIONSHIP LEVELS
        </h1>

        {/* Stars Counter */}
        <div className="flex items-center gap-2 bg-slate-900 border border-amber-500/40 px-4 py-1.5 rounded-2xl shadow-sm">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="font-bold font-mono-numbers text-amber-300 text-sm sm:text-base">
            {totalStars} / 30
          </span>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="relative z-10 max-w-6xl mx-auto w-full px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: 10 Levels Grid */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs uppercase font-bold tracking-widest text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              All 10 Championship Levels Unlocked
            </h2>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              Full Access Unlocked
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {LEVELS.map((lvl) => {
              const isSelected = selectedLevelId === lvl.id;
              const stars = playerStats.levelStars[lvl.id] || 0;

              return (
                <button
                  key={lvl.id}
                  onClick={() => {
                    audioManager.playClick();
                    setSelectedLevelId(lvl.id);
                  }}
                  className={`relative p-3.5 rounded-2xl border text-left flex flex-col justify-between aspect-square transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-emerald-400 bg-emerald-950/40 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-600 hover:bg-slate-850'
                  }`}
                >
                  {/* Top Level Number & Rain tag */}
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xl font-black font-display text-white">
                      #{lvl.id}
                    </span>
                    {lvl.rain ? (
                      <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    )}
                  </div>

                  {/* Level Environment Mini-Tag */}
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 truncate">
                      {lvl.environment === 'jungle'
                        ? 'Jungle'
                        : lvl.environment === 'neon_city'
                        ? 'Neon City'
                        : lvl.environment === 'desert'
                        ? 'Desert'
                        : 'Highway'}
                    </div>

                    {/* Stars Earned */}
                    <div className="flex gap-1 mt-1.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= stars
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Level Briefing Card */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          {/* Environment Banner */}
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden mb-5 border border-slate-800">
            <img
              src={envSpec.bgImage}
              alt={selectedLevel.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 text-[11px] font-bold text-cyan-400 uppercase">
              {envSpec.name}
            </div>
            {selectedLevel.rain && (
              <div className="absolute top-3 right-3 bg-blue-950/80 backdrop-blur-md px-3 py-1 rounded-xl border border-blue-500/40 text-[11px] font-bold text-blue-300 uppercase flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5" />
                Rain Storm
              </div>
            )}
          </div>

          <div className="text-xs uppercase font-bold tracking-widest text-cyan-400 mb-1">
            {selectedLevel.subtitle}
          </div>
          <h3 className="text-2xl font-black italic font-display text-white">
            {selectedLevel.name}
          </h3>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {selectedLevel.description}
          </p>

          {/* Level Objectives & Stats */}
          <div className="space-y-2.5 my-6 pt-4 border-t border-slate-800/80 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2 text-slate-400">
                <Flag className="w-4 h-4 text-cyan-400" />
                Laps to Complete
              </span>
              <span className="font-bold font-mono-numbers text-white">{selectedLevel.laps} LAPS</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4 text-amber-400" />
                3-Star Target Time
              </span>
              <span className="font-bold font-mono-numbers text-amber-300">
                &lt; {formatTargetTime(selectedLevel.targetTimeSeconds)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2 text-slate-400">
                <Coins className="w-4 h-4 text-yellow-400" />
                First-Place Reward
              </span>
              <span className="font-bold font-mono-numbers text-yellow-400">
                +{selectedLevel.rewardCoins} Coins
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2 text-slate-400">
                <Trophy className="w-4 h-4 text-emerald-400" />
                Unlock Requirement
              </span>
              <span className="font-bold text-emerald-400">Finish Podium (Top 3)</span>
            </div>
          </div>

          {/* CTA Action */}
          <div>
            <button
              onClick={() => {
                audioManager.init();
                audioManager.playClick();
                onSelectLevel(selectedLevel);
              }}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 active:scale-95 text-slate-950 font-black font-display text-base tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-[0_0_25px_rgba(16,185,129,0.45)] cursor-pointer"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              RACE LEVEL #{selectedLevel.id}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
