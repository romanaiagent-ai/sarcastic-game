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

  // ─── Background Music ────────────────────────────────────────────────────

  private musicInterval: ReturnType<typeof setInterval> | null = null;
  private musicBeat: number = 0;
  private musicPlaying: boolean = false;

  /** Start looping dramatic background music */
  startMusic() {
    if (this.musicPlaying) return;
    this.musicPlaying = true;
    this.musicBeat = 0;
    const BPM = 128;
    const beatMs = (60 / BPM) * 1000;

    this.musicInterval = setInterval(() => {
      if (this.muted) return;
      const ctx = this.getCtx();
      const out = this.output();
      if (!ctx || !out) return;

      const beat = this.musicBeat % 16;

      // Kick drum on beats 0, 4, 8, 12
      if (beat % 4 === 0) this._kick(ctx, out);

      // Snare on beats 4 and 12
      if (beat === 4 || beat === 12) this._snare(ctx, out);

      // Hi-hat every 2 beats
      if (beat % 2 === 0) this._hihat(ctx, out);

      // Bass line pattern
      const bassNotes: (number | null)[] = [55, null, 55, null, 49, null, 52, null, 55, null, 55, null, 58, null, 52, null];
      const bassFreq = bassNotes[beat];
      if (bassFreq) this._bass(ctx, out, bassFreq, beatMs * 0.9);

      // Arpeggio melody (every 4 beats, offset)
      const arpNotes: (number | null)[] = [null, 220, null, 277, null, 330, null, 262, null, 220, null, 247, null, 330, null, null];
      const arpFreq = arpNotes[beat];
      if (arpFreq) this._arp(ctx, out, arpFreq, beatMs * 0.4);

      // Atmospheric pad every 8 beats
      if (beat === 0 || beat === 8) this._pad(ctx, out, beat === 0 ? 110 : 98, beatMs * 7);

      this.musicBeat++;
    }, beatMs);
  }

  stopMusic() {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.musicPlaying = false;
  }

  private _kick(ctx: AudioContext, out: AudioNode) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.8, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
    osc.connect(gain); gain.connect(out);
    osc.start(); osc.stop(ctx.currentTime + 0.15);
  }

  private _snare(ctx: AudioContext, out: AudioNode) {
    const bufSize = Math.floor(ctx.sampleRate * 0.1);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 1500;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    src.connect(filter); filter.connect(gain); gain.connect(out);
    src.start(); src.stop(ctx.currentTime + 0.11);
  }

  private _hihat(ctx: AudioContext, out: AudioNode) {
    const bufSize = Math.floor(ctx.sampleRate * 0.04);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 8000;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    src.connect(filter); filter.connect(gain); gain.connect(out);
    src.start(); src.stop(ctx.currentTime + 0.05);
  }

  private _bass(ctx: AudioContext, out: AudioNode, freq: number, duration: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400;
    const dt = duration / 1000;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime + dt * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dt);
    osc.connect(filter); filter.connect(gain); gain.connect(out);
    osc.start(); osc.stop(ctx.currentTime + dt + 0.01);
  }

  private _arp(ctx: AudioContext, out: AudioNode, freq: number, duration: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    const dt = duration / 1000;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dt);
    osc.connect(gain); gain.connect(out);
    osc.start(); osc.stop(ctx.currentTime + dt + 0.01);
  }

  private _pad(ctx: AudioContext, out: AudioNode, freq: number, duration: number) {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.value = freq;
    osc2.frequency.value = freq * 1.5;
    const dt = duration / 1000;
    gain.gain.setValueAtTime(0.0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + dt * 0.1);
    gain.gain.setValueAtTime(0.06, ctx.currentTime + dt * 0.8);
    gain.gain.linearRampToValueAtTime(0.0, ctx.currentTime + dt);
    osc1.connect(gain); osc2.connect(gain); gain.connect(out);
    osc1.start(); osc2.start();
    osc1.stop(ctx.currentTime + dt + 0.01);
    osc2.stop(ctx.currentTime + dt + 0.01);
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : 0.6;
    }
    return this.muted;
  }
}
