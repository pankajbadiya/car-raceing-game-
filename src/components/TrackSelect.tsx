import React from 'react';
import { ArrowLeft, Check, Trophy, Flag, Sparkles } from 'lucide-react';
import { ENVIRONMENTS } from '../game/TrackData';
import { audioManager } from '../game/AudioManager';
import { EnvironmentType, PlayerStats } from '../types/game';

interface TrackSelectProps {
  playerStats: PlayerStats;
  onSelectTrack: (env: EnvironmentType) => void;
  onBack: () => void;
}

export const TrackSelect: React.FC<TrackSelectProps> = ({
  playerStats,
  onSelectTrack,
  onBack,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds * 100) % 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 z-40 bg-slate-950 flex flex-col justify-between overflow-y-auto select-none">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
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
          SELECT CIRCUIT
        </h1>

        <div className="w-24" /> {/* Spacer */}
      </header>

      {/* Main Track Grid */}
      <div className="max-w-6xl mx-auto w-full px-6 py-8 flex-1">
        <div className="text-center mb-8">
          <p className="text-xs uppercase font-bold tracking-widest text-cyan-400 mb-2">
            3 High-Speed Championship Tracks
          </p>
          <h2 className="text-3xl sm:text-4xl font-black italic font-display text-white">
            CHOOSE YOUR DESTINATION
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ENVIRONMENTS.map((env) => {
            const isSelected = playerStats.selectedEnvironment === env.id;
            const bestRecord = playerStats.bestTimes[env.id];

            return (
              <div
                key={env.id}
                onClick={() => {
                  audioManager.playClick();
                  onSelectTrack(env.id);
                }}
                className={`group cursor-pointer rounded-3xl overflow-hidden border transition-all duration-300 relative flex flex-col justify-between bg-slate-900/80 ${
                  isSelected
                    ? 'border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.35)] scale-[1.02]'
                    : 'border-slate-800 hover:border-slate-600 hover:shadow-xl'
                }`}
              >
                {/* Track Thumbnail Image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                  <img
                    src={env.bgImage}
                    alt={env.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Difficulty Tag */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 text-[11px] font-bold text-slate-200 uppercase">
                    {env.difficulty}
                  </div>

                  {/* Laps Tag */}
                  <div className="absolute top-3 right-3 bg-cyan-950/80 backdrop-blur-md px-3 py-1 rounded-xl border border-cyan-500/30 text-[11px] font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                    <Flag className="w-3 h-3" />
                    {env.laps} LAPS
                  </div>
                </div>

                {/* Track Info */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-black italic font-display text-white group-hover:text-cyan-400 transition-colors">
                      {env.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {env.description}
                    </p>
                  </div>

                  {/* Best Record */}
                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      Best Record:
                    </div>
                    <div className="text-sm font-bold font-mono-numbers text-amber-300">
                      {bestRecord ? formatTime(bestRecord) : 'NO RECORD'}
                    </div>
                  </div>

                  {/* Selection Button */}
                  <div className="mt-5">
                    {isSelected ? (
                      <div className="w-full py-3 rounded-2xl bg-cyan-500/20 border border-cyan-500/60 text-cyan-300 font-bold font-display text-xs tracking-wider flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" />
                        ACTIVE TRACK
                      </div>
                    ) : (
                      <div className="w-full py-3 rounded-2xl bg-slate-800 group-hover:bg-cyan-500 text-slate-300 group-hover:text-slate-950 font-bold font-display text-xs tracking-wider text-center transition-all">
                        SELECT CIRCUIT
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
