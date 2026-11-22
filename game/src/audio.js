// VAULTBREAK — all sound is synthesized with WebAudio: no audio files, no network.
'use strict';

const Sfx = {
  ctx: null, master: null, alarmNodes: null, muted: false,
  ensure() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.35;
      this.master.connect(this.ctx.destination);
    } catch (e) { this.ctx = null; }
  },
  tone(freq, dur, type, vol, when, slideTo) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + (when || 0);
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(this.master);
    o.start(t0); o.stop(t0 + dur + 0.05);
  },
  click() { this.tone(1200, 0.05, 'square', 0.08); },
  step() { this.tone(180 + Math.random() * 60, 0.05, 'triangle', 0.05); },
  coin() { this.tone(1568, 0.09, 'sine', 0.16); this.tone(2093, 0.14, 'sine', 0.12, 0.07); },
  clink() { this.tone(2400, 0.06, 'triangle', 0.12); this.tone(1800, 0.08, 'triangle', 0.08, 0.05); },
  crackTick() { this.tone(880, 0.04, 'square', 0.07); },
  pickup() { this.tone(659, 0.1, 'sine', 0.16); this.tone(988, 0.16, 'sine', 0.16, 0.08); },
  diamond() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.22, 'sine', 0.16, i * 0.09));
  },
  suspicious() { this.tone(440, 0.16, 'sawtooth', 0.1, 0, 330); },
  spotted() {
    this.tone(220, 0.3, 'sawtooth', 0.18, 0, 440);
    this.tone(233, 0.3, 'sawtooth', 0.14, 0.02, 466);
  },
  caught() {
    [392, 311, 233, 175].forEach((f, i) => this.tone(f, 0.22, 'sawtooth', 0.16, i * 0.14));
  },
  vent() { this.tone(300, 0.5, 'sine', 0.12, 0, 90); },
  win() {
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.24, 'triangle', 0.16, i * 0.11));
  },
  alarmStart() {
    if (!this.ctx || this.alarmNodes) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = 'square'; o.frequency.value = 620;
    g.gain.value = 0.045;
    const lfo = this.ctx.createOscillator(), lg = this.ctx.createGain();
    lfo.frequency.value = 1.6; lg.gain.value = 220;
    lfo.connect(lg); lg.connect(o.frequency);
    o.connect(g); g.connect(this.master);
    o.start(); lfo.start();
    this.alarmNodes = { o, g, lfo };
  },
  alarmStop() {
    if (!this.alarmNodes) return;
    try { this.alarmNodes.o.stop(); this.alarmNodes.lfo.stop(); } catch (e) {}
    this.alarmNodes = null;
  },
};
