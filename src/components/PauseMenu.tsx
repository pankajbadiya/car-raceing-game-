import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { audioManager } from '../game/AudioManager';
import { GameSettings } from '../types/game';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onMainMenu,
  settings,
  onUpdateSettings,
}) => {
  const handleVolumeChange = (val: number) => {
    onUpdateSettings({ masterVolume: val });
    audioManager.setVolumes(val, settings.sfxVolume, settings.engineVolume);
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-black italic tracking-wider font-display text-white">
            GAME PAUSED
          </h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">
            Take a breather, racer
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3.5 mb-8">
          <button
            onClick={() => {
              audioManager.playClick();
              onResume();
            }}
            className="w-full py-4 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-slate-950 font-black font-display text-lg tracking-wider flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            RESUME RACE
          </button>

          <button
            onClick={() => {
              audioManager.playClick();
              onRestart();
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-850 active:scale-[0.98] border border-slate-700/80 hover:border-slate-500 text-white font-bold font-display text-base tracking-wider flex items-center justify-center gap-3 transition-all"
          >
            <RotateCcw className="w-5 h-5 text-amber-400" />
            RESTART
          </button>

          <button
            onClick={() => {
              audioManager.playClick();
              onMainMenu();
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-850 active:scale-[0.98] border border-slate-700/80 hover:border-slate-500 text-slate-300 hover:text-white font-bold font-display text-base tracking-wider flex items-center justify-center gap-3 transition-all"
          >
            <Home className="w-5 h-5 text-cyan-400" />
            MAIN MENU
          </button>
        </div>

        {/* Quick Volume Slider */}
        <div className="pt-5 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              Audio Volume
            </span>
            <span className="font-mono-numbers">{Math.round(settings.masterVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.masterVolume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Controls Reminder */}
        <div className="mt-5 text-center text-[11px] text-slate-500 font-medium">
          [W / ↑] Gas · [S / ↓] Brake · [A / D] Steer · [SPACE] Nitro
        </div>
      </div>
    </div>
  );
};
