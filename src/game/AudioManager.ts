/**
 * Synthesizer-based audio engine for Neon Street Racing.
 * Zero external audio assets required; uses the standard Web Audio API.
 */

class AudioManager {
  private ctx: AudioContext | null = null;
  private isInitialized = false;
  private isMuted = false;

  // Master Gain
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private engineGain: GainNode | null = null;

  // Engine sound generator
  private engineOsc1: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private engineNoiseNode: AudioNode | null = null;
  private isEngineRunning = false;

  // Nitro loop
  private nitroGain: GainNode | null = null;
  private isNitroPlaying = false;

  // Drift skid sound
  private skidGain: GainNode | null = null;
  private isSkidding = false;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  public init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.engineGain.connect(this.masterGain);

      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(master: number, sfx: number, engine: number) {
    if (!this.ctx || !this.masterGain || !this.sfxGain || !this.engineGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, master)), now + 0.05);
    this.sfxGain.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, sfx)), now + 0.05);
    this.engineGain.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, engine)), now + 0.05);
  }

  public startEngine() {
    if (!this.ctx || !this.engineGain || this.isEngineRunning) return;
    try {
      const now = this.ctx.currentTime;

      // Dual oscillator engine sound
      this.engineOsc1 = this.ctx.createOscillator();
      this.engineOsc2 = this.ctx.createOscillator();

      this.engineOsc1.type = 'sawtooth';
      this.engineOsc2.type = 'triangle';

      this.engineOsc1.frequency.setValueAtTime(45, now);
      this.engineOsc2.frequency.setValueAtTime(90, now);

      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(400, now);
      this.engineFilter.Q.setValueAtTime(3, now);

      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.25, now);

      this.engineOsc1.connect(this.engineFilter);
      this.engineOsc2.connect(this.engineFilter);
      this.engineFilter.connect(oscGain);
      oscGain.connect(this.engineGain);

      this.engineOsc1.start();
      this.engineOsc2.start();

      this.isEngineRunning = true;
    } catch (e) {
      console.warn('Could not start engine audio', e);
    }
  }

  public updateEngine(speedKmh: number, rpm: number, throttle: number) {
    if (!this.ctx || !this.isEngineRunning || !this.engineOsc1 || !this.engineOsc2 || !this.engineFilter) return;

    const now = this.ctx.currentTime;
    // Map RPM (1000 - 8000) to base frequency (40Hz to 280Hz)
    const normalizedRpm = Math.max(0, Math.min(1, (rpm - 1000) / 7000));
    const targetFreq1 = 45 + normalizedRpm * 220;
    const targetFreq2 = targetFreq1 * 1.5;

    // Filter frequency opens up with throttle
    const filterFreq = 300 + normalizedRpm * 1400 + (throttle > 0 ? 400 : 0);

    this.engineOsc1.frequency.setTargetAtTime(targetFreq1, now, 0.04);
    this.engineOsc2.frequency.setTargetAtTime(targetFreq2, now, 0.04);
    this.engineFilter.frequency.setTargetAtTime(filterFreq, now, 0.05);
  }

  public stopEngine() {
    if (!this.isEngineRunning) return;
    try {
      if (this.engineOsc1) {
        this.engineOsc1.stop();
        this.engineOsc1.disconnect();
        this.engineOsc1 = null;
      }
      if (this.engineOsc2) {
        this.engineOsc2.stop();
        this.engineOsc2.disconnect();
        this.engineOsc2 = null;
      }
      this.isEngineRunning = false;
    } catch {
      // Ignored
    }
  }

  public playNitro(active: boolean) {
    if (!this.ctx || !this.sfxGain) return;

    if (active && !this.isNitroPlaying) {
      this.isNitroPlaying = true;
      try {
        const bufferSize = this.ctx.sampleRate * 1;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, this.ctx.currentTime);
        filter.Q.setValueAtTime(2, this.ctx.currentTime);
        filter.frequency.linearRampToValueAtTime(2400, this.ctx.currentTime + 0.5);

        this.nitroGain = this.ctx.createGain();
        this.nitroGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
        this.nitroGain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 0.15);

        whiteNoise.connect(filter);
        filter.connect(this.nitroGain);
        this.nitroGain.connect(this.sfxGain);

        whiteNoise.start();
        (this as unknown as { _nitroNoise: AudioNode })._nitroNoise = whiteNoise;
      } catch (e) {
        console.warn(e);
      }
    } else if (!active && this.isNitroPlaying) {
      this.isNitroPlaying = false;
      if (this.nitroGain && this.ctx) {
        this.nitroGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        setTimeout(() => {
          try {
            const noise = (this as unknown as { _nitroNoise?: AudioBufferSourceNode })._nitroNoise;
            if (noise) noise.stop();
          } catch {}
        }, 150);
      }
    }
  }

  public playDrift(active: boolean) {
    if (!this.ctx || !this.sfxGain) return;

    if (active && !this.isSkidding) {
      this.isSkidding = true;
      try {
        const bufferSize = this.ctx.sampleRate * 0.5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.5;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

        this.skidGain = this.ctx.createGain();
        this.skidGain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        this.skidGain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 0.1);

        noise.connect(filter);
        filter.connect(this.skidGain);
        this.skidGain.connect(this.sfxGain);

        noise.start();
        (this as unknown as { _skidNoise: AudioBufferSourceNode })._skidNoise = noise;
      } catch {}
    } else if (!active && this.isSkidding) {
      this.isSkidding = false;
      if (this.skidGain && this.ctx) {
        this.skidGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        setTimeout(() => {
          try {
            const noise = (this as unknown as { _skidNoise?: AudioBufferSourceNode })._skidNoise;
            if (noise) noise.stop();
          } catch {}
        }, 120);
      }
    }
  }

  public playCollision(intensity = 1.0) {
    if (!this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      // Low sub bass punch
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);

      const amp = Math.min(1.0, 0.5 * intensity);
      oscGain.gain.setValueAtTime(amp, now);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(oscGain);
      oscGain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.3);

      // Crunchy noise burst
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.2);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4 * intensity, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      noise.connect(noiseGain);
      noiseGain.connect(this.sfxGain);
      noise.start(now);
    } catch {}
  }

  public playCountdown(count: number) {
    if (!this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (count > 0) {
        // 3, 2, 1 -> 440 Hz
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.3);
      } else {
        // GO! -> 880 Hz triumphant chime
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.4);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.55);
      }
    } catch {}
  }

  public playCheckpoint() {
    if (!this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc2.frequency.setValueAtTime(1046.5, now + 0.08); // C6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch {}
  }

  public playFinish(isPodium: boolean) {
    if (!this.ctx || !this.sfxGain) return;
    try {
      const notes = isPodium ? [440, 554.37, 659.25, 880] : [330, 311.13, 293.66, 261.63];
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const now = this.ctx.currentTime + idx * 0.12;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = isPodium ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.4);
      });
    } catch {}
  }

  public playClick() {
    if (!this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }
}

export const audioManager = new AudioManager();
