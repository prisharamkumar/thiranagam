import { SoundTrackId } from '../types';

/**
 * Deterministic Web Audio API procedural soundscape generator & subtle chime player.
 * Never autoplays; only initializes AudioContext upon explicit user action or opt-in event.
 */
class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private sourceNode: AudioNode | null = null;
  private lfoNode: OscillatorNode | null = null;
  private isPlaying = false;
  private currentTrack: SoundTrackId = 'rain';
  private volume = 0.35;

  private ensureContext(): AudioContext | null {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private createNoiseBuffer(ctx: AudioContext, type: 'pink' | 'brown'): AudioBuffer {
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'brown') {
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 2.8;
      }
    } else {
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.09;
        b6 = white * 0.115926;
      }
    }
    return buffer;
  }

  public start(track: SoundTrackId, volume: number) {
    this.stop();
    this.currentTrack = track;
    this.volume = volume;

    const ctx = this.ensureContext();
    if (!ctx) return;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.max(0.001, volume * 0.45), ctx.currentTime);
    masterGain.connect(ctx.destination);
    this.gainNode = masterGain;

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = this.createNoiseBuffer(
      ctx,
      track === 'brownNoise' || track === 'fireplace' ? 'brown' : 'pink'
    );
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    if (track === 'rain') {
      filter.type = 'bandpass';
      filter.frequency.value = 950;
      filter.Q.value = 0.6;
    } else if (track === 'library') {
      filter.type = 'lowpass';
      filter.frequency.value = 420;
    } else if (track === 'forest') {
      filter.type = 'bandpass';
      filter.frequency.value = 560;
      filter.Q.value = 0.9;

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.12;
      lfoGain.gain.value = 180;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      this.lfoNode = lfo;
    } else if (track === 'fireplace') {
      filter.type = 'lowpass';
      filter.frequency.value = 340;
    } else {
      filter.type = 'lowpass';
      filter.frequency.value = 280;
    }

    noiseSource.connect(filter);
    filter.connect(masterGain);
    noiseSource.start();

    this.sourceNode = noiseSource;
    this.isPlaying = true;
  }

  public stop() {
    if (this.sourceNode && 'stop' in this.sourceNode) {
      try {
        (this.sourceNode as AudioBufferSourceNode).stop();
      } catch {
        // Ignore already stopped source
      }
    }
    if (this.lfoNode) {
      try {
        this.lfoNode.stop();
      } catch {
        // Ignore already stopped LFO
      }
    }
    this.sourceNode = null;
    this.lfoNode = null;
    this.isPlaying = false;
  }

  public setVolume(volume: number) {
    this.volume = volume;
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(Math.max(0.0001, volume * 0.45), this.ctx.currentTime, 0.08);
    }
  }

  /**
   * Gentle soft two-note marimba/bell chime on reward/unlock/break ONLY when enabled.
   */
  public playGentleChime(kind: 'reward' | 'unlock' | 'break' = 'reward', enabled = false) {
    if (!enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const notes =
      kind === 'unlock'
        ? [523.25, 659.25, 783.99]
        : kind === 'break'
          ? [440, 554.37]
          : [587.33, 739.99];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + i * 0.11;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.04, this.volume * 0.18), startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.38);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      currentTrack: this.currentTrack,
      volume: this.volume,
    };
  }
}

export const soundEngine = new AmbientSoundEngine();
