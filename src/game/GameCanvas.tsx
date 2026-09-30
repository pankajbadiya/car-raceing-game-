import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Track } from './Track';
import { PlayerCar } from './PlayerCar';
import { AICar } from './AICar';
import { Traffic } from './Traffic';
import { CameraFollow } from './CameraFollow';
import { ParticleEffects } from './ParticleEffects';
import { NeonCityEnvironment } from '../environments/NeonCityEnvironment';
import { DesertEnvironment } from '../environments/DesertEnvironment';
import { NightHighwayEnvironment } from '../environments/NightHighwayEnvironment';
import { JungleEnvironment } from '../environments/JungleEnvironment';
import { gameState } from './GameState';
import { CarSpec, EnvironmentType, GameSettings } from '../types/game';

interface GameCanvasProps {
  carSpec: CarSpec;
  customColor: string;
  environment: EnvironmentType;
  settings: GameSettings;
  isPaused: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  carSpec,
  customColor,
  environment,
  settings,
  isPaused,
}) => {
  return (
    <div className="w-full h-full relative overflow-hidden bg-black">
      <Canvas
        shadows
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
        camera={{ position: [0, 5, 12], fov: 62, near: 0.2, far: 800 }}
      >
        <Suspense fallback={null}>
          {/* Environment Scene */}
          {environment === 'neon_city' && <NeonCityEnvironment />}
          {environment === 'desert' && <DesertEnvironment />}
          {environment === 'night_highway' && <NightHighwayEnvironment />}
          {environment === 'jungle' && <JungleEnvironment />}

          {/* 3D Track & Roadway */}
          <Track environment={environment} />

          {/* Player Car */}
          <PlayerCar
            carSpec={carSpec}
            customColor={customColor}
            isPaused={isPaused}
          />

          {/* AI Racers */}
          {gameState.opponents.map((ai) => (
            <AICar key={ai.id} aiData={ai} isPaused={isPaused} />
          ))}

          {/* Dynamic Civilian Traffic */}
          <Traffic isPaused={isPaused} />

          {/* Camera Follow Rig */}
          <CameraFollow
            distanceMode={settings.cameraDistance}
            isPaused={isPaused}
          />

          {/* Dynamic Visual Effects */}
          <ParticleEffects rain={settings.rain} />
        </Suspense>
      </Canvas>
    </div>
  );
};
