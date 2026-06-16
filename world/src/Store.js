// Tiny localStorage-backed save system. Free play, so we just persist the
// world the player builds: placed items per room + their character + location.

import { PRESETS } from './Draw.js';

const KEY = 'glitchworld.save.v1';

const DEFAULT_STATE = {
  character: Object.assign({ shoe: 1 }, PRESETS[0]), // start as Elizabeth
  location: 'house',
  rooms: {}, // { house: [{type,x,y}], bedroom: [...], ... }
};

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredCloneSafe(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return Object.assign(structuredCloneSafe(DEFAULT_STATE), parsed);
  } catch (e) {
    return structuredCloneSafe(DEFAULT_STATE);
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    /* storage full / disabled — ignore, it's just a toy */
  }
}

export function resetState() {
  try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
  return structuredCloneSafe(DEFAULT_STATE);
}

function structuredCloneSafe(obj) {
  return JSON.parse(JSON.stringify(obj));
}
