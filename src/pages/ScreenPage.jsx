import { useEffect } from 'react';
import AdStage from '../components/adstage/AdStage';
import { useDocumentTitle } from '../hooks/useDocumentTitle';


/**
 * /screen — the showroom TV. Only the commercial, filling the whole screen:
 * no header, menu or website buttons. Open it on the TV's browser and press
 * F (or the full-screen button that appears when the mouse moves).
 *
 * Left running for days, it keeps the display awake where the browser allows;
 * admin changes appear within seconds, without a reload (src/content/siteContent.js).
 */
export default function ScreenPage() {
  useDocumentTitle('Showroom screen');

  // Not a page for search engines; never a scrollbar or a flash of white on the TV.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    const html = document.documentElement;
    const { overflow, background } = html.style;
    html.style.overflow = 'hidden';
    html.style.background = '#0b0807';
    return () => {
      meta.remove();
      html.style.overflow = overflow;
      html.style.background = background;
    };
  }, []);

  // Keep the TV from dimming or sleeping (Screen Wake Lock; no permission prompt).
  useEffect(() => {
    let lock = null;
    const request = async () => {
      try {
        if (document.visibilityState === 'visible') lock = await navigator.wakeLock?.request('screen');
      } catch {
        /* not supported or not allowed: the TV's own settings apply */
      }
    };
    request();
    document.addEventListener('visibilitychange', request);
    return () => {
      document.removeEventListener('visibilitychange', request);
      lock?.release?.().catch(() => {});
    };
  }, []);

  return (
    <main>
      <h1 className="sr-only">Pradeep Jewellers</h1>
      <AdStage />
    </main>
  );
}
