import React, { useState, useEffect, useCallback } from 'react';
import { GameCanvas } from './game/GameCanvas';
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { PauseMenu } from './components/PauseMenu';
import { RaceResult } from './components/RaceResult';
import { CarGarage } from './components/CarGarage';
import { TrackSelect } from './components/TrackSelect';
import { LevelSelect } from './components/LevelSelect';
import { SettingsModal } from './components/SettingsModal';
import { MobileControls } from './components/MobileControls';
import { gameState } from './game/GameState';
import { audioManager } from './game/AudioManager';
import { CAR_SPECS, ENVIRONMENTS, LEVELS } from './game/TrackData';
import { GameScreen, PlayerStats, GameSettings, EnvironmentType, LevelSpec } from './types/game';

const LOCAL_STORAGE_KEY = 'neon_street_racing_save_v2';
const SETTINGS_STORAGE_KEY = 'neon_street_racing_settings_v2';

const ALL_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const DEFAULT_STATS: PlayerStats = {
  coins: 1000,
  score: 0,
  selectedCarId: 'street_gt',
  selectedColor: '#f8fafc', // Pearl White like the reference sports coupe
  selectedEnvironment: 'jungle',
  unlockedCars: ['street_gt', 'thunder'],
  unlockedEnvironments: ['jungle', 'neon_city', 'desert', 'night_highway'],
  bestTimes: {},
  racesCompleted: 0,
  racesWon: 0,
  currentLevel: 1,
  unlockedLevels: ALL_LEVELS,
  levelStars: {},
};

const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.8,
  sfxVolume: 0.8,
  engineVolume: 0.8,
  rain: false,
  difficulty: 'normal',
  cameraDistance: 'low_rear', // Default to reference photo's low-slung close chase cam
  touchControls: true,
};

export default function App() {
  // Screen state
  const [screen, setScreen] = useState<GameScreen>('main_menu');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [raceKey, setRaceKey] = useState(1);
  const [activeLevel, setActiveLevel] = useState<LevelSpec | null>(null);

  // Result state
  const [lastResult, setLastResult] = useState<{
    position: number;
    totalTime: number;
    bestLapTime: number | null;
    score: number;
    coinsEarned: number;
    starsEarned?: number;
    levelName?: string;
  } | null>(null);

  // Player Stats with localStorage persistence
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_STATS,
          ...parsed,
          unlockedLevels: ALL_LEVELS, // Ensure all levels are always unlocked
        };
      }
    } catch {}
    return DEFAULT_STATS;
  });

  // Settings with localStorage persistence
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_SETTINGS;
  });

  // Save stats on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(playerStats));
    } catch {}
  }, [playerStats]);

  // Save settings on change
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const updateStats = useCallback((patch: Partial<PlayerStats>) => {
    setPlayerStats((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateSettings = useCallback((patch: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleResetProgress = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setPlayerStats(DEFAULT_STATS);
  }, []);

  // Selected Car and Environment
  const activeCar =
    CAR_SPECS.find((c) => c.id === playerStats.selectedCarId) || CAR_SPECS[0];
  const activeEnv =
    ENVIRONMENTS.find((e) => e.id === playerStats.selectedEnvironment) || ENVIRONMENTS[0];

  const cycleCamera = useCallback(() => {
    setSettings((prev) => {
      const modes: ('low_rear' | 'close' | 'normal' | 'far')[] = ['low_rear', 'close', 'normal', 'far'];
      const nextIdx = (modes.indexOf(prev.cameraDistance) + 1) % modes.length;
      return { ...prev, cameraDistance: modes[nextIdx] };
    });
  }, []);

  // Quick race start
  const startQuickRace = useCallback(() => {
    setActiveLevel(null);
    audioManager.init();
    audioManager.resume();
    gameState.initRace(activeEnv.laps);
    setRaceKey((k) => k + 1);
    setScreen('racing');
  }, [activeEnv.laps]);

  // Campaign level start
  const startLevel = useCallback((level: LevelSpec) => {
    setActiveLevel(level);
    updateStats({ selectedEnvironment: level.environment });
    updateSettings({ rain: level.rain });

    // Set AI opponents difficulty factor according to level
    gameState.opponents.forEach((ai) => {
      ai.skillLevel = level.aiDifficulty;
    });

    audioManager.init();
    audioManager.resume();
    gameState.initRace(level.laps);
    setRaceKey((k) => k + 1);
    setScreen('racing');
  }, [updateStats, updateSettings]);

  // Race Finish Callback
  useEffect(() => {
    gameState.onRaceFinish = (result) => {
      const isPodium = result.position <= 3;
      let starsEarned = 0;

      if (activeLevel) {
        if (result.position === 1 && result.totalTime <= activeLevel.targetTimeSeconds) {
          starsEarned = 3;
        } else if (result.position === 1 || result.position === 2) {
          starsEarned = 2;
        } else if (result.position === 3) {
          starsEarned = 1;
        }

        setLastResult({
          ...result,
          starsEarned,
          levelName: activeLevel.name,
        });

        // Update level unlocks & stars
        setPlayerStats((prev) => {
          const newUnlockedLevels = [...prev.unlockedLevels];
          if (isPodium && activeLevel.id < 10) {
            const nextLvlId = activeLevel.id + 1;
            if (!newUnlockedLevels.includes(nextLvlId)) {
              newUnlockedLevels.push(nextLvlId);
            }
          }

          const existingStars = prev.levelStars[activeLevel.id] || 0;
          const bestStars = Math.max(existingStars, starsEarned);
          const levelReward = isPodium ? activeLevel.rewardCoins : 50;

          return {
            ...prev,
            coins: prev.coins + result.coinsEarned + levelReward,
            score: prev.score + result.score,
            racesCompleted: prev.racesCompleted + 1,
            racesWon: result.position === 1 ? prev.racesWon + 1 : prev.racesWon,
            unlockedLevels: newUnlockedLevels,
            levelStars: {
              ...prev.levelStars,
              [activeLevel.id]: bestStars,
            },
          };
        });
      } else {
        setLastResult(result);
        setPlayerStats((prev) => ({
          ...prev,
          coins: prev.coins + result.coinsEarned,
          score: prev.score + result.score,
          racesCompleted: prev.racesCompleted + 1,
          racesWon: result.position === 1 ? prev.racesWon + 1 : prev.racesWon,
        }));
      }

      setScreen('result');
    };
  }, [activeLevel]);

  // Global Keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      audioManager.init();
      audioManager.resume();

      const key = e.key.toLowerCase();

      // Controls
      if (key === 'w' || key === 'arrowup') gameState.inputs.forward = true;
      if (key === 's' || key === 'arrowdown') gameState.inputs.backward = true;
      if (key === 'a' || key === 'arrowleft') gameState.inputs.left = true;
      if (key === 'd' || key === 'arrowright') gameState.inputs.right = true;
      if (key === ' ' || e.code === 'Space') gameState.inputs.nitro = true;
      if (key === 'shift') gameState.inputs.handbrake = true;

      // Pause toggle with P or Escape
      if (key === 'p' || key === 'escape') {
        if (screen === 'racing') {
          audioManager.playClick();
          setScreen('paused');
        } else if (screen === 'paused') {
          audioManager.playClick();
          setScreen('racing');
        }
      }

      // Camera switch with C
      if (key === 'c') {
        audioManager.playClick();
        cycleCamera();
      }

      // Quick restart with R
      if (key === 'r' && (screen === 'racing' || screen === 'paused' || screen === 'result')) {
        if (activeLevel) {
          startLevel(activeLevel);
        } else {
          startQuickRace();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') gameState.inputs.forward = false;
      if (key === 's' || key === 'arrowdown') gameState.inputs.backward = false;
      if (key === 'a' || key === 'arrowleft') gameState.inputs.left = false;
      if (key === 'd' || key === 'arrowright') gameState.inputs.right = false;
      if (key === ' ' || e.code === 'Space') gameState.inputs.nitro = false;
      if (key === 'shift') gameState.inputs.handbrake = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [screen, activeLevel, startLevel, startQuickRace, cycleCamera]);

  const is3DActive = screen === 'racing' || screen === 'paused' || screen === 'result';
  const currentTotalLaps = activeLevel ? activeLevel.laps : activeEnv.laps;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white select-none">
      {/* 3D Game Canvas */}
      {is3DActive && (
        <GameCanvas
          key={raceKey}
          carSpec={activeCar}
          customColor={playerStats.selectedColor || activeCar.defaultColor}
          environment={playerStats.selectedEnvironment}
          settings={settings}
          isPaused={screen === 'paused'}
        />
      )}

      {/* In-Game HUD with camera view cycling */}
      {is3DActive && screen !== 'result' && (
        <HUD
          onPause={() => setScreen('paused')}
          totalLaps={currentTotalLaps}
          level={activeLevel || undefined}
          currentCameraView={settings.cameraDistance}
          onCycleCamera={cycleCamera}
        />
      )}

      {/* Mobile Touch Controls Overlay */}
      {is3DActive && screen === 'racing' && <MobileControls onCycleCamera={cycleCamera} />}

      {/* Main Menu Screen */}
      {screen === 'main_menu' && (
        <MainMenu
          playerStats={playerStats}
          onPlay={startQuickRace}
          onOpenLevels={() => setScreen('levels')}
          onOpenGarage={() => setScreen('garage')}
          onOpenTrackSelect={() => setScreen('track_select')}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onQuickChangeEnv={(env: EnvironmentType) => updateStats({ selectedEnvironment: env })}
        />
      )}

      {/* Campaign Level Selection Screen */}
      {screen === 'levels' && (
        <LevelSelect
          playerStats={playerStats}
          onSelectLevel={(level: LevelSpec) => startLevel(level)}
          onBack={() => setScreen('main_menu')}
        />
      )}

      {/* Car Garage Screen */}
      {screen === 'garage' && (
        <CarGarage
          playerStats={playerStats}
          onUpdateStats={updateStats}
          onBack={() => setScreen('main_menu')}
        />
      )}

      {/* Track Selection Screen */}
      {screen === 'track_select' && (
        <TrackSelect
          playerStats={playerStats}
          onSelectTrack={(env: EnvironmentType) => {
            updateStats({ selectedEnvironment: env });
            setScreen('main_menu');
          }}
          onBack={() => setScreen('main_menu')}
        />
      )}

      {/* Pause Menu Modal */}
      {screen === 'paused' && (
        <PauseMenu
          onResume={() => setScreen('racing')}
          onRestart={() => (activeLevel ? startLevel(activeLevel) : startQuickRace())}
          onMainMenu={() => {
            audioManager.stopEngine();
            setScreen('main_menu');
          }}
          settings={settings}
          onUpdateSettings={updateSettings}
        />
      )}

      {/* Race Result Modal */}
      {screen === 'result' && lastResult && (
        <RaceResult
          result={lastResult}
          hasNextLevel={Boolean(activeLevel && activeLevel.id < 10)}
          onNextLevel={() => {
            if (activeLevel && activeLevel.id < 10) {
              const nextLvl = LEVELS[activeLevel.id]; // 0-indexed in array
              if (nextLvl) startLevel(nextLvl);
            }
          }}
          onReplay={() => (activeLevel ? startLevel(activeLevel) : startQuickRace())}
          onGarage={() => {
            audioManager.stopEngine();
            setScreen('garage');
          }}
          onMainMenu={() => {
            audioManager.stopEngine();
            setScreen('main_menu');
          }}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={updateSettings}
          onClose={() => setIsSettingsOpen(false)}
          onResetProgress={handleResetProgress}
        />
      )}
    </div>
  );
}
