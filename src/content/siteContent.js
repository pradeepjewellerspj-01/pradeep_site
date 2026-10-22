import { applyProducts } from '../data/products';
import { applyPromotions } from '../data/promotions';
import { applyAds } from '../data/ads';
import { applyStyling } from '../data/editorial';
import { applyContactSettings } from '../data/footer';
import { applyCategories } from '../data/navigation';
import { applyHomeSections } from '../data/home';
import { applyHomeContent } from '../data/collections';
import { applyReviews } from '../data/reviews';
import { products } from '../data/products';
import { resolveImage } from '../data/images';
import { setShowroomRates } from '../market/marketService';
import { telFor } from './schema';

/**
 * Content saved in the admin panel (Turso, via /api/content) replaces the
 * catalogue, offers, contact details and rate mode bundled with the site.
 * It is applied once, before the first render, so every page reads plain
 * module data as before. If the API is slow or unreachable, the last copy
 * this browser saw is used, and failing that the bundled content.
 */

const URL = '/api/content';
const TIMEOUT_MS = 2500;
const CACHE_KEY = 'pj-content';

function apply(content) {
  if (!content?.initialized) return false;
  applyProducts(content.products ?? [], resolveImage);
  applyCategories(content.settings?.categories, products);
  applyPromotions(content.promotions ?? [], resolveImage);
  applyContactSettings(content.settings?.contact, telFor);
  setShowroomRates(content.settings?.rates);
  applyAds(content.ads, content.settings?.screen);
  applyStyling(content.settings?.styling, resolveImage);
  applyHomeSections(content.settings?.home);
  applyHomeContent(content.settings?.homeContent, resolveImage);
  applyReviews(content.settings?.reviews);
  return true;
}

const readCache = () => {
  try {
    return JSON.parse(window.localStorage.getItem(CACHE_KEY) ?? 'null');
  } catch {
    return null;
  }
};

const writeCache = (content) => {
  try {
    if (content?.initialized) window.localStorage.setItem(CACHE_KEY, JSON.stringify(content));
    else window.localStorage.removeItem(CACHE_KEY);
  } catch {
    /* storage full or blocked: the next visit fetches again */
  }
};

// ---------- Live updates ----------
// Admin changes reach open pages without a reload: pages ask every few seconds
// (an unchanged answer is a tiny 304), apply what changed to the data modules,
// and bump a version that React components re-render on (useContentVersion).

const LIVE_MS = 10_000;
let appliedAt; // updatedAt of the content in use (undefined until the first answer)
let version = 0;
const listeners = new Set();
const bump = () => {
  version += 1;
  listeners.forEach((l) => l());
};
export const subscribeContent = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const getContentVersion = () => version;

async function fetchContent(signal) {
  // no-cache: always ask the server (the CDN answers quickly), never reuse an old browser copy.
  const res = await fetch(URL, { signal, cache: 'no-cache', headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Content API responded ${res.status}`);
  return res.json();
}

export async function loadSiteContent() {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(new DOMException(`No answer within ${TIMEOUT_MS} ms`, 'TimeoutError')), TIMEOUT_MS);
  try {
    const content = await fetchContent(controller.signal);
    writeCache(content);
    appliedAt = content.updatedAt ?? null;
    return apply(content) ? 'saved' : 'bundled';
  } catch (error) {
    if (import.meta.env.DEV) console.warn('[content]', error);
    return apply(readCache()) ? 'cached' : 'bundled';
  } finally {
    window.clearTimeout(timer);
  }
}

async function checkForChanges() {
  if (document.hidden) return;
  try {
    const content = await fetchContent();
    const at = content.updatedAt ?? null;
    if (at === appliedAt) return;
    appliedAt = at;
    writeCache(content);
    if (apply(content)) bump();
  } catch {
    /* offline for a moment: keep what is shown */
  }
}

/** Starts watching for admin changes (call once, after the first render). */
export function startLiveContent(intervalMs = LIVE_MS) {
  if (startLiveContent.started) return;
  startLiveContent.started = true;
  window.setInterval(checkForChanges, intervalMs);
  document.addEventListener('visibilitychange', () => !document.hidden && checkForChanges());
}
