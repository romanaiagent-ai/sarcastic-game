/**
 * SoundManager — procedural retro sound effects via Web Audio API.
 * No audio files needed. All sounds are synthesized on the fly.
 */
export class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  public muted: boolean = false;

  private getCtx(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === "undefined") return null;
    try {
      if (!this.ctx) {
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.6;
        this.masterGain.connect(this.ctx.destination);
      }
      if (this.ctx.state === "suspended") this.ctx.resume();
      return this.ctx;
    } catch {
      return null;
    }
  }

  private output(): GainNode | AudioDestinationNode | null {
    const ctx = this.getCtx();
    return ctx ? (this.masterGain ?? ctx.destination) : null;
  }

  /** Player laser shot — sharp zap */
  playShoot() {
    const ctx = this.getCtx();
    const out = this.output();
    if (!ctx || !out) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(out);

    osc.type = "square";
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.09);
  }

  /** Enemy laser shot — lower, more sinister */
  playEnemyShoot() {
    const ctx = this.getCtx();
    const out = this.output();
    if (!ctx || !out) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(out);

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.13);
  }

  /** Enemy hit — short crunch */
  playHit() {
    const ctx = this.getCtx();
    const out = this.output();
    if (!ctx || !out) return;

    const bufSize = Math.floor(ctx.sampleRate * 0.06);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2000;
    filter.Q.value = 0.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    src.start();
    src.stop(ctx.currentTime + 0.07);
  }

  /** Enemy explosion — low boom with noise */
  playExplosion() {
    const ctx = this.getCtx();
    const out = this.output();
    if (!ctx || !out) return;

    const duration = 0.35;
    const bufSize = Math.floor(ctx.sampleRate * duration);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(600, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.9, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    // Add a sub-bass thud
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.15);
    oscGain.gain.setValueAtTime(0.6, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(oscGain);
    oscGain.connect(out);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.16);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    src.start();
    src.stop(ctx.currentTime + duration + 0.01);
  }

  /** Player takes damage — heavy thud + buzz */
  playPlayerHit() {
    const ctx = this.getCtx();
    const out = this.output();
    if (!ctx || !out) return;

    // Low thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(out);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.21);

    // Distortion buzz
    const bufSize = Math.floor(ctx.sampleRate * 0.1);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.3, ctx.currentTime);
    nGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    src.connect(nGain);
    nGain.connect(out);
    src.start();
    src.stop(ctx.currentTime + 0.11);
  }

  /** Player death — dramatic descending dirge */
  playGameOver() {
    const ctx = this.getCtx();
    const out = this.output();
    if (!ctx || !out) return;

    const notes = [440, 349, 294, 220, 165];
    notes.forEach((freq, i) => {
      const t = ctx.currentTime + i * 0.18;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.17);
    });

    // Final low boom
    const boomT = ctx.currentTime + notes.length * 0.18;
    const bufSize = Math.floor(ctx.sampleRate * 0.5);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 200;
    const bGain = ctx.createGain();
    bGain.gain.setValueAtTime(0.8, boomT);
    bGain.gain.exponentialRampToValueAtTime(0.001, boomT + 0.5);
    src.connect(filter);
    filter.connect(bGain);
    bGain.connect(out);
    src.start(boomT);
    src.stop(boomT + 0.51);
  }

  /** Wave start — ascending fanfare */
  playWaveStart() {
    const ctx = this.getCtx();
    const out = this.output();
    if (!ctx || !out) return;

    const notes = [220, 277, 330, 440];
    notes.forEach((freq, i) => {
      const t = ctx.currentTime + i * 0.1;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.13);
    });
  }

  /** Rusher contact hit — fast crunch */
  playContactHit() {
    const ctx = this.getCtx();
    const out = this.output();
    if (!ctx || !out) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(out);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.09);
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : 0.6;
    }
    return this.muted;
  }
}
