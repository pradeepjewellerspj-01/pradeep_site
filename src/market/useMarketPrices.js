import { useSyncExternalStore } from 'react';
import { getMarketSnapshot, subscribeMarket } from './marketService';
import { METALS, metalByKey } from './marketConfig';

/**
 * A rate with its metal definition attached, in its display unit (gold per
 * 10 gm, silver 999 per kg; `unitLabel`): price, prevClose, change, history,
 * stats and sessions are scaled; the feed's own `pricePerGram` stays for
 * calculations (e.g. the old-gold estimate).
 */
export function displayRate(key, r) {
  if (!r) return null;
  const grams = metalByKey[key].perGrams;
  const scale = (v) => (v == null ? v : v * grams);
  return {
    ...metalByKey[key],
    ...r,
    price: scale(r.pricePerGram),
    prevClose: scale(r.prevClose),
    change: scale(r.change),
    history: (r.history ?? []).map(scale),
    stats: (r.stats ?? []).map((s) => ({ ...s, value: scale(s.value) })),
    sessions: r.sessions ? { am: scale(r.sessions.am), pm: scale(r.sessions.pm) } : r.sessions,
  };
}

export function useMarketPrices() {
  const snap = useSyncExternalStore(subscribeMarket, getMarketSnapshot, getMarketSnapshot);
  return {
    ...snap,
    rows: METALS.filter((m) => snap.metals[m.key]).map((m) => displayRate(m.key, snap.metals[m.key])),
    get: (key) => displayRate(key, snap.metals[key]),
  };
}

export const formatRupees = (value, digits = 0) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);

/** Rates in their display unit, in whole rupees: ₹1,46,514. */
export const formatRate = (value) => formatRupees(Math.round(value), 0);

export const formatChangePct = (pct) => `${pct >= 0 ? '+' : '−'}${Math.abs(pct).toFixed(2)}%`;

export const formatTime = (date) => (date ? date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : '');

export const formatMarketDate = (date, month = 'short') =>
  (date ?? new Date()).toLocaleDateString('en-IN', { day: '2-digit', month, year: 'numeric' });

/** "08 Oct 2026 · AM" (or "· AM session" with `long`) */
export const formatAsOf = (asOf, long = false) =>
  asOf ? `${formatMarketDate(asOf.date)}${asOf.session ? ` · ${asOf.session}${long ? ' session' : ''}` : ''}` : '';

/**
 * The honest label for the current data. Bullion reference rates are always
 * "Indicative", even from a live feed: they exclude GST and making charges.
 */
export function marketLabel({ mode, status, source, asOf, updatedAt }) {
  const src = source?.short;
  if (status === 'unavailable') return { tone: 'off', short: 'Unavailable', long: 'Market data unavailable' };
  if (status === 'loading') return { tone: 'off', short: 'Connecting', long: 'Connecting to market…' };
  if (mode === 'demo') return { tone: 'demo', short: 'Indicative · Demo', long: 'Indicative · Demo data' };
  if (mode === 'showroom') return { tone: 'showroom', short: 'Showroom rate', long: `Showroom rate · ${formatMarketDate(asOf?.date)}` };
  if (status === 'stale') return { tone: 'stale', short: 'Delayed', long: `Delayed · Last updated ${formatTime(updatedAt)}` };
  if (mode === 'live')
    return { tone: 'live', short: src ? `Indicative · ${src}` : 'Indicative', long: `Indicative${src ? ` · ${src}` : ''} · Updated ${formatTime(updatedAt)}` };
  return { tone: 'reference', short: `Indicative · ${src}`, long: `Indicative · ${src} · ${formatAsOf(asOf)}` };
}
