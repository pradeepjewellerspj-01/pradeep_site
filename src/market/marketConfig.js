/**
 * Precious-metal market configuration.
 *
 * Modes (see marketService.js):
 *   live      – default. Polls MARKET_API_URL (the site's own /api/rates, which reads
 *               IBJA; see server/ibja.mjs) every few minutes and on returning to the tab.
 *               Until it answers, or if it cannot be reached, the bundled IBJA snapshot
 *               (ibjaReference.json, `npm run rates:ibja`) is shown with its own date.
 *   demo      – VITE_MARKET_MODE=demo. Simulated movement, always labelled demo.
 *
 * Whatever the source, rates reach the UI per gram, with their source and time.
 */
export const MARKET_API_URL = import.meta.env.VITE_MARKET_API_URL || '/api/rates';
export const MARKET_POLL_MS = Number(import.meta.env.VITE_MARKET_POLL_MS) || 5 * 60_000;
export const MARKET_MODE = import.meta.env.VITE_MARKET_MODE === 'demo' ? 'demo' : 'live';

export const DEMO_TICK_MS = 3200;

/**
 * Rates are shown as the showroom quotes them: gold and silver jewellery per
 * 10 grams, silver 999 per kg (each metal's `perGrams` / `unitLabel` below).
 * The feed stays per gram; displayRate() scales for display.
 */
export const DISPLAY_UNIT = '10g';
export const DISPLAY_GRAMS = 10;
export const UNIT_LABEL = '10 gm';

const UNIT_GRAMS = { '1g': 1, '10g': 10, '1kg': 1000 };
/** Converts a rate quoted per `unit` (e.g. '10g', '1kg') to rupees per gram. */
export const toPerGram = (value, unit) => {
  const grams = UNIT_GRAMS[unit];
  if (!grams) throw new Error(`Unknown rate unit: ${unit}`);
  return value / grams;
};

/** Display order. `purity` derives 22K from 24K in demo mode only. */
const LIST = [
  { key: 'gold24', label: 'Gold 24K', short: '24K', fineness: '999', metal: 'gold', demoBase: 147_463, volatility: 0.00012 },
  { key: 'gold22', label: 'Gold 22K', short: '22K', fineness: '916', metal: 'gold', derivedFrom: 'gold24', purity: 0.916 },
  // 20K: IBJA does not publish it. It is calculated from the 999 rate × 0.833, the same
  // way IBJA's own 916 and 750 rates relate to 999 (exactly × 0.916 and × 0.750), and labelled so.
  { key: 'gold20', label: 'Gold 20K', short: '20K', fineness: '833', metal: 'gold', derivedFrom: 'gold24', purity: 0.833, calculated: true },
  // 18K: on the daily rate page and for 18KT pieces; not on the showroom panel.
  { key: 'gold18', label: 'Gold 18K', short: '18K', fineness: '750', metal: 'gold', derivedFrom: 'gold24', purity: 0.75, panel: false },
  { key: 'silver', label: 'Silver 999', short: 'Silver', fineness: '999', metal: 'silver', demoBase: 2_180, volatility: 0.0002, perGrams: 1000, unitLabel: 'kg' },
  // The showroom's silver jewellery rate: no market publishes it, so it comes only from the admin panel.
  { key: 'silverJewellery', label: 'Silver jewellery', short: 'Silver jewellery', fineness: null, metal: 'silver', showroomOnly: true },
];

export const METALS = LIST.map((m) => ({ perGrams: DISPLAY_GRAMS, unitLabel: UNIT_LABEL, ...m }));

export const metalByKey = Object.fromEntries(METALS.map((m) => [m.key, m]));
