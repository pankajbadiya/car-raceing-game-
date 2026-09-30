export type EnvironmentType = 'neon_city' | 'desert' | 'night_highway' | 'jungle';

export type GameScreen =
  | 'main_menu'
  | 'levels'
  | 'garage'
  | 'track_select'
  | 'settings'
  | 'racing'
  | 'paused'
  | 'result';

export interface LevelSpec {
  id: number;
  name: string;
  subtitle: string;
  environment: EnvironmentType;
  laps: number;
  aiDifficulty: number; // 0.85 (easy) to 1.35 (expert)
  trafficDensity: number; // multiplier
  rain: boolean;
  targetTimeSeconds: number; // for 3-star rating
  rewardCoins: number;
  description: string;
}

export interface CarSpec {
  id: string;
  name: string;
  subtitle: string;
  speed: number;       // 0-100 rating
  acceleration: number;// 0-100 rating
  handling: number;    // 0-100 rating
  nitro: number;       // 0-100 rating
  topSpeedKmh: number; // e.g. 210 km/h
  accelRate: number;   // acceleration factor
  steerRate: number;   // steering responsiveness
  driftFactor: number; // drift slip factor
  cost: number;        // in-game coins
  unlocked: boolean;
  defaultColor: string;
}

export interface EnvironmentSpec {
  id: EnvironmentType;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  laps: number;
  unlocked: boolean;
  cost: number;
  bgImage: string;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  ambientColor: string;
  ambientIntensity: number;
  skyColor: string;
  groundColor: string;
}

export interface GameSettings {
  masterVolume: number; // 0-1
  sfxVolume: number;    // 0-1
  engineVolume: number; // 0-1
  rain: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
  cameraDistance: 'low_rear' | 'close' | 'normal' | 'far';
  touchControls: boolean;
}

export interface PlayerStats {
  coins: number;
  score: number;
  selectedCarId: string;
  selectedColor: string;
  selectedEnvironment: EnvironmentType;
  unlockedCars: string[];
  unlockedEnvironments: string[];
  bestTimes: Record<string, number>; // envId -> ms
  racesCompleted: number;
  racesWon: number;
  // Campaign Level Progression
  currentLevel: number;
  unlockedLevels: number[];
  levelStars: Record<number, number>; // levelId -> 1..3 stars
}

export interface RaceState {
  status: 'countdown' | 'racing' | 'finished';
  countdown: number; // 3, 2, 1, 0
  lap: number;
  totalLaps: number;
  lapTime: number;
  currentLapTime: number;
  bestLapTime: number | null;
  totalTime: number;
  position: number;
  totalRacers: number;
  speed: number; // in km/h
  rpm: number;   // 0 - 8000
  gear: number;  // 1 - 6
  nitroPercent: number; // 0 - 100
  isNitroActive: boolean;
  isDrifting: boolean;
  driftScore: number;
  collisions: number;
  lastCheckpointIndex: number;
  distanceAlongTrack: number; // 0 to trackLength * totalLaps
  placementResult?: number;
  activeLevel?: LevelSpec;
}

export interface VehicleTransform {
  position: [number, number, number];
  rotation: [number, number, number];
  speed: number;
  steerAngle: number;
  isDrifting: boolean;
  isNitro: boolean;
  isBraking: boolean;
}
