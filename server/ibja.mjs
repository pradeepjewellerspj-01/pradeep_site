/**
 * Reads IBJA's published rates from ibjarates.com and returns them in the
 * shape of src/market/ibjaReference.json (gold per 10 g, silver per kg; the
 * site converts to per gram).
 *
 * Used by:
 *   - the /api/rates endpoint (vite.config.js for dev/preview, api/rates.js for deployment)
 *   - scripts/update-ibja-rates.mjs (refreshes the bundled fallback snapshot)
 *
 * IBJA publishes an AM and a PM session on business days. For production pricing
 * IBJA asks that its rates be consumed through the official IBJA API.
 */
export const SOURCE_URL = 'https://ibjarates.com/';

const SOURCE = {
  name: 'India Bullion and Jewellers Association (IBJA)',
  short: 'IBJA',
  url: SOURCE_URL,
  kind: 'Indicative retail selling rate',
  note: 'Rates exclude 3% GST and making charges.',
};

const toIso = (dmy) => {
  const [d, m, y] = dmy.split('/');
  return `${y}-${m}-${d}`;
};

/** Today's date in India, YYYY-MM-DD. */
const indiaToday = (now) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(now);

export function parseIbjaPage(html, now = new Date()) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');

  // Latest day's table: "Purity AM PM Gold 999 145564 145942 Gold 995 ... Gold 916 133337 133683 ... Silver 999 207098 208275".
  // Before the PM session is published, each row has only the AM figure.
  const row = (label) => {
    const m = text.match(new RegExp(`Purity AM PM .*?${label} (\\d+)(?: (\\d+))? (?:Gold|Silver|Platinum|Previous)`));
    if (!m) throw new Error(`Could not read "${label}" from the IBJA page. The layout may have changed.`);
    return { am: +m[1], pm: m[2] ? +m[2] : null };
  };
  const g24 = row('Gold 999');
  const g22 = row('Gold 916');
  const g18 = row('Gold 750');
  const ag = row('Silver 999');
  const session = g24.pm != null ? 'PM' : 'AM';
  const pick = (r) => (session === 'PM' ? r.pm : r.am);
  const current = { gold24: pick(g24), gold22: pick(g22), gold18: pick(g18), silver: pick(ag) };

  // Session history embedded for IBJA's own charts (PM rates, oldest first).
  const hidden = (id) => {
    const m = html.match(new RegExp(`id="${id}" value="([^"]*)"`));
    if (!m) throw new Error(`Missing ${id} on the IBJA page`);
    return JSON.parse(m[1].replace(/&quot;/g, '"'));
  };
  const gold = hidden('HdnGold');
  const silver = hidden('HdnSilver');

  // "Previous Dates Rate": most recent dates first, the AM table then the PM table.
  // Columns: 999, 995, 916, 750, 585, Silver 999, Platinum 999.
  const rows = [...text.matchAll(/(\d{2}\/\d{2}\/\d{4}) (\d+) \d+ (\d+) (\d+) \d+ (\d+) \d+/g)].map((m) => ({
    date: toIso(m[1]),
    gold24: +m[2],
    gold22: +m[3],
    gold18: +m[4],
    silver: +m[5],
  }));
  const half = rows.length / 2;
  const amRows = rows.slice(0, half);
  const pmRows = rows.slice(half);

  // Which day the latest table belongs to. Its own heading has no date, so:
  //  1. once the PM rate is out, IBJA's chart series ends with that day's PM close and its date;
  //  2. a table that repeats the most recent dated AM row is that day;
  //  3. otherwise it is today's AM, published during today's business hours.
  // (Assuming "today" for a PM table mislabels yesterday's rates after midnight.)
  const chartDates = gold.labels.map(toIso);
  const chartLast = Number(gold.purity999.at(-1));
  const repeatsLast = amRows[0] && amRows[0].gold24 === g24.am && amRows[0].silver === ag.am;
  const date = g24.pm != null && chartLast === g24.pm ? chartDates.at(-1) : repeatsLast ? amRows[0].date : indiaToday(now);
  // Change is measured against the previous business day's PM close.
  const prev = pmRows.find((r) => r.date < date) ?? pmRows[0];

  return {
    source: SOURCE,
    units: { gold: '10g', silver: '1kg' },
    published: { date, session },
    fetchedAt: now.toISOString(),
    current,
    sessions: {
      am: { gold24: g24.am, gold22: g22.am, gold18: g18.am, silver: ag.am },
      pm: g24.pm != null ? { gold24: g24.pm, gold22: g22.pm, gold18: g18.pm, silver: ag.pm } : null,
    },
    previousClose: prev ? { date: prev.date, session: 'PM', gold24: prev.gold24, gold22: prev.gold22, gold18: prev.gold18, silver: prev.silver } : null,
    recentSessions: { am: amRows, pm: pmRows },
    history: {
      session: 'PM',
      dates: chartDates,
      gold24: gold.purity999.map(Number),
      gold22: gold.purity916.map(Number),
      silver: silver.silverRate.map(Number),
    },
  };
}

export async function fetchIbjaRates({ now = new Date(), fetchImpl = fetch } = {}) {
  // A slow IBJA must not hold visitors' requests: give up after 8 s and serve the last good rates.
  const res = await fetchImpl(SOURCE_URL, { headers: { 'User-Agent': 'Mozilla/5.0 (Pradeep Jewellers rates)' }, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`IBJA responded ${res.status}`);
  return parseIbjaPage(await res.text(), now);
}

/**
 * Provider, configured on the server only (never VITE_*, so keys stay private):
 *   RATES_API_URL         a licensed rate feed (for example IBJA's official API). Unset: ibjarates.com.
 *   RATES_API_KEY         its key, sent as `Authorization: Bearer <key>` …
 *   RATES_API_KEY_HEADER  … or in this header instead (e.g. x-api-key).
 *   RATES_CACHE_SECONDS   how long one fetch is reused (default 300, minimum 60).
 * The feed must return this file's JSON shape, or { rates: { gold24: { price, unit } … } }
 * (see normalizeLivePayload in src/market/marketService.js).
 */
async function fetchConfiguredRates() {
  const url = process.env.RATES_API_URL;
  if (!url) return fetchIbjaRates();
  const key = process.env.RATES_API_KEY;
  const header = process.env.RATES_API_KEY_HEADER;
  const headers = { Accept: 'application/json', ...(key ? (header ? { [header]: key } : { Authorization: `Bearer ${key}` }) : {}) };
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`Rate provider responded ${res.status}`);
  const data = await res.json();
  return { fetchedAt: new Date().toISOString(), ...data };
}

// One shared cache so many visitors cause at most one provider request per period.
const cacheMs = () => Math.max(60, Number(process.env.RATES_CACHE_SECONDS) || 300) * 1000;
let cached = null;
let inflight = null;

export async function getIbjaRatesCached() {
  if (cached && Date.now() - cached.at < cacheMs()) return cached.data;
  if (!inflight) {
    inflight = fetchConfiguredRates()
      .then((data) => {
        cached = { at: Date.now(), data };
        return data;
      })
      .finally(() => {
        inflight = null;
      });
  }
  try {
    return await inflight;
  } catch (error) {
    // Provider unreachable: serve the last good rates, marked stale so the site says "Delayed".
    if (cached) return { ...cached.data, stale: true };
    throw error;
  }
}

/** Node-style handler for GET /api/rates. */
export async function ratesHandler(_req, res) {
  try {
    const data = await getIbjaRatesCached();
    const seconds = cacheMs() / 1000;
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', data.stale ? 'no-store' : `public, max-age=60, s-maxage=${seconds}, stale-while-revalidate=${seconds * 2}`);
    res.end(JSON.stringify(data));
  } catch (error) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify({ error: 'Rates unavailable', detail: String(error.message ?? error) }));
  }
}

/** Non-secret description of the rate source, for the admin panel. */
export const ratesConfig = () => ({
  provider: process.env.RATES_API_URL ? 'custom' : 'ibja',
  host: process.env.RATES_API_URL ? new URL(process.env.RATES_API_URL).hostname : 'ibjarates.com',
  cacheSeconds: cacheMs() / 1000,
});
