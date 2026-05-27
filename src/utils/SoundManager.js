// Generates simple tones using the Web Audio API as placeholders
// for happy, kid-friendly sound effects.
export default class SoundManager {
  constructor() {
    this._ctx = null;
  }

  _getCtx() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this._ctx;
  }

  _beep(frequency, duration, type = 'sine', volume = 0.3) {
    try {
      const ctx = this._getCtx();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (_) {
      // Audio not available — silent fallback
    }
  }

  _melody(notes, noteLen = 0.12) {
    try {
      const ctx = this._getCtx();
      notes.forEach(([freq, offset]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + offset);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + noteLen);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + noteLen + 0.02);
      });
    } catch (_) {}
  }

  // Bright happy collect sound
  collect() {
    this._melody([
      [523, 0],
      [659, 0.1],
      [784, 0.2],
    ]);
  }

  // Pair matched — cheerful ding-dong
  pairMatched() {
    this._melody([
      [659, 0],
      [784, 0.12],
      [1047, 0.24],
      [1319, 0.36],
    ], 0.15);
  }

  // Animal delivered to ark
  deliver() {
    this._melody([
      [392, 0],
      [523, 0.1],
      [659, 0.2],
      [784, 0.3],
      [1047, 0.42],
    ], 0.18);
  }

  // Wrong match / missed
  wrong() {
    this._beep(220, 0.25, 'sawtooth', 0.2);
    setTimeout(() => this._beep(180, 0.2, 'sawtooth', 0.15), 200);
  }

  // Victory fanfare
  win() {
    this._melody([
      [523, 0], [659, 0.15], [784, 0.3],
      [1047, 0.45], [784, 0.65], [1047, 0.8],
      [1319, 0.95], [1047, 1.15], [1319, 1.3],
    ], 0.2);
  }

  // Button tap
  tap() {
    this._beep(880, 0.06, 'sine', 0.15);
  }
}
