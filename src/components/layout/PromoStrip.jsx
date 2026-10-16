import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { activePromotions } from '../../data/promotions';
import { useReducedMotion } from '../../hooks/useViewportMode';
import { useContentVersion } from '../../content/useContentVersion';

const ROTATE_MS = 5500;

/** Active promotions and which one is showing; rotation pauses on hover/focus and for reduced motion. */
function usePromotionRotation() {
  const version = useContentVersion(); // offers edited in the admin panel arrive live
  const items = useMemo(() => activePromotions(), [version]); // eslint-disable-line react-hooks/exhaustive-deps
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (items.length < 2 || paused || reduced) return undefined;
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % items.length), ROTATE_MS);
    return () => window.clearTimeout(t);
  }, [index, items.length, paused, reduced]);

  const pauseHandlers = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocus: () => setPaused(true),
    onBlur: () => setPaused(false),
  };
  return { items, index: items.length ? index % items.length : 0, setIndex, pauseHandlers }; // the list can shrink with a live update
}

/**
 * Campaign announcements between the header and the page, on every page and
 * in both the normal and large-display experiences. Content comes from
 * data/promotions.js; only enabled promotions inside their dates appear.
 */
export default function PromoStrip({ className = '' }) {
  const { items, index, setIndex, pauseHandlers } = usePromotionRotation();

  if (!items.length) return null;

  const current = items[index];

  return (
    <section aria-roledescription="carousel" aria-label="Occasions at Pradeep Jewellers" className={`promo promo--${current.tone} ${className}`} {...pauseHandlers}>
      <div className="promo-track">
        {items.map((p, i) => {
          const on = i === index;
          return (
            <Link
              key={p.id}
              to={p.href}
              inert={!on}
              aria-hidden={!on}
              aria-roledescription="slide"
              aria-label={`${p.occasion}: ${p.title}${p.discount ? ` ${p.discount}.` : ''} ${p.cta}`}
              className={`promo-slide group ${on ? 'is-on' : ''}`}
            >
              {p.image && <img src={p.image} alt="" className="promo-image" />}
              <span className="promo-kicker">
                <span className="promo-label">✦ {p.label}</span>
                <span aria-hidden="true" className="promo-rule" />
                <span className="promo-occasion">{p.occasion}</span>
              </span>
              <span className="promo-title">
                {p.title}
                {p.discount && <span className="promo-discount"> {p.discount}</span>}
              </span>
              <span className="promo-cta">
                <span className="promo-cta-text">{p.cta}</span>
                <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={1.4} aria-hidden="true" />
              </span>
            </Link>
          );
        })}
      </div>

      <div className="promo-controls">
        {items.length > 1 && (
          <div className="promo-dots" role="group" aria-label="Choose occasion">
            {items.map((p, i) => (
              <button key={p.id} type="button" aria-label={`Show ${p.occasion}`} aria-current={i === index} onClick={() => setIndex(i)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
