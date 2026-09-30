import * as THREE from 'three';
import { RaceState, VehicleTransform, EnvironmentType } from '../types/game';
import { trackInstance } from './TrackData';

export interface OpponentData {
  id: string;
  name: string;
  color: string;
  distanceAlongTrack: number;
  totalDistanceTraveled: number;
  speedKmh: number;
  lap: number;
  position: [number, number, number];
  quaternion: [number, number, number, number];
  steerAngle: number;
  isNitro: boolean;
  isBraking: boolean;
  targetLaneOffset: number;
  skillLevel: number; // 0.8 to 1.2
}

export interface TrafficCarData {
  id: number;
  distanceAlongTrack: number;
  speedKmh: number;
  laneOffset: number;
  targetLaneOffset: number;
  position: [number, number, number];
  quaternion: [number, number, number, number];
  color: string;
  modelType: 'sedan' | 'suv' | 'muscle' | 'taxi';
}

class GameStateManager {
  // Player live telemetry
  public playerTransform: VehicleTransform = {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    speed: 0,
    steerAngle: 0,
    isDrifting: false,
    isNitro: false,
    isBraking: false,
  };

  public playerPosVec = new THREE.Vector3();
  public playerForwardVec = new THREE.Vector3(0, 0, -1);
  public playerQuat = new THREE.Quaternion();

  // 3 AI Opponents
  public opponents: OpponentData[] = [
    {
      id: 'ai_1',
      name: 'Viper',
      color: '#ef4444',
      distanceAlongTrack: 20,
      totalDistanceTraveled: 20,
      speedKmh: 0,
      lap: 1,
      position: [0, 0, 0],
      quaternion: [0, 0, 0, 1],
      steerAngle: 0,
      isNitro: false,
      isBraking: false,
      targetLaneOffset: -4,
      skillLevel: 1.05,
    },
    {
      id: 'ai_2',
      name: 'Apex',
      color: '#eab308',
      distanceAlongTrack: 10,
      totalDistanceTraveled: 10,
      speedKmh: 0,
      lap: 1,
      position: [0, 0, 0],
      quaternion: [0, 0, 0, 1],
      steerAngle: 0,
      isNitro: false,
      isBraking: false,
      targetLaneOffset: 4,
      skillLevel: 0.98,
    },
    {
      id: 'ai_3',
      name: 'Shadow',
      color: '#10b981',
      distanceAlongTrack: 0,
      totalDistanceTraveled: 0,
      speedKmh: 0,
      lap: 1,
      position: [0, 0, 0],
      quaternion: [0, 0, 0, 1],
      steerAngle: 0,
      isNitro: false,
      isBraking: false,
      targetLaneOffset: 0,
      skillLevel: 0.92,
    },
  ];

  // Civilian Traffic
  public traffic: TrafficCarData[] = [];

  // Race stats
  public raceState: RaceState = {
    status: 'countdown',
    countdown: 3,
    lap: 1,
    totalLaps: 3,
    lapTime: 0,
    currentLapTime: 0,
    bestLapTime: null,
    totalTime: 0,
    position: 4,
    totalRacers: 4,
    speed: 0,
    rpm: 1000,
    gear: 1,
    nitroPercent: 100,
    isNitroActive: false,
    isDrifting: false,
    driftScore: 0,
    collisions: 0,
    lastCheckpointIndex: 0,
    distanceAlongTrack: 0,
  };

  // Spark effects
  public sparks: { id: number; pos: THREE.Vector3; time: number }[] = [];

  // Mobile/Keyboard inputs
  public inputs = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    nitro: false,
    handbrake: false,
  };

  // Event callbacks
  public onRaceFinish?: (result: {
    position: number;
    totalTime: number;
    bestLapTime: number | null;
    score: number;
    coinsEarned: number;
  }) => void;

  public initRace(totalLaps = 3) {
    this.raceState = {
      status: 'countdown',
      countdown: 3,
      lap: 1,
      totalLaps,
      lapTime: 0,
      currentLapTime: 0,
      bestLapTime: null,
      totalTime: 0,
      position: 4,
      totalRacers: 4,
      speed: 0,
      rpm: 1000,
      gear: 1,
      nitroPercent: 100,
      isNitroActive: false,
      isDrifting: false,
      driftScore: 0,
      collisions: 0,
      lastCheckpointIndex: 0,
      distanceAlongTrack: 0,
    };

    // Grid starting offsets:
    // Pole: AI 1 (-4m lateral, +24m ahead)
    // 2nd: AI 2 (+4m lateral, +16m ahead)
    // 3rd: AI 3 (-4m lateral, +8m ahead)
    // 4th: Player (+4m lateral, 0m start)
    const offsets = [
      { id: 'ai_1', dist: 24, lateral: -4 },
      { id: 'ai_2', dist: 16, lateral: 4 },
      { id: 'ai_3', dist: 8, lateral: -4 },
    ];

    this.opponents.forEach((ai, i) => {
      ai.distanceAlongTrack = offsets[i].dist;
      ai.totalDistanceTraveled = offsets[i].dist;
      ai.speedKmh = 0;
      ai.lap = 1;
      ai.targetLaneOffset = offsets[i].lateral;

      const sample = trackInstance.getSampleAtDistance(ai.distanceAlongTrack);
      const pos = sample.point.clone().addScaledVector(sample.binormal, ai.targetLaneOffset);
      pos.y += 0.45;
      ai.position = [pos.x, pos.y, pos.z];

      const m = new THREE.Matrix4().makeBasis(
        sample.binormal,
        sample.normal,
        sample.tangent.clone().negate()
      );
      const q = new THREE.Quaternion().setFromRotationMatrix(m);
      ai.quaternion = [q.x, q.y, q.z, q.w];
    });

    // Populate initial traffic along circuit
    this.traffic = [];
    const trafficColors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f43f5e', '#e2e8f0', '#fb923c'];
    const models: ('sedan' | 'suv' | 'muscle' | 'taxi')[] = ['sedan', 'suv', 'muscle', 'taxi'];
    const laneOffsets = [-6, -2, 2, 6];

    for (let i = 0; i < 16; i++) {
      const dist = 120 + i * 85;
      const lane = laneOffsets[i % laneOffsets.length];
      const sample = trackInstance.getSampleAtDistance(dist);
      const pos = sample.point.clone().addScaledVector(sample.binormal, lane);
      pos.y += 0.45;

      const m = new THREE.Matrix4().makeBasis(
        sample.binormal,
        sample.normal,
        sample.tangent.clone().negate()
      );
      const q = new THREE.Quaternion().setFromRotationMatrix(m);

      this.traffic.push({
        id: i + 1,
        distanceAlongTrack: dist,
        speedKmh: 65 + Math.random() * 30, // 65-95 km/h
        laneOffset: lane,
        targetLaneOffset: lane,
        position: [pos.x, pos.y, pos.z],
        quaternion: [q.x, q.y, q.z, q.w],
        color: trafficColors[i % trafficColors.length],
        modelType: models[i % models.length],
      });
    }
  }

  public calculatePositions(playerTotalDist: number) {
    // Array of racers with totalDistanceTraveled
    const racers = [
      { id: 'player', dist: playerTotalDist },
      ...this.opponents.map((ai) => ({ id: ai.id, dist: ai.totalDistanceTraveled })),
    ];

    racers.sort((a, b) => b.dist - a.dist);
    const playerRank = racers.findIndex((r) => r.id === 'player') + 1;
    this.raceState.position = playerRank;
  }

  public triggerCollisionSpark(pos: THREE.Vector3) {
    this.sparks.push({
      id: Date.now() + Math.random(),
      pos: pos.clone(),
      time: 0.35,
    });
    this.raceState.collisions++;
  }
}

export const gameState = new GameStateManager();
