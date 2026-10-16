/**
 * The showroom TV (/screen) and the admin panel (/admin) are installable apps
 * (manifests chosen in index.html). Their service worker (public/sw.js) keeps
 * the TV playing offline. The website itself registers nothing.
 */
export function registerAppServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  if (!/^\/(screen|admin)(\/|$)/.test(window.location.pathname)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => console.warn('[pwa] service worker not registered', error));
  });
}
