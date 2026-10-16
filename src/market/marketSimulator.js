import { METALS } from './marketConfig';

/**
 * Demo-mode market: a slow, mean-reverting random walk. Each calendar day gets
 * a stable seeded open and session path, so a refresh shows the same day;
 * live ticks wander a few rupees around that path, never jumping.
 */

const SESSION_POINTS = 84; // session sparkline resolution
const BUCKET_MS = 5 * 60_000;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const gaussian = (rand) => {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const daySeed = (date) => {
  const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  let h = 2166136261;
  for (let i = 0; i < key.length; i += 1) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return h >>> 0;
};

function seededSession(base, volatility, seed) {
  const rand = mulberry32(seed);
  const prevClose = Math.round(base * (1 + gaussian(rand) * 0.0035));
  const open = Math.round(prevClose * (1 + gaussian(rand) * 0.0025));
  const path = [open];
  let drift = gaussian(rand) * volatility * 0.35;
  for (let i = 1; i < SESSION_POINTS; i += 1) {
    drift = drift * 0.9 + gaussian(rand) * volatility * 0.12;
    const last = path[i - 1];
    path.push(Math.round(last * (1 + drift + gaussian(rand) * volatility * 1.6) + (open - last) * 0.015));
  }
  return { prevClose, open, path };
}

function snapshotFor(state, price, extra) {
  const history = state.history;
  const high = Math.max(state.high, price);
  const low = Math.min(state.low, price);
  return {
    price,
    open: state.open,
    high,
    low,
    prevClose: state.prevClose,
    change: price - state.prevClose,
    changePct: ((price - state.prevClose) / state.prevClose) * 100,
    history,
    ...extra,
  };
}

export function createMarketSimulator(now = new Date()) {
  const seed = daySeed(now);
  const sessionStart = new Date(now);
  sessionStart.setHours(9, 0, 0, 0);
  const elapsedBuckets = Math.max(12, Math.min(SESSION_POINTS - 1, Math.floor((now - sessionStart) / BUCKET_MS)));
  const tickRand = mulberry32(seed ^ Date.now());

  const states = {};
  METALS.filter((m) => !m.derivedFrom && !m.showroomOnly).forEach((m, i) => {
    const { prevClose, open, path } = seededSession(m.demoBase, m.volatility, seed + i * 7919);
    const history = path.slice(0, elapsedBuckets + 1);
    states[m.key] = {
      def: m,
      prevClose,
      open,
      anchor: history[history.length - 1],
      price: history[history.length - 1],
      high: Math.max(...history),
      low: Math.min(...history),
      history,
      ticks: 0,
    };
  });

  const derive = (sourceKey, purity) => {
    const s = states[sourceKey];
    const scale = (v) => Math.round(v * purity);
    return {
      price: scale(s.price),
      open: scale(s.open),
      high: scale(s.high),
      low: scale(s.low),
      prevClose: scale(s.prevClose),
      history: s.history.map(scale),
    };
  };

  const read = () => {
    const metals = {};
    METALS.forEach((m) => {
      if (m.showroomOnly) return;
      if (m.derivedFrom) {
        const d = derive(m.derivedFrom, m.purity);
        metals[m.key] = { ...d, change: d.price - d.prevClose, changePct: ((d.price - d.prevClose) / d.prevClose) * 100 };
      } else {
        const s = states[m.key];
        metals[m.key] = snapshotFor(s, s.price);
      }
    });
    return metals;
  };

  // Gold and silver share part of each move, as they tend to in practice.
  const tick = () => {
    const common = gaussian(tickRand);
    Object.values(states).forEach((s) => {
      const shock = 0.6 * common + 0.8 * gaussian(tickRand);
      const pull = (s.anchor - s.price) * 0.05;
      const next = Math.round(s.price * (1 + shock * s.def.volatility) + pull);
      s.price = next;
      s.high = Math.max(s.high, next);
      s.low = Math.min(s.low, next);
      s.ticks += 1;
      // The sparkline gains a point every few ticks and keeps its live tail current.
      if (s.ticks % 6 === 0) {
        s.history = [...s.history, next].slice(-SESSION_POINTS);
        s.anchor = s.anchor + (next - s.anchor) * 0.3;
      } else {
        s.history = [...s.history.slice(0, -1), next];
      }
    });
    return read();
  };

  return { read, tick };
}
