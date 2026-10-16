/**
 * Refreshes src/market/ibjaReference.json, the bundled fallback the site shows
 * if the live /api/rates endpoint cannot be reached.
 *
 *   npm run rates:ibja
 */
import { writeFile } from 'node:fs/promises';
import { fetchIbjaRates } from '../server/ibja.mjs';

const OUT = new URL('../src/market/ibjaReference.json', import.meta.url);

const data = await fetchIbjaRates();
await writeFile(OUT, `${JSON.stringify(data, null, 2)}\n`);
const { published, current, history } = data;
console.log(
  `IBJA ${published.date} ${published.session}: 999 ₹${current.gold24}/10g · 916 ₹${current.gold22}/10g · silver ₹${current.silver}/kg · ${history.dates.length} sessions of history`,
);
