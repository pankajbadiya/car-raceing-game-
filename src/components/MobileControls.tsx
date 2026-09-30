import React from 'react';
import { ArrowLeft, ArrowRight, Zap, Flame, Camera } from 'lucide-react';
import { gameState } from '../game/GameState';

interface MobileControlsProps {
  onCycleCamera?: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ onCycleCamera }) => {
  const handleTouchStart = (key: keyof typeof gameState.inputs) => {
    gameState.inputs[key] = true;
  };

  const handleTouchEnd = (key: keyof typeof gameState.inputs) => {
    gameState.inputs[key] = false;
  };

  return (
    <div className="absolute inset-x-0 bottom-4 pointer-events-none z-20 flex justify-between px-4 sm:px-6 select-none md:hidden items-end">
      {/* Left / Right Steering Buttons */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        <button
          onTouchStart={() => handleTouchStart('left')}
          onTouchEnd={() => handleTouchEnd('left')}
          onMouseDown={() => handleTouchStart('left')}
          onMouseUp={() => handleTouchEnd('left')}
          className="w-15 h-15 rounded-2xl bg-slate-950/85 active:bg-cyan-600/80 border border-slate-700/80 flex items-center justify-center text-white shadow-xl active:scale-95 transition-transform backdrop-blur-md"
          aria-label="Steer Left"
        >
          <ArrowLeft className="w-7 h-7 text-cyan-400" />
        </button>

        <button
          onTouchStart={() => handleTouchStart('right')}
          onTouchEnd={() => handleTouchEnd('right')}
          onMouseDown={() => handleTouchStart('right')}
          onMouseUp={() => handleTouchEnd('right')}
          className="w-15 h-15 rounded-2xl bg-slate-950/85 active:bg-cyan-600/80 border border-slate-700/80 flex items-center justify-center text-white shadow-xl active:scale-95 transition-transform backdrop-blur-md"
          aria-label="Steer Right"
        >
          <ArrowRight className="w-7 h-7 text-cyan-400" />
        </button>
      </div>

      {/* Middle Camera Toggle for Mobile */}
      {onCycleCamera && (
        <button
          onClick={onCycleCamera}
          className="pointer-events-auto w-10 h-10 rounded-xl bg-slate-950/85 border border-slate-700/80 flex items-center justify-center text-cyan-400 active:scale-90 transition-transform shadow-lg mb-2"
          aria-label="Change Camera"
        >
          <Camera className="w-5 h-5" />
        </button>
      )}

      {/* Right Action Pedals: Nitro, Brake, Gas */}
      <div className="flex items-end gap-2.5 pointer-events-auto">
        {/* Nitro Button */}
        <button
          onTouchStart={() => handleTouchStart('nitro')}
          onTouchEnd={() => handleTouchEnd('nitro')}
          onMouseDown={() => handleTouchStart('nitro')}
          onMouseUp={() => handleTouchEnd('nitro')}
          className="w-13 h-13 rounded-2xl bg-blue-600/85 active:bg-cyan-400 border border-cyan-400/80 flex flex-col items-center justify-center text-white shadow-xl active:scale-95 transition-transform backdrop-blur-md"
          aria-label="Nitro Boost"
        >
          <Flame className="w-5 h-5 fill-white text-white" />
          <span className="text-[8px] font-black tracking-widest font-display">NOS</span>
        </button>

        {/* Brake / Reverse Pedal */}
        <button
          onTouchStart={() => handleTouchStart('backward')}
          onTouchEnd={() => handleTouchEnd('backward')}
          onMouseDown={() => handleTouchStart('backward')}
          onMouseUp={() => handleTouchEnd('backward')}
          className="w-13 h-15 rounded-2xl bg-rose-950/85 active:bg-rose-600/80 border border-rose-800/80 flex flex-col items-center justify-center text-white shadow-xl active:scale-95 transition-transform backdrop-blur-md"
          aria-label="Brake or Reverse"
        >
          <span className="text-[9px] font-black font-display text-rose-300">BRAKE</span>
        </button>

        {/* Gas / Throttle Pedal */}
        <button
          onTouchStart={() => handleTouchStart('forward')}
          onTouchEnd={() => handleTouchEnd('forward')}
          onMouseDown={() => handleTouchStart('forward')}
          onMouseUp={() => handleTouchEnd('forward')}
          className="w-15 h-19 rounded-2xl bg-emerald-700/85 active:bg-emerald-500 border border-emerald-500/80 flex flex-col items-center justify-center text-white shadow-2xl active:scale-95 transition-transform backdrop-blur-md"
          aria-label="Accelerate"
        >
          <span className="text-xs font-black font-display text-white tracking-wider">GAS</span>
        </button>
      </div>
    </div>
  );
};
