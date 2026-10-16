import { DEMO_TICK_MS, MARKET_API_URL, MARKET_MODE, MARKET_POLL_MS, METALS, toPerGram } from './marketConfig';
import { createMarketSimulator } from './marketSimulator';
import ibja from './ibjaReference.json';

/**
 * One shared market feed for the whole site: top bar, hero, market section,
 * product pages and the selection tray all read the same snapshot.
 *
 * Snapshot:
 *   mode:      'reference' | 'live' | 'demo'
 *   status:    'loading' | 'ready' | 'stale' | 'unavailable'
 *   source:    { name, short, url, kind, note } | null
 *   asOf:      { date: Date, session?: 'AM' | 'PM' } | null   – when the rates were published
 *   updatedAt: Date | null                                    – when this site last received them
 *   metals:    { [key]: Rate }
 *
 * Rate (always per gram):
 *   { pricePerGram, prevClose, change, changePct, direction, history[], historyLabel, stats[] }
 */

const listeners = new Set();
let snapshot = null;
let timer = null;
let simulator = null;
const liveHistory = {};

const direction = (change) => (change > 0 ? 'up' : change < 0 ? 'down' : 'flat');

const rate = ({ price, prevClose, history, historyLabel, stats }) => {
  const change = price - prevClose;
  return {
    pricePerGram: price,
    prevClose,
    change,
    changePct: prevClose ? (change / prevClose) * 100 : 0,
    direction: direction(change),
    history,
    historyLabel,
    stats,
  };
};

let lastMarket = null; // the latest market (non-showroom) snapshot, for switching back
const emit = (next) => {
  snapshot = next;
  if (next.mode !== 'showroom') lastMarket = next;
  listeners.forEach((l) => l());
};

// ---------- Reference: IBJA published rates ----------

const parseDay = (iso) => new Date(`${iso}T12:00:00+05:30`);
const shortDate = (iso) => parseDay(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

/** IBJA-shaped data (bundled snapshot or the /api/rates response) as a snapshot. */
const CALCULATED = METALS.filter((m) => m.calculated);
// A calculated per-gram rate, rounded so that its per-10 gm rate is whole rupees (as quoted).
const toTenRupee = (perGram) => Math.round(perGram * 10) / 10;

/**
 * Adds the purities IBJA does not publish (METALS marked `calculated`, e.g. 20K)
 * from its 999 rate × purity, rounded to the rupee as IBJA rounds its own 916 and 750.
 */
function withCalculated(data) {
  const fill = (values) => {
    if (!values) return values;
    const out = { ...values };
    CALCULATED.forEach((m) => {
      if (out[m.key] == null && out[m.derivedFrom] != null) out[m.key] = Math.round(out[m.derivedFrom] * m.purity);
    });
    return out;
  };
  const history = { ...data.history };
  CALCULATED.forEach((m) => {
    if (!history[m.key] && history[m.derivedFrom]) history[m.key] = history[m.derivedFrom].map((v) => Math.round(v * m.purity));
  });
  return {
    ...data,
    current: fill(data.current),
    previousClose: fill(data.previousClose),
    sessions: data.sessions && { am: fill(data.sessions.am), pm: fill(data.sessions.pm) },
    history,
  };
}

function fromIbja(source, mode) {
  const data = withCalculated(source);
  const unitFor = (key) => (key === 'silver' ? data.units.silver : data.units.gold);
  // IBJA's chart series already ends with today's PM once it is published.
  const lastIsToday = data.history.dates.at(-1) === data.published.date && data.published.session === 'PM';
  const metals = {};
  // One date per history point, ending with the current session's date.
  const historyDates = lastIsToday ? [...data.history.dates] : [...data.history.dates, data.published.date];
  METALS.forEach(({ key, calculated, purity }) => {
    if (data.current[key] == null) return; // e.g. an older snapshot without 18K
    const unit = unitFor(key);
    const perGram = (v) => toPerGram(v, unit);
    const price = perGram(data.current[key]);
    const prevClose = perGram(data.previousClose?.[key] ?? data.current[key]);
    // IBJA's chart series covers 24K, 22K and silver; other purities have today only.
    const closes = (data.history[key] ?? []).map(perGram);
    const series = closes.length ? (lastIsToday ? [...closes.slice(0, -1), price] : [...closes, price]) : [price];
    const window = series.slice(-23, -1); // about a month of sessions before this one
    const today = data.sessions?.[data.published.session.toLowerCase()] ? data.sessions : null;
    metals[key] = {
      ...rate({
        price,
        prevClose,
        history: series,
        historyLabel: `Since ${shortDate(data.history.dates[0])} · IBJA ${data.history.session} rates${calculated ? ` · 20K = 999 × ${purity}` : ''}`,
        stats: [
          { label: 'Prev. close', value: prevClose },
          { label: '1-month high', value: Math.max(...window, price) },
          { label: '1-month low', value: Math.min(...window, price) },
        ],
      }),
      calculated: Boolean(calculated),
      historyDates: closes.length ? historyDates : [data.published.date],
      sessions: today ? { am: today.am?.[key] != null ? perGram(today.am[key]) : null, pm: today.pm?.[key] != null ? perGram(today.pm[key]) : null } : null,
    };
  });
  return {
    mode,
    status: 'ready',
    source: data.source,
    asOf: { date: parseDay(data.published.date), session: data.published.session },
    updatedAt: new Date(data.fetchedAt),
    metals,
  };
}

const referenceSnapshot = () => fromIbja(ibja, 'reference');

// ---------- Live: configured API ----------

/**
 * Maps a live API response onto per-gram rates. Adjust this one function when
 * connecting a provider. Expected input:
 *   { source?: { name, short, url, kind, note }, publishedAt?: ISO, session?: 'AM'|'PM',
 *     rates: { gold24: { price, prevClose?, unit: '1g'|'10g'|'1kg' }, gold22: {...}, silver: {...} } }
 */
export function normalizeLivePayload(json) {
  const metals = {};
  METALS.forEach(({ key }) => {
    const r = json?.rates?.[key];
    const raw = Number(r?.price);
    if (!Number.isFinite(raw) || raw <= 0) return;
    const unit = r.unit || '10g';
    const price = toPerGram(raw, unit);
    const prevClose = Number(r.prevClose) ? toPerGram(Number(r.prevClose), unit) : price;
    const history = [...(liveHistory[key] ?? []), price].slice(-84);
    liveHistory[key] = history;
    metals[key] = rate({
      price,
      prevClose,
      history,
      historyLabel: 'Since this page opened',
      stats: [
        { label: 'Prev. close', value: prevClose },
        { label: 'High', value: Math.max(...history) },
        { label: 'Low', value: Math.min(...history) },
      ],
    });
  });
  if (!Object.keys(metals).length) throw new Error('Market payload contained no usable rates');
  // Purities the provider does not quote (20K): from its 999 rate, as for IBJA.
  CALCULATED.forEach((m) => {
    const base = metals[m.derivedFrom];
    if (metals[m.key] || !base) return;
    const price = toTenRupee(base.pricePerGram * m.purity);
    const prevClose = toTenRupee(base.prevClose * m.purity);
    metals[m.key] = { ...rate({ price, prevClose, history: base.history.map((v) => v * m.purity), historyLabel: base.historyLabel, stats: base.stats.map((s) => ({ ...s, value: s.value * m.purity })) }), calculated: true };
  });
  const published = json?.publishedAt ? new Date(json.publishedAt) : null;
  return {
    metals,
    source: json?.source ?? null,
    asOf: published && !Number.isNaN(published.getTime()) ? { date: published, session: json.session } : null,
  };
}

async function pollLive() {
  try {
    const res = await fetch(MARKET_API_URL, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Market API responded ${res.status}`);
    const json = await res.json();
    if (showroom) return; // switched to showroom rates while this request was out
    if (json?.current && json?.history) {
      // The server could not reach the provider and sent its last good rates: say so.
      if (json.stale) emit({ ...fromIbja(json, 'live'), status: 'stale' });
      else emit({ ...fromIbja(json, 'live'), updatedAt: new Date() });
      return;
    }
    const { metals, source, asOf } = normalizeLivePayload(json);
    emit({ mode: 'live', status: 'ready', source, asOf, updatedAt: new Date(), metals });
  } catch (error) {
    if (import.meta.env.DEV) console.warn('[market]', error);
    // Live rates seen before: keep them but say they are not current.
    // Never reached: keep showing the bundled IBJA snapshot with its own date.
    if (!showroom && snapshot.mode === 'live') emit({ ...snapshot, status: 'stale' });
  }
}

// ---------- Demo: simulated ----------

function demoSnapshot(quotes) {
  const metals = {};
  METALS.forEach(({ key }) => {
    const q = quotes[key];
    if (!q) return; // showroom-only rates are not simulated
    const g = (v) => toPerGram(v, '10g');
    metals[key] = rate({
      price: g(q.price),
      prevClose: g(q.prevClose),
      history: q.history.map(g),
      historyLabel: 'Simulated session',
      stats: [
        { label: 'Open', value: g(q.open) },
        { label: 'High', value: g(q.high) },
        { label: 'Low', value: g(q.low) },
      ],
    });
  });
  return { mode: 'demo', status: 'ready', source: null, asOf: null, updatedAt: new Date(), metals };
}

// ---------- Showroom: rates set in the admin panel ----------

let showroom = null;

/**
 * Called once with the saved settings before the site renders. In showroom
 * mode the site shows only the rates the showroom set, labelled as such,
 * and does not poll IBJA. Metals left blank are not shown.
 */
export function setShowroomRates(rates) {
  const next = rates?.mode === 'showroom' ? rates : null;
  if (JSON.stringify(next) === JSON.stringify(showroom)) return; // unchanged
  showroom = next;
  if (!listeners.size) {
    snapshot = null; // the first reader builds it
    return;
  }
  // Changed while the page is open (admin saved new rates): show it now.
  stop();
  emit(showroom ? showroomSnapshot() : (lastMarket ?? initial()));
  start(); // resumes polling the market when back on market rates
}

function showroomSnapshot() {
  const setAt = showroom.setAt ? new Date(showroom.setAt) : new Date();
  const metals = {};
  METALS.forEach(({ key }) => {
    const price = Number(showroom.values?.[key]);
    if (!(price > 0)) return;
    const before = Number(showroom.previous?.[key]);
    // Same rate as before, or a jump of more than 15%: nothing to compare.
    const comparable = before > 0 && before !== price && Math.abs(price - before) / before <= 0.15;
    const prevClose = comparable ? before : price;
    metals[key] = {
      ...rate({ price, prevClose, history: [prevClose, price], historyLabel: 'Showroom rate', stats: [{ label: 'Previous rate', value: prevClose }] }),
      // No comparable earlier rate (or unchanged): no change to show (not "+0.00%").
      ...(comparable ? {} : { change: null, changePct: null, prevClose: null }),
      calculated: false, // entered by the showroom
      historyDates: null,
      sessions: null,
    };
  });
  // 20K left empty: the showroom's own 24K × 0.833, marked as calculated.
  CALCULATED.forEach((m) => {
    const base = metals[m.derivedFrom];
    if (metals[m.key] || !base) return;
    const scale = (v) => (v == null ? v : toTenRupee(v * m.purity));
    const [price, prevClose] = [scale(base.pricePerGram), scale(base.prevClose)];
    const change = base.change == null || prevClose == null ? base.change : Math.round((price - prevClose) * 100) / 100;
    metals[m.key] = { ...base, pricePerGram: price, prevClose, change, history: base.history.map(scale), stats: [], calculated: true };
  });
  return {
    mode: 'showroom',
    status: 'ready',
    source: {
      name: 'Pradeep Jewellers showroom',
      short: 'Showroom',
      url: null,
      kind: 'Showroom selling rate',
      note: showroom.note || 'Rates exclude GST and making charges.',
    },
    asOf: { date: setAt },
    updatedAt: setAt,
    metals,
  };
}

// ---------- Feed lifecycle ----------

function initial() {
  if (showroom) return showroomSnapshot();
  if (MARKET_MODE === 'demo') {
    simulator = createMarketSimulator();
    return demoSnapshot(simulator.read());
  }
  // Show the bundled IBJA rates at once; the first poll replaces them with the latest.
  return referenceSnapshot();
}

function start() {
  if (showroom || timer || (typeof document !== 'undefined' && document.hidden)) return;
  if (MARKET_MODE === 'live') {
    pollLive();
    timer = window.setInterval(pollLive, MARKET_POLL_MS);
  } else {
    timer = window.setInterval(() => emit(demoSnapshot(simulator.tick())), DEMO_TICK_MS);
  }
}

function stop() {
  window.clearInterval(timer);
  timer = null;
}

const onVisibility = () => (document.hidden ? stop() : listeners.size && start());

export function subscribeMarket(listener) {
  listeners.add(listener);
  if (listeners.size === 1) {
    document.addEventListener('visibilitychange', onVisibility);
    start();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    }
  };
}

export function getMarketSnapshot() {
  if (!snapshot) snapshot = initial();
  return snapshot;
}
