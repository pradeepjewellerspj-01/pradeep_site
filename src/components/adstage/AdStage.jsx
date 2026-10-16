import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize, Minimize, Pause, Play } from 'lucide-react';
import GoldRateBoard from './GoldRateBoard';
import BrandNameHi from '../common/BrandNameHi';
import { useContentVersion } from '../../content/useContentVersion';
import monogram from '../../assets/brand/pj-monogram.png';
import { playableAds, screen } from '../../data/ads';
import { business, contact } from '../../data/footer';
import { resolveImage } from '../../data/images';
import { useReducedMotion } from '../../hooks/useViewportMode';
import { gsap, useGSAP } from '../../utils/gsap';
import './adStage.css';

/**
 * The showroom-TV commercial: a full-screen, self-running sequence of the
 * brand, photographs and videos (the reel), with today's price list fixed
 * beside it. It plays on its own page, /screen (pages/ScreenPage.jsx), and
 * in the admin panel's preview.
 *
 * Built for a screen nobody touches: no links, the showroom's address and
 * WhatsApp on the brand card, and controls that appear only when a mouse
 * moves. Sizes use container units (the reel and the stage are containers),
 * so the same composition fills a preview box, a 720p TV or a 4K screen.
 * Timing: each advertisement shows for its duration, or a video until it
 * ends; playback pauses while the tab is hidden or the viewer presses pause.
 */

const FADE_MS = 1400;
const IDLE_MS = 3000;

/** The PJ lockup from the letterhead, or the logo uploaded in the admin panel. */
function BrandLockup({ size = 'hero' }) {
  const logo = screen.logo ? resolveImage(screen.logo) : null;
  if (logo) return <img src={logo} alt={business.name} className={`ad-logo-custom ad-logo-custom--${size}`} data-ad-logo />;
  return (
    <span className={`ad-lockup ad-lockup--${size}`} data-ad-logo>
      <img src={monogram} alt="" aria-hidden="true" className="ad-lockup-mark" />
      <span className="ad-lockup-words" aria-hidden="true">
        <BrandNameHi tone="light" className="ad-lockup-hi" />
        <span className="ad-lockup-en">Jewellers</span>
      </span>
      <span className="sr-only">{business.name}</span>
    </span>
  );
}

/** Today's date and time, as on a broadcast. */
function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <span className="ad-clock">
      <span>{now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
      <span className="ad-clock-time">{now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</span>
    </span>
  );
}

/** Background media for one advertisement. Portrait photos are framed rather than stretched. */
function AdMedia({ ad, active, running, reduced, onVideo, progressRef }) {
  const src = ad.media ? resolveImage(ad.media) : null;
  const video = useRef(null);
  const [portrait, setPortrait] = useState(null); // null until the image has loaded

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (active && running) {
      const p = v.play();
      if (p?.catch) p.then(() => onVideo?.('playing')).catch(() => onVideo?.('blocked'));
    } else v.pause();
  }, [active, running, onVideo]);

  if (!src) return <div className="ad-media ad-media--plain" aria-hidden="true" />;

  if (ad.type === 'video' || /\.(mp4|webm)(\?|$)/i.test(src)) {
    return (
      <div className="ad-media" aria-hidden="true">
        {ad.poster && <img src={resolveImage(ad.poster)} alt="" className="ad-media-fill" />}
        <video
          ref={video}
          className="ad-media-fill"
          src={src}
          poster={ad.poster ? resolveImage(ad.poster) : undefined}
          muted
          playsInline
          preload="auto"
          loop={!ad.advanceOnEnd}
          onEnded={() => onVideo?.('ended')}
          onError={() => onVideo?.('blocked')}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (progressRef?.current && v.duration && ad.advanceOnEnd) progressRef.current.style.transform = `scaleX(${v.currentTime / v.duration})`;
          }}
        />
      </div>
    );
  }

  return (
    <div className={`ad-media ${portrait ? 'ad-media--portrait' : ''} ${portrait === null ? 'is-loading' : ''}`} aria-hidden="true">
      {portrait && <img src={src} alt="" className="ad-media-fill ad-media-backdrop" />}
      <img
        src={src}
        alt=""
        decoding="async"
        className={`${portrait ? 'ad-media-frame' : 'ad-media-fill'} ${reduced ? '' : 'ad-kb'}`}
        onLoad={(e) => setPortrait(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight < 1.15)}
        onError={() => setPortrait(false)}
      />
    </div>
  );
}

/** The words for one advertisement. A TV has no clicks, so the call to action reads as a sign-off. */
function AdCopy({ ad, showSilver }) {
  if (ad.type === 'brand') {
    return (
      <div className="ad-brand">
        <span className="ad-brand-rule" data-ad-rule aria-hidden="true" />
        <BrandLockup />
        {screen.tagline && (
          <p lang="hi" className="ad-brand-tagline" data-ad-in>
            {screen.tagline}
          </p>
        )}
        <span className="ad-brand-rule" data-ad-rule aria-hidden="true" />
        <p className="ad-brand-meta" data-ad-in>
          {[ad.eyebrow, ad.description].filter(Boolean).join(' · ')}
        </p>
        <p className="ad-brand-visit" data-ad-in>
          <span>{business.addressLine}</span>
          <span>WhatsApp {contact.whatsapp.replace(/^\+91 /, '')}</span>
        </p>
      </div>
    );
  }

  const words = (
    <div className="ad-copy">
      {ad.eyebrow && (
        <p className="ad-eyebrow" data-ad-in>
          <span aria-hidden="true" className="ad-eyebrow-rule" />
          {ad.eyebrow}
        </p>
      )}
      {ad.title && (
        <h2 className="ad-title" data-ad-in>
          {ad.title}
        </h2>
      )}
      {ad.description && (
        <p className="ad-desc" data-ad-in>
          {ad.description}
        </p>
      )}
      {ad.cta && (
        <p className="ad-signoff" data-ad-in>
          <span className="ad-signoff-rule" aria-hidden="true" />
          {ad.cta} · in the showroom &amp; on WhatsApp
        </p>
      )}
    </div>
  );

  if (ad.type === 'rates') {
    return (
      <div className="ad-ratesSlide">
        {words}
        <GoldRateBoard variant="board" showSilver={showSilver} />
      </div>
    );
  }
  return words;
}

export default function AdStage({ items, preview = false, className = '' }) {
  const reduced = useReducedMotion();
  const contentVersion = useContentVersion(); // advertisements edited in the admin panel arrive live
  const list = useMemo(() => items ?? playableAds(), [items, contentVersion]); // eslint-disable-line react-hooks/exhaustive-deps
  const n = list.length;
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(null);
  const [userPaused, setUserPaused] = useState(false);
  const [hidden, setHidden] = useState(() => typeof document !== 'undefined' && document.hidden);
  const [video, setVideo] = useState('pending'); // pending | playing | blocked | ended
  const [active, setActive] = useState(false); // pointer moved recently: show controls and cursor
  const [fullscreen, setFullscreen] = useState(false);
  const running = !userPaused && !hidden;
  const root = useRef(null);
  const reel = useRef(null);
  const progress = useRef(null);
  const remaining = useRef(0);

  // Box-relative units for adStage.css: --cw / --ch = 1% of each box's width / height.
  // (Container query units do the same, but Android TV WebViews older than Chrome 105 lack them.)
  useLayoutEffect(() => {
    const boxes = [root.current, reel.current].filter(Boolean);
    const measure = () =>
      boxes.forEach((el) => {
        el.style.setProperty('--cw', `${el.clientWidth / 100}px`);
        el.style.setProperty('--ch', `${el.clientHeight / 100}px`);
      });
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const ro = new ResizeObserver(measure);
    boxes.forEach((el) => ro.observe(el));
    return () => ro.disconnect();
  }, [n > 0]); // the stage renders only once there is something to play

  const ad = list[index % Math.max(n, 1)];
  // A live update can shorten the list: start again from the first advertisement.
  useEffect(() => {
    if (index >= n) setIndex(0);
  }, [index, n]);

  const go = useCallback(
    (next) => {
      if (n < 2) return;
      setIndex((i) => {
        const to = ((next(i) % n) + n) % n;
        if (to !== i) setLeaving(i);
        return to;
      });
    },
    [n],
  );

  // Each advertisement starts with its full duration.
  useEffect(() => {
    remaining.current = (ad?.duration ?? 8) * 1000;
    setVideo('pending');
    if (progress.current) progress.current.style.transform = 'scaleX(0)';
    const t = window.setTimeout(() => setLeaving(null), FADE_MS);
    return () => window.clearTimeout(t);
  }, [index, ad?.duration]);

  // Timer: counts down only while running; a video set to advance on end waits for it instead.
  const waitsForVideo = ad?.type === 'video' && ad.advanceOnEnd && video !== 'blocked';
  useEffect(() => {
    if (!running || n < 2 || waitsForVideo) return undefined;
    const started = performance.now();
    const t = window.setTimeout(() => go((i) => i + 1), remaining.current);
    return () => {
      window.clearTimeout(t);
      remaining.current = Math.max(0, remaining.current - (performance.now() - started));
    };
  }, [running, n, waitsForVideo, index, go]);

  useEffect(() => {
    if (video === 'ended' && running) go((i) => i + 1);
  }, [video, running, go]);

  const onVideo = useCallback((state) => setVideo(state), []);

  // Pause while the tab is hidden.
  useEffect(() => {
    const update = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  // Full screen: the F key / button (Fullscreen API), or the browser's own F11,
  // which fires no event and is recognised by the window filling the display.
  useEffect(() => {
    if (preview) return undefined;
    // window.screen: `screen` in this file is the advertisement branding from data/ads.
    const update = () => setFullscreen(Boolean(document.fullscreenElement) || (window.innerWidth >= window.screen.width - 1 && window.innerHeight >= window.screen.height - 1));
    update();
    document.addEventListener('fullscreenchange', update);
    window.addEventListener('resize', update);
    return () => {
      document.removeEventListener('fullscreenchange', update);
      window.removeEventListener('resize', update);
    };
  }, [preview]);

  // Out of full screen, controls and cursor appear on pointer movement and fade after a few
  // seconds. In full screen they never appear: only the commercial, like a TV.
  // (Keys still work: arrows, space, F; Esc leaves full screen.)
  const idle = useRef(0);
  const wake = useCallback(() => {
    if (fullscreen) return;
    setActive(true);
    window.clearTimeout(idle.current);
    idle.current = window.setTimeout(() => setActive(false), IDLE_MS);
  }, [fullscreen]);
  useEffect(() => () => window.clearTimeout(idle.current), []);
  useEffect(() => {
    if (!fullscreen) return;
    window.clearTimeout(idle.current);
    setActive(false);
    document.activeElement?.blur?.(); // a focused control would otherwise stay visible
  }, [fullscreen]);
  const toggleFullscreen = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.())?.catch?.(() => {});

  // Preload the next advertisement's media so the crossfade never shows a blank frame.
  useEffect(() => {
    const next = list[(index + 1) % Math.max(n, 1)];
    const src = next?.media ? resolveImage(next.media) : null;
    if (!src || n < 2) return undefined;
    if (next.type === 'video' || /\.(mp4|webm)(\?|$)/i.test(src)) {
      const v = document.createElement('video');
      v.preload = 'auto';
      v.muted = true;
      v.src = src;
      return () => v.removeAttribute('src');
    }
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    return undefined;
  }, [index, list, n]);

  // Entrances: logo, rules, then the words.
  useGSAP(
    () => {
      const scope = root.current?.querySelector('.ad-layer.is-current');
      if (!scope) return;
      const lines = scope.querySelectorAll('[data-ad-in]');
      if (reduced) {
        gsap.fromTo(lines, { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.05 });
        return;
      }
      const tl = gsap.timeline({ delay: 0.35 });
      const logo = scope.querySelector('[data-ad-logo]');
      if (logo) tl.fromTo(logo, { opacity: 0, scale: 0.94, filter: 'blur(6px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.6, ease: 'power3.out' }, 0);
      const rules = scope.querySelectorAll('[data-ad-rule]');
      if (rules.length) tl.fromTo(rules, { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'power2.inOut', stagger: 0.1 }, 0.2);
      tl.fromTo(lines, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.12, ease: 'power3.out' }, logo ? 0.7 : 0);
    },
    { scope: root, dependencies: [index, reduced, n] },
  );

  // Keyboard (or a TV remote's arrow keys): arrows move, space pauses, F toggles full screen.
  // On /screen the keys work anywhere on the page (nobody clicks a TV to focus it);
  // in the admin preview only while the preview has focus.
  const onKeyDown = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    // TV remotes: arrows, OK (Enter), play/pause and next/previous media keys.
    if (e.key === 'ArrowRight' || e.key === 'MediaTrackNext' || e.key === 'MediaFastForward') go((i) => i + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'MediaTrackPrevious' || e.key === 'MediaRewind') go((i) => i - 1);
    else if ((e.key === ' ' || e.key === 'Enter') && !e.target.closest?.('button, a')) {
      e.preventDefault();
      setUserPaused((p) => !p);
    } else if (e.key === 'MediaPlayPause') setUserPaused((p) => !p);
    else if (e.key === 'MediaPlay') setUserPaused(false);
    else if (e.key === 'MediaPause') setUserPaused(true);
    else if ((e.key === 'f' || e.key === 'F') && !preview) toggleFullscreen();
    else return;
    wake();
  };
  const keyHandler = useRef(onKeyDown);
  keyHandler.current = onKeyDown;
  useEffect(() => {
    if (preview) return undefined;
    const listen = (e) => keyHandler.current(e);
    window.addEventListener('keydown', listen);
    return () => window.removeEventListener('keydown', listen);
  }, [preview]);

  if (!n) return null;
  const layers = leaving != null && leaving !== index && list[leaving] ? [leaving, index] : [index];

  return (
    <section
      ref={root}
      className={`ad-stage ${preview ? 'ad-stage--preview' : ''} ${running ? '' : 'is-paused'} ${reduced ? 'is-reduced' : ''} ${active ? 'is-active' : ''} ${fullscreen ? 'is-fullscreen' : ''} ${className}`}
      aria-roledescription="carousel"
      aria-label="Pradeep Jewellers showcase"
      tabIndex={-1}
      onKeyDown={preview ? onKeyDown : undefined}
      onPointerMove={wake}
      onPointerDown={wake}
    >
      {/* The advertisements play in the reel; the price list beside it never changes place. */}
      <div ref={reel} className="ad-reel">
        {layers.map((i) => {
          const item = list[i];
          const current = i === index;
          return (
            <div
              key={`${item.id}-${i}`}
              className={`ad-layer ad-layer--${item.type} ${current ? 'is-current' : 'is-leaving'}`}
              aria-hidden={!current}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${n}`}
            >
              <AdMedia ad={item} active={current} running={running} reduced={reduced} onVideo={current ? onVideo : undefined} progressRef={current ? progress : undefined} />
              <div className="ad-shade" aria-hidden="true" />
              {!reduced && <div className="ad-sheen" aria-hidden="true" />}
              <div className="ad-safe">
                <AdCopy ad={item} showSilver={screen.showSilver} />
              </div>
            </div>
          );
        })}

        {!reduced && (
          <div className="ad-particles" aria-hidden="true">
            {Array.from({ length: 14 }, (_, i) => (
              <span
                key={i}
                style={{ '--x': `${(i * 37) % 100}%`, '--y': `${(i * 61) % 100}%`, '--d': `${14 + ((i * 7) % 12)}s`, '--delay': `${-(i * 2.3)}s`, '--s': `${2 + (i % 3)}px` }}
              />
            ))}
          </div>
        )}

        {/* The brand bug, hidden on the brand card itself. */}
        <div className="ad-top" aria-hidden="true">
          <span className={`ad-corner ${ad.type === 'brand' ? 'is-off' : ''}`}>
            <BrandLockup size="corner" />
          </span>
        </div>

        {/* Thin progress line for the current advertisement. */}
        <div className="ad-line" aria-hidden="true">
          <span
            ref={progress}
            key={`line-${index}`}
            className="ad-line-fill"
            style={!waitsForVideo ? { animationDuration: `${ad.duration}s` } : undefined}
            data-timed={!waitsForVideo ? 'true' : undefined}
          />
        </div>

        <div className="ad-controls">
          <div className="ad-progress" role="group" aria-label="Choose an advertisement">
            {list.map((item, i) => (
              <button
                key={`${item.id}-${i}`}
                type="button"
                className={`ad-seg ${i === index ? 'is-on' : ''} ${i < index ? 'is-done' : ''}`}
                onClick={() => go(() => i)}
                onFocus={wake}
                aria-label={`Show advertisement ${i + 1}: ${item.title || item.eyebrow || item.type}`}
                aria-current={i === index ? 'true' : undefined}
              />
            ))}
          </div>
          <span className="ad-count" aria-hidden="true">
            {String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
          </span>
          <button type="button" className="ad-btn" onClick={() => go((i) => i - 1)} onFocus={wake} aria-label="Previous advertisement" disabled={n < 2}>
            <ChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            className="ad-btn"
            onClick={() => setUserPaused((p) => !p)}
            onFocus={wake}
            aria-label={userPaused ? 'Play advertisements' : 'Pause advertisements'}
            aria-pressed={userPaused}
          >
            {userPaused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
          </button>
          <button type="button" className="ad-btn" onClick={() => go((i) => i + 1)} onFocus={wake} aria-label="Next advertisement" disabled={n < 2}>
            <ChevronRight aria-hidden="true" />
          </button>
          {!preview && (
            <button type="button" className="ad-btn" onClick={toggleFullscreen} onFocus={wake} aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}>
              {fullscreen ? <Minimize aria-hidden="true" /> : <Maximize aria-hidden="true" />}
            </button>
          )}
        </div>
      </div>

      {/* The permanent price list, like the rate board on a showroom wall. */}
      <aside className="ad-pricelist" aria-label="Today’s price list">
        <header className="ad-pl-head">
          <p className="ad-pl-title">
            <span lang="hi">आज का भाव</span>
            <span className="ad-pl-en">Today’s rate</span>
            <span className="ad-pl-sub">(Excluding making charges and taxes)</span>
          </p>
          <Clock />
        </header>
        <GoldRateBoard variant="list" showSilver={screen.showSilver} />
      </aside>
    </section>
  );
}
