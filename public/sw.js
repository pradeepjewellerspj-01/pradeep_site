/*
 * Service worker for the installed apps: the showroom TV (/screen) and the
 * admin panel (/admin). Registered only from those pages (src/pwa.js).
 *
 * Its job is to keep a showroom TV playing when the internet drops or the TV
 * restarts offline:
 *   pages                 network first, the last copy offline
 *   /assets/*, photos     cache first (file names change with content)
 *   /api/content          network first, the last copy offline
 *   /api/rates            network first; offline, the last rates marked
 *                         "stale" so the site labels them Delayed, never current
 *   /api/admin/*          never cached (signed-in data and changes)
 *   video byte ranges     straight to the network
 *
 * Bump VERSION to drop every cache on the next visit.
 */
const VERSION = 'pj-v2';
const SHELL = `${VERSION}-shell`;
const STATIC = `${VERSION}-static`;
const DATA = `${VERSION}-data`;
const MEDIA = `${VERSION}-media`;
const MAX_MEDIA = 150;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((c) => c.addAll(['/screen', '/admin', '/screen.webmanifest', '/admin.webmanifest', '/pwa/icon-192.png', '/pwa/icon-512.png']))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const put = async (cacheName, request, response) => {
  // Cross-origin font files arrive opaque (status 0); keep those too.
  if (!response || (!response.ok && response.type !== 'opaque') || response.type === 'opaqueredirect') return;
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
  if (cacheName === MEDIA) {
    const keys = await cache.keys();
    for (const old of keys.slice(0, Math.max(0, keys.length - MAX_MEDIA))) await cache.delete(old);
  }
};

async function networkFirst(request, cacheName, { timeoutMs = 6000, fallbackKey } = {}) {
  try {
    const response = await Promise.race([fetch(request), new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs))]);
    if (response.ok) put(cacheName, fallbackKey ?? request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(fallbackKey ?? request);
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  put(cacheName, request, response.clone());
  return response;
}

// Offline rates: the last copy, marked stale (the market feed then shows "Delayed").
async function rates(request) {
  try {
    // Past the browser's HTTP cache, so "checked" on the screen means the server answered just now.
    const response = await fetch(new Request(request, { cache: 'no-store' }));
    if (response.ok) put(DATA, request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (!cached) throw error;
    const data = await cached.json();
    return new Response(JSON.stringify({ ...data, stale: true }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || request.headers.has('range')) return;
  const url = new URL(request.url);

  if (url.origin === location.origin) {
    if (url.pathname.startsWith('/api/admin')) return; // always live
    if (request.mode === 'navigate') {
      // One shell serves every route of the single-page app.
      const key = url.pathname.startsWith('/admin') ? '/admin' : '/screen';
      event.respondWith(networkFirst(request, SHELL, { fallbackKey: key }));
      return;
    }
    if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/pwa/')) return event.respondWith(cacheFirst(request, STATIC));
    if (url.pathname.startsWith('/api/images/')) return event.respondWith(cacheFirst(request, MEDIA));
    if (url.pathname === '/api/rates') return event.respondWith(rates(request));
    if (url.pathname === '/api/content') return event.respondWith(networkFirst(request, DATA));
    return;
  }

  // Google Fonts: keep the last copy so the TV keeps its typefaces offline.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(request, STATIC));
  }
});
