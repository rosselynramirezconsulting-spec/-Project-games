// Tiny procedural sound effects with the Web Audio API — no audio files needed.
// The AudioContext is created lazily on the first interaction so browsers that
// block autoplay are happy.

let ctx = null;

function ac() {
  if (!ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    } catch (e) { /* audio unavailable — stay silent */ }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function blip(freq = 440, dur = 0.08, type = 'sine', gain = 0.05) {
  const c = ac();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  o.connect(g);
  g.connect(c.destination);
  const t = c.currentTime;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export const Sound = {
  tap() { blip(520, 0.06, 'triangle', 0.04); },
  step() { blip(300, 0.04, 'square', 0.02); },
  place() { blip(660, 0.09, 'sine', 0.06); setTimeout(() => blip(880, 0.08, 'sine', 0.05), 70); },
  trash() { blip(200, 0.16, 'sawtooth', 0.05); },
  open() { blip(740, 0.09, 'triangle', 0.05); },
  start() { [523, 659, 784].forEach((f, i) => setTimeout(() => blip(f, 0.12, 'triangle', 0.05), i * 90)); },
};
