import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, Coins, RotateCcw, Home, Car, Star, ArrowRight } from 'lucide-react';
import { audioManager } from '../game/AudioManager';

interface RaceResultProps {
  result: {
    position: number;
    totalTime: number;
    bestLapTime: number | null;
    score: number;
    coinsEarned: number;
    starsEarned?: number;
    levelName?: string;
  };
  hasNextLevel?: boolean;
  onNextLevel?: () => void;
  onReplay: () => void;
  onGarage: () => void;
  onMainMenu: () => void;
}

export const RaceResult: React.FC<RaceResultProps> = ({
  result,
  hasNextLevel = false,
  onNextLevel,
  onReplay,
  onGarage,
  onMainMenu,
}) => {
  useEffect(() => {
    // Launch celebratory confetti if podium finish
    if (result.position <= 3) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#3b82f6', '#f59e0b', '#10b981', '#ffffff'],
        });
      } catch {}
    }
  }, [result.position]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds * 100) % 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const isWin = result.position === 1;
  const isPodium = result.position <= 3;
  const stars = result.starsEarned || (isWin ? 3 : result.position === 2 ? 2 : result.position === 3 ? 1 : 0);

  return (
    <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Top Glow */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
            isWin ? 'bg-amber-500/20' : isPodium ? 'bg-cyan-500/20' : 'bg-slate-700/20'
          }`}
        />

        {/* Title & Position Banner */}
        <div className="text-center mb-6">
          <div className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-1">
            {result.levelName
              ? result.levelName
              : isWin
              ? 'CHAMPION OF THE TRACK'
              : isPodium
              ? 'PODIUM FINISH'
              : 'RACE COMPLETED'}
          </div>
          <h2 className="text-4xl sm:text-5xl font-black italic tracking-wide font-display text-white">
            {isWin ? '1ST PLACE' : result.position === 2 ? '2ND PLACE' : result.position === 3 ? '3RD PLACE' : '4TH PLACE'}
          </h2>

          {/* Stars rating display */}
          <div className="flex items-center justify-center gap-2 mt-3">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`w-7 h-7 ${
                  s <= stars
                    ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                    : 'text-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Race Stats Bento */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Total Time */}
          <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
              <Clock className="w-4 h-4 text-cyan-400" />
              Total Time
            </div>
            <div className="text-2xl font-bold font-mono-numbers text-cyan-300 mt-1">
              {formatTime(result.totalTime)}
            </div>
          </div>

          {/* Best Lap */}
          <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
              <Trophy className="w-4 h-4 text-amber-400" />
              Best Lap
            </div>
            <div className="text-2xl font-bold font-mono-numbers text-amber-300 mt-1">
              {result.bestLapTime ? formatTime(result.bestLapTime) : '--:--.--'}
            </div>
          </div>

          {/* Coins Earned */}
          <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
              <Coins className="w-4 h-4 text-yellow-400" />
              Coins Earned
            </div>
            <div className="text-2xl font-bold font-mono-numbers text-yellow-400 mt-1">
              +{result.coinsEarned}
            </div>
          </div>

          {/* Drift & Style Score */}
          <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
              <Trophy className="w-4 h-4 text-emerald-400" />
              Drift Score
            </div>
            <div className="text-2xl font-bold font-mono-numbers text-emerald-400 mt-1">
              +{result.score.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {hasNextLevel && onNextLevel && isPodium ? (
            <button
              onClick={() => {
                audioManager.playClick();
                onNextLevel();
              }}
              className="w-full py-4 px-6 rounded-2xl bg-cyan-400 hover:bg-cyan-300 active:scale-[0.98] text-slate-950 font-black font-display text-lg tracking-wider flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer"
            >
              NEXT LEVEL
              <ArrowRight className="w-5 h-5 text-slate-950" />
            </button>
          ) : (
            <button
              onClick={() => {
                audioManager.playClick();
                onReplay();
              }}
              className="w-full py-4 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-slate-950 font-black font-display text-lg tracking-wider flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer"
            >
              <RotateCcw className="w-5 h-5 fill-slate-950" />
              RACE AGAIN
            </button>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                audioManager.playClick();
                onGarage();
              }}
              className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-850 active:scale-[0.98] border border-slate-700/80 hover:border-slate-500 text-white font-bold font-display text-sm tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Car className="w-4 h-4 text-cyan-400" />
              GARAGE
            </button>

            <button
              onClick={() => {
                audioManager.playClick();
                onMainMenu();
              }}
              className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-850 active:scale-[0.98] border border-slate-700/80 hover:border-slate-500 text-slate-300 hover:text-white font-bold font-display text-sm tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4 text-slate-400" />
              MAIN MENU
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
