import * as THREE from 'three';
import { EnvironmentSpec, EnvironmentType, CarSpec, LevelSpec } from '../types/game';

// Standard cars
export const CAR_SPECS: CarSpec[] = [
  {
    id: 'street_gt',
    name: 'Street GT',
    subtitle: 'Balanced All-Rounder',
    speed: 72,
    acceleration: 74,
    handling: 80,
    nitro: 70,
    topSpeedKmh: 215,
    accelRate: 22,
    steerRate: 2.4,
    driftFactor: 0.92,
    cost: 0,
    unlocked: true,
    defaultColor: '#3b82f6', // Electric Blue
  },
  {
    id: 'thunder',
    name: 'Thunder',
    subtitle: 'V8 American Muscle',
    speed: 82,
    acceleration: 90,
    handling: 65,
    nitro: 75,
    topSpeedKmh: 235,
    accelRate: 28,
    steerRate: 2.1,
    driftFactor: 0.88,
    cost: 450,
    unlocked: false,
    defaultColor: '#f59e0b', // Amber Gold
  },
  {
    id: 'phantom',
    name: 'Phantom',
    subtitle: 'Carbon Aero Supercar',
    speed: 92,
    acceleration: 82,
    handling: 85,
    nitro: 84,
    topSpeedKmh: 260,
    accelRate: 25,
    steerRate: 2.5,
    driftFactor: 0.94,
    cost: 1100,
    unlocked: false,
    defaultColor: '#a855f7', // Neon Violet
  },
  {
    id: 'blaze',
    name: 'Blaze',
    subtitle: 'Apex Drift Specialist',
    speed: 86,
    acceleration: 88,
    handling: 95,
    nitro: 80,
    topSpeedKmh: 245,
    accelRate: 27,
    steerRate: 2.8,
    driftFactor: 0.98,
    cost: 1800,
    unlocked: false,
    defaultColor: '#ef4444', // Inferno Crimson
  },
  {
    id: 'hyper_x',
    name: 'Hyper X',
    subtitle: 'Twin-Turbocharged Hypercar',
    speed: 98,
    acceleration: 96,
    handling: 92,
    nitro: 95,
    topSpeedKmh: 285,
    accelRate: 34,
    steerRate: 2.6,
    driftFactor: 0.95,
    cost: 3200,
    unlocked: false,
    defaultColor: '#06b6d4', // Cyan Plasma
  },
];

// Environments with ultra-realistic automotive backdrops
export const ENVIRONMENTS: EnvironmentSpec[] = [
  {
    id: 'jungle',
    name: 'Neon Jungle',
    description: 'Dense tropical rainforest canopy with ancient mossy ruins, exotic flora, and emerald bioluminescent lights.',
    difficulty: 'Medium',
    laps: 3,
    unlocked: true,
    cost: 0,
    bgImage: '/src/assets/images/bg_realistic_jungle_1790753256749.jpg',
    fogColor: '#032319',
    fogNear: 35,
    fogFar: 260,
    ambientColor: '#10b981',
    ambientIntensity: 0.55,
    skyColor: '#022c22',
    groundColor: '#064e3b',
  },
  {
    id: 'neon_city',
    name: 'Neon City',
    description: 'Towering cybernetic skyscrapers, reflective wet asphalt, and pulsating neon street lights.',
    difficulty: 'Easy',
    laps: 3,
    unlocked: true,
    cost: 0,
    bgImage: '/src/assets/images/bg_realistic_city_1790753293807.jpg',
    fogColor: '#070814',
    fogNear: 40,
    fogFar: 280,
    ambientColor: '#3b82f6',
    ambientIntensity: 0.45,
    skyColor: '#050716',
    groundColor: '#090a14',
  },
  {
    id: 'desert',
    name: 'Desert Highway',
    description: 'High-speed sweeping canyon bends through dramatic red sandstone mesas under blazing golden light.',
    difficulty: 'Medium',
    laps: 3,
    unlocked: true,
    cost: 0,
    bgImage: '/src/assets/images/bg_realistic_desert_1790753308860.jpg',
    fogColor: '#b4683a',
    fogNear: 60,
    fogFar: 360,
    ambientColor: '#fed7aa',
    ambientIntensity: 0.65,
    skyColor: '#ea580c',
    groundColor: '#78350f',
  },
  {
    id: 'night_highway',
    name: 'Night Highway',
    description: 'Moody moonlit coastal expressway bordered by glowing guardrails and distant mountain vistas.',
    difficulty: 'Hard',
    laps: 3,
    unlocked: true,
    cost: 0,
    bgImage: '/src/assets/images/bg_night_highway_1790752299574.jpg',
    fogColor: '#030712',
    fogNear: 50,
    fogFar: 300,
    ambientColor: '#1e293b',
    ambientIntensity: 0.4,
    skyColor: '#020617',
    groundColor: '#0b1120',
  },
];

// 10 Campaign Levels
export const LEVELS: LevelSpec[] = [
  {
    id: 1,
    name: 'Level 1: Rookie Sprint',
    subtitle: 'Neon City Opening Cup',
    environment: 'neon_city',
    laps: 2,
    aiDifficulty: 0.85,
    trafficDensity: 0.6,
    rain: false,
    targetTimeSeconds: 95,
    rewardCoins: 250,
    description: 'A welcoming start on the wide neon boulevard. Master steering and get comfortable with nitro.',
  },
  {
    id: 2,
    name: 'Level 2: Jungle Awakening',
    subtitle: 'Neon Jungle Trial',
    environment: 'jungle',
    laps: 2,
    aiDifficulty: 0.92,
    trafficDensity: 0.7,
    rain: false,
    targetTimeSeconds: 100,
    rewardCoins: 300,
    description: 'Speed through the lush tropical canopy under glowing bioluminescent foliage.',
  },
  {
    id: 3,
    name: 'Level 3: Sandstorm Dash',
    subtitle: 'Desert Canyon Expressway',
    environment: 'desert',
    laps: 2,
    aiDifficulty: 0.98,
    trafficDensity: 0.8,
    rain: false,
    targetTimeSeconds: 98,
    rewardCoins: 350,
    description: 'High-speed sweeping turns through red rock canyon mesas at golden hour.',
  },
  {
    id: 4,
    name: 'Level 4: Midnight Rush',
    subtitle: 'Coastal Highway Moonrun',
    environment: 'night_highway',
    laps: 3,
    aiDifficulty: 1.02,
    trafficDensity: 0.9,
    rain: false,
    targetTimeSeconds: 145,
    rewardCoins: 400,
    description: 'Navigate moonlit straights and elevated overpass bridges at peak highway traffic.',
  },
  {
    id: 5,
    name: 'Level 5: Rainforest Monsoon',
    subtitle: 'Wet Jungle Storm Run',
    environment: 'jungle',
    laps: 3,
    aiDifficulty: 1.06,
    trafficDensity: 1.0,
    rain: true,
    targetTimeSeconds: 152,
    rewardCoins: 480,
    description: 'Drive in torrential rain through slippery tropical bends with reduced tire traction.',
  },
  {
    id: 6,
    name: 'Level 6: Canyon Drift King',
    subtitle: 'Red Mesa Apex Battle',
    environment: 'desert',
    laps: 3,
    aiDifficulty: 1.1,
    trafficDensity: 1.0,
    rain: false,
    targetTimeSeconds: 148,
    rewardCoins: 550,
    description: 'Competitors are aggressive. Execute tight drift angles around the hairpin curve to stay ahead.',
  },
  {
    id: 7,
    name: 'Level 7: Cyberpunk GP',
    subtitle: 'Metropolis Midnight Championship',
    environment: 'neon_city',
    laps: 3,
    aiDifficulty: 1.15,
    trafficDensity: 1.2,
    rain: true,
    targetTimeSeconds: 142,
    rewardCoins: 650,
    description: 'Wet reflective asphalt beneath glowing skyscrapers with intense rival overtakes.',
  },
  {
    id: 8,
    name: 'Level 8: Ancient Ruins Sprint',
    subtitle: 'Lost Temple Expressway',
    environment: 'jungle',
    laps: 4,
    aiDifficulty: 1.2,
    trafficDensity: 1.1,
    rain: false,
    targetTimeSeconds: 195,
    rewardCoins: 750,
    description: 'Race past ancient overgrown stone pillars and temple ruins at blistering hypercar speeds.',
  },
  {
    id: 9,
    name: 'Level 9: Phantom Expressway',
    subtitle: 'Night Highway Heavy Traffic',
    environment: 'night_highway',
    laps: 4,
    aiDifficulty: 1.25,
    trafficDensity: 1.3,
    rain: true,
    targetTimeSeconds: 190,
    rewardCoins: 900,
    description: 'Dense civilian traffic in stormy night conditions. Near-miss dodging is vital.',
  },
  {
    id: 10,
    name: 'Level 10: Grand Championship Finale',
    subtitle: 'All-Stars Final Showdown',
    environment: 'jungle',
    laps: 5,
    aiDifficulty: 1.32,
    trafficDensity: 1.2,
    rain: true,
    targetTimeSeconds: 240,
    rewardCoins: 1500,
    description: 'The ultimate 5-lap endurance showdown through the neon rainforest against master AI racers.',
  },
];

export const ROAD_WIDTH = 20; // 20 units total road width
export const NUM_LANES = 4;
export const LANE_WIDTH = ROAD_WIDTH / NUM_LANES; // 5 units per lane

// Spline Control Points defining the 3D circuit
const CONTROL_POINTS: [number, number, number][] = [
  // Start / Finish straight (Z negative heading)
  [0, 0, 0],
  [0, 0, -80],
  [0, 0, -180],
  [15, 1, -260],
  // Turn 1: High speed right sweeper
  [60, 4, -340],
  [140, 8, -400],
  [240, 8, -430],
  [330, 4, -400],
  // Back straight with dip
  [410, 0, -320],
  [450, -4, -200],
  [460, -6, -80],
  // Turn 2: Chicane / S-curve
  [440, -4, 20],
  [390, -2, 90],
  [420, 0, 170],
  // Tunnel entrance & descent
  [380, -2, 260],
  [290, -6, 330],
  [180, -8, 360], // Inside tunnel lowest point
  [80, -5, 360],
  // Tunnel exit & climb
  [-20, -1, 330],
  [-110, 4, 270],
  // Mountain / Bridge section
  [-180, 8, 190],
  [-220, 10, 100],
  [-230, 8, 10],
  // Final hairpin into home straight
  [-210, 4, -80],
  [-160, 2, -140],
  [-90, 0, -90],
  [-40, 0, -40],
];

export class CircuitTrack {
  public curve: THREE.CatmullRomCurve3;
  public totalLength: number;
  public sampleCount = 600;
  public samples: {
    point: THREE.Vector3;
    tangent: THREE.Vector3;
    normal: THREE.Vector3;
    binormal: THREE.Vector3;
    distance: number;
    t: number;
  }[] = [];

  // Tunnel bounds (distance along track)
  public tunnelStartDist = 0;
  public tunnelEndDist = 0;

  constructor() {
    const vectors = CONTROL_POINTS.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
    this.curve = new THREE.CatmullRomCurve3(vectors, true, 'centripetal', 0.5);
    this.totalLength = this.curve.getLength();

    // Pre-sample points along the curve for fast lookup
    const up = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i <= this.sampleCount; i++) {
      const t = i / this.sampleCount;
      const point = this.curve.getPointAt(t);
      const tangent = this.curve.getTangentAt(t).normalize();
      const binormal = new THREE.Vector3().crossVectors(tangent, up).normalize();
      const normal = new THREE.Vector3().crossVectors(binormal, tangent).normalize();
      const distance = t * this.totalLength;

      this.samples.push({
        point,
        tangent,
        normal,
        binormal,
        distance,
        t,
      });
    }

    this.tunnelStartDist = this.totalLength * 0.58;
    this.tunnelEndDist = this.totalLength * 0.74;
  }

  public getSampleAtDistance(dist: number) {
    const wrappedDist = ((dist % this.totalLength) + this.totalLength) % this.totalLength;
    const t = wrappedDist / this.totalLength;
    const idxFloat = t * this.sampleCount;
    const idx = Math.floor(idxFloat) % this.sampleCount;
    const nextIdx = (idx + 1) % this.sampleCount;
    const frac = idxFloat - idx;

    const s1 = this.samples[idx];
    const s2 = this.samples[nextIdx];

    const point = new THREE.Vector3().lerpVectors(s1.point, s2.point, frac);
    const tangent = new THREE.Vector3().lerpVectors(s1.tangent, s2.tangent, frac).normalize();
    const normal = new THREE.Vector3().lerpVectors(s1.normal, s2.normal, frac).normalize();
    const binormal = new THREE.Vector3().lerpVectors(s1.binormal, s2.binormal, frac).normalize();

    return {
      point,
      tangent,
      normal,
      binormal,
      distance: wrappedDist,
      t,
    };
  }

  public findClosestDistance(pos: THREE.Vector3, hintDist?: number): number {
    let bestDist = 0;
    let minSqDist = Infinity;

    if (hintDist !== undefined) {
      const centerT = hintDist / this.totalLength;
      const centerIdx = Math.floor(centerT * this.sampleCount);
      const range = 40;

      for (let offset = -range; offset <= range; offset++) {
        const idx = ((centerIdx + offset) % this.sampleCount + this.sampleCount) % this.sampleCount;
        const dSq = this.samples[idx].point.distanceToSquared(pos);
        if (dSq < minSqDist) {
          minSqDist = dSq;
          bestDist = this.samples[idx].distance;
        }
      }
      return bestDist;
    }

    for (let i = 0; i < this.sampleCount; i += 4) {
      const dSq = this.samples[i].point.distanceToSquared(pos);
      if (dSq < minSqDist) {
        minSqDist = dSq;
        bestDist = this.samples[i].distance;
      }
    }

    const bestIdx = Math.floor((bestDist / this.totalLength) * this.sampleCount);
    for (let offset = -4; offset <= 4; offset++) {
      const idx = ((bestIdx + offset) % this.sampleCount + this.sampleCount) % this.sampleCount;
      const dSq = this.samples[idx].point.distanceToSquared(pos);
      if (dSq < minSqDist) {
        minSqDist = dSq;
        bestDist = this.samples[idx].distance;
      }
    }

    return bestDist;
  }

  public isInsideTunnel(dist: number): boolean {
    const wrapped = ((dist % this.totalLength) + this.totalLength) % this.totalLength;
    return wrapped >= this.tunnelStartDist && wrapped <= this.tunnelEndDist;
  }
}

export const trackInstance = new CircuitTrack();
