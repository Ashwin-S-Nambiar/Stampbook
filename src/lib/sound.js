import { createPersistedStore } from './store.js';

export const soundStore = createPersistedStore('sb:sound', true);

let ctx = null;

function audio() {
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) {
    return null;
  }
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (navigator.audioSession) navigator.audioSession.type = 'ambient';
    ctx = new AC();
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
    return null;
  }
  return ctx;
}

function tone({ freq, to, dur, type = 'sine', gain = 0.06, delay = 0 }) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime + delay;
  const osc = c.createOscillator();
  const amp = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.005);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(amp).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.03);
}

function noise({ dur, gain = 0.05, freq = 3000, q = 1.2, delay = 0 }) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime + delay;
  const length = Math.ceil(c.sampleRate * dur);
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = q;
  const amp = c.createGain();
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.004);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(amp).connect(c.destination);
  src.start(t);
  src.stop(t + dur + 0.02);
}

const play =
  (fn) =>
  (...args) => {
    if (!soundStore.get() || document.hidden) return;
    try {
      fn(...args);
    } catch {}
  };

export const sfx = {
  tap: play(() => tone({ freq: 900, to: 620, dur: 0.035, gain: 0.025 })),
  flip: play(() => {
    noise({ dur: 0.16, gain: 0.05, freq: 2400, q: 0.5 });
    noise({ dur: 0.07, gain: 0.03, freq: 5200, q: 1, delay: 0.1 });
  }),
  thud: play(() => {
    tone({ freq: 140, to: 55, dur: 0.16, gain: 0.22 });
    noise({ dur: 0.05, gain: 0.12, freq: 900, q: 0.8 });
    noise({ dur: 0.03, gain: 0.05, freq: 3600, q: 2, delay: 0.01 });
  }),
  lift: play(() => noise({ dur: 0.05, gain: 0.03, freq: 1600, q: 1.5 })),
  shutter: play(() => {
    noise({ dur: 0.03, gain: 0.07, freq: 4200, q: 2 });
    noise({ dur: 0.04, gain: 0.06, freq: 3000, q: 2, delay: 0.06 });
  }),
  error: play(() => {
    tone({ freq: 240, to: 170, dur: 0.18, type: 'square', gain: 0.02 });
  }),
};
