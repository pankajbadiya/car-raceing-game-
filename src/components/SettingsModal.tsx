import React from 'react';
import { X, Volume2, CloudRain, Eye, Gauge, Keyboard, RotateCcw } from 'lucide-react';
import { audioManager } from '../game/AudioManager';
import { GameSettings } from '../types/game';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
  onResetProgress: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  onResetProgress,
}) => {
  const handleVolumeChange = (type: 'master' | 'sfx' | 'engine', val: number) => {
    const update: Partial<GameSettings> = {};
    if (type === 'master') update.masterVolume = val;
    if (type === 'sfx') update.sfxVolume = val;
    if (type === 'engine') update.engineVolume = val;

    onUpdateSettings(update);
    audioManager.setVolumes(
      type === 'master' ? val : settings.masterVolume,
      type === 'sfx' ? val : settings.sfxVolume,
      type === 'engine' ? val : settings.engineVolume
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            audioManager.playClick();
            onClose();
          }}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl sm:text-3xl font-black italic tracking-wider font-display text-white mb-6">
          GAME SETTINGS
        </h2>

        {/* Audio Section */}
        <div className="space-y-4 mb-6 pb-6 border-b border-slate-800/80">
          <h3 className="text-xs uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            Audio Levels
          </h3>

          {/* Master Volume */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
              <span>Master Volume</span>
              <span className="font-mono-numbers">{Math.round(settings.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.masterVolume}
              onChange={(e) => handleVolumeChange('master', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Engine Sound */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
              <span>Engine Exhaust Roar</span>
              <span className="font-mono-numbers">{Math.round(settings.engineVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.engineVolume}
              onChange={(e) => handleVolumeChange('engine', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>

        {/* Visuals & Gameplay */}
        <div className="space-y-5 mb-6 pb-6 border-b border-slate-800/80">
          <h3 className="text-xs uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            Gameplay & Visuals
          </h3>

          {/* Rain Option */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-cyan-400" />
                Rain Weather Atmosphere
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Enable dynamic raindrops & wet roadway
              </div>
            </div>
            <button
              onClick={() => {
                audioManager.playClick();
                onUpdateSettings({ rain: !settings.rain });
              }}
              className={`w-13 h-7 rounded-full p-1 transition-colors ${
                settings.rain ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.rain ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Camera Distance */}
          <div>
            <div className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              Camera Distance & Perspective
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(['low_rear', 'close', 'normal', 'far'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    audioManager.playClick();
                    onUpdateSettings({ cameraDistance: mode });
                  }}
                  className={`py-2 rounded-xl text-[11px] font-bold uppercase transition-all ${
                    settings.cameraDistance === mode
                      ? 'bg-cyan-400 text-slate-950 shadow-md font-black'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {mode === 'low_rear' ? 'Low Chase' : mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Controls Guide */}
        <div className="mb-6 pb-6 border-b border-slate-800/80">
          <h3 className="text-xs uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-2 mb-3">
            <Keyboard className="w-4 h-4" />
            Controls Cheat Sheet
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-slate-300">
              <span className="font-bold text-white">[W] / [↑]</span> Accelerate
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-slate-300">
              <span className="font-bold text-white">[S] / [↓]</span> Brake / Reverse
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-slate-300">
              <span className="font-bold text-white">[A / D]</span> Steer Left / Right
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-slate-300">
              <span className="font-bold text-white">[SPACE]</span> Nitro Boost
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-slate-300">
              <span className="font-bold text-white">[C]</span> Switch Camera
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-slate-300">
              <span className="font-bold text-white">[P]</span> Pause Race
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-slate-300">
              <span className="font-bold text-white">[R]</span> Quick Restart
            </div>
          </div>
        </div>

        {/* Reset Progress Button */}
        <div>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all unlocked cars and records?')) {
                onResetProgress();
                onClose();
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 text-rose-300 text-xs font-bold tracking-wider transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            RESET CAREER PROGRESS
          </button>
        </div>
      </div>
    </div>
  );
};
