// audio.js — all sound is generated with WebAudio: short oscillator blips and
// filtered noise, no audio files. Safe to call before any user gesture.
export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensure() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      } catch (err) {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  tone(freq, dur, type, vol, when) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + (when || 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(vol || 0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  noise(dur, vol, cutoff) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cutoff || 1200;
    const gain = ctx.createGain();
    gain.gain.value = vol || 0.15;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  }

  chop() { this.noise(0.09, 0.25, 2500); this.tone(180, 0.07, 'square', 0.08); }
  pickup() { this.tone(520, 0.08, 'sine', 0.1); }
  grillOn() { this.noise(0.25, 0.12, 900); }
  ding() { this.tone(880, 0.15, 'sine', 0.12); this.tone(1320, 0.2, 'sine', 0.08, 0.08); }
  coin() { this.tone(988, 0.09, 'triangle', 0.12); this.tone(1319, 0.12, 'triangle', 0.12, 0.07); this.tone(1568, 0.18, 'triangle', 0.1, 0.14); }
  buzz() { this.tone(140, 0.25, 'sawtooth', 0.1); }
  burn() { this.tone(220, 0.3, 'sawtooth', 0.08); this.noise(0.2, 0.1, 600); }
  click() { this.tone(660, 0.05, 'sine', 0.07); }
  start() { this.tone(523, 0.1, 'triangle', 0.12); this.tone(659, 0.1, 'triangle', 0.12, 0.09); this.tone(784, 0.18, 'triangle', 0.12, 0.18); }
  over() { this.tone(392, 0.15, 'triangle', 0.12); this.tone(330, 0.15, 'triangle', 0.12, 0.14); this.tone(262, 0.3, 'triangle', 0.12, 0.28); }
}
