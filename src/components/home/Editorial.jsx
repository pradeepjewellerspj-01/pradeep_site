import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink, Maximize2, Pause, Play, Share2, X } from 'lucide-react';
import SectionHeading from '../common/SectionHeading';
import Drawer from '../overlays/Drawer';
import LikeButton from '../jewellery/LikeButton';
import { InstagramIcon } from '../common/BrandIcons';
import { stories } from '../../data/editorial';
import { getProduct, productCode, productPath } from '../../data/products';
import { useStore } from '../../context/StoreContext';
import { useReveal } from '../../hooks/useReveal';
import { useReducedMotion } from '../../hooks/useViewportMode';
import { useContentVersion } from '../../content/useContentVersion';

const STORY_MS = 5000;
const SWIPE_PX = 40;
// Shortest signed distance between two cards on a ring of n.
const wrap = (d, n) => ((d + n + Math.floor(n / 2)) % n) - Math.floor(n / 2);
const pad = (i) => String(i + 1).padStart(2, '0');

// Layered deck: the front story, then steps back on each side. Phones show one
// step per side, pulled in so every visible card stays on screen.
const LAYOUTS = {
  wide: {
    0: { x: 0, scale: 1, z: 30 },
    1: { x: 52, scale: 0.76, z: 20 },
    2: { x: 88, scale: 0.66, z: 10 },
  },
  phone: {
    0: { x: 0, scale: 1, z: 30 },
    1: { x: 30, scale: 0.82, z: 20 },
  },
};

function usePhone() {
  const query = '(max-width: 767px)';
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const onChange = () => setPhone(list.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, []);
  return phone;
}

// Instagram's own player for a reel, loaded only when the viewer opens it.
const reelEmbed = (code) => `https://www.instagram.com/reel/${code}/embed/`;

// A reel without a cover: an Instagram-style card (Instagram gives no thumbnail without its API).
function ReelPlaceholder({ title }) {
  return (
    // Logo and title sit low, clear of the play button in the middle and above the product chip.
    <div className="absolute inset-0 flex flex-col items-center justify-end gap-2.5 bg-[linear-gradient(160deg,#3a1f2b,#1a1013_55%,#2b1a0f)] px-6 pb-[100px] text-center text-white">
      <InstagramIcon className="size-6 opacity-80 max-md:hidden" aria-hidden="true" />
      <p className="line-clamp-3 font-serif text-[17px] font-light leading-snug text-white/90">{title}</p>
    </div>
  );
}

function StoryCard({ story, index, total, offset, layout, onSelect, playing, onExpand }) {
  const { notify } = useStore();
  const product = getProduct(story.productId);
  const depth = Math.abs(offset);
  const isCenter = offset === 0;
  const slot = layout[depth];
  const hidden = !slot;

  const share = async () => {
    const data = { title: 'Pradeep Jewellers', text: story.title, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(window.location.href);
        notify('Link copied');
      }
    } catch {
      /* user cancelled share sheet */
    }
  };

  return (
    <article
      aria-hidden={!isCenter}
      className="absolute left-1/2 top-1/2 aspect-[9/16] w-[min(62vw,285px)] overflow-hidden rounded-[6px] bg-ink shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45)] transition-[transform,opacity] duration-700 ease-[var(--ease-lux)]"
      style={{
        transform: `translate(-50%, -50%) translateX(${hidden ? 0 : Math.sign(offset) * slot.x}%) scale(${hidden ? 0.6 : slot.scale})`,
        zIndex: hidden ? 0 : slot.z,
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? 'none' : 'auto',
      }}
    >
      {story.image ? (
        <img
          src={story.image}
          alt={isCenter ? story.title : ''}
          decoding="async"
          draggable={false}
          className="ken-burns absolute inset-0 h-full w-full select-none object-cover"
          style={{ animationPlayState: isCenter && playing ? 'running' : 'paused' }}
        />
      ) : (
        <ReelPlaceholder title={story.title} />
      )}
      {/* Side cards sit slightly in shadow; an overlay fades smoothly where a filter would not. */}
      <div aria-hidden="true" className={`absolute inset-0 bg-black transition-opacity duration-700 ${isCenter ? 'opacity-0' : 'opacity-[0.18]'}`} />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.45),transparent_20%,transparent_62%,rgba(0,0,0,0.6))]" />

      {!isCenter && !hidden && <button type="button" tabIndex={-1} className="absolute inset-0" aria-label={`Show story: ${story.title}`} onClick={onSelect} />}

      {isCenter && (
        <>
          <div className="absolute inset-x-0 top-0 flex items-center gap-2 px-3 pt-3 text-white">
            <p className="flex-1 whitespace-nowrap font-sans text-[10px] uppercase tracking-[0.22em] text-white/80">
              <span className="hidden sm:inline">Styling 101 · </span>
              {pad(index)} / {pad(total - 1)}
            </p>
            <button type="button" onClick={share} aria-label="Share story" className="rounded-full p-1.5 hover:bg-white/15">
              <Share2 className="size-4" strokeWidth={1.6} />
            </button>
            <button type="button" onClick={onExpand} aria-label={story.reel ? 'Play reel' : 'View story fullscreen'} className="rounded-full p-1.5 hover:bg-white/15">
              <Maximize2 className="size-4" strokeWidth={1.6} />
            </button>
          </div>

          {story.reel && (
            <button
              type="button"
              onClick={onExpand}
              data-reel-play
              aria-label={`Play reel: ${story.title}`}
              className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white ring-1 ring-white/40 backdrop-blur-sm transition-transform hover:scale-105"
            >
              <Play className="ml-1 size-7 fill-current" strokeWidth={1.4} />
            </button>
          )}

          {product && (
            <div className="absolute inset-x-2.5 bottom-3 flex items-center gap-2 rounded-[6px] bg-ink/75 p-1.5 pr-2 text-white">
              <Link to={productPath(product)} className="flex min-w-0 flex-1 items-center gap-2" draggable={false}>
                <img src={product.image} alt="" draggable={false} className="size-11 shrink-0 rounded-[4px] bg-white object-cover" />
                <span className="min-w-0">
                  <span className="line-clamp-2 font-sans text-[11px] font-medium leading-tight">{product.name}</span>
                  <span className="font-sans text-[10px] tracking-[0.08em] text-white/75">{productCode(product)}</span>
                </span>
              </Link>
              <LikeButton product={product} className="size-8! shrink-0" />
            </div>
          )}
        </>
      )}
    </article>
  );
}

export default function Editorial() {
  const scope = useReveal();
  const contentVersion = useContentVersion(); // reels added in the admin panel appear live
  const n = stories.length;
  const reduced = useReducedMotion();
  const phone = usePhone();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [inView, setInView] = useState(false);
  const drag = useRef(null);
  const suppressClick = useRef(false);

  const go = (step) => setIndex((i) => (i + step + n) % n);
  const playing = inView && !paused && !hovered && !expanded && !reduced;
  const layout = phone ? LAYOUTS.phone : LAYOUTS.wide;

  // Only auto-advance while the deck is on screen.
  useEffect(() => {
    const el = scope.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [scope]);

  // Arrow keys also work inside the fullscreen viewer.
  useEffect(() => {
    if (!expanded) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [expanded, n]);

  // One gesture for touch and mouse: a horizontal swipe or drag changes story.
  // Vertical movement is left to the page (touch-action: pan-y).
  const onPointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e) => {
    const start = drag.current;
    drag.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
      suppressClick.current = true;
      go(dx < 0 ? 1 : -1);
    }
  };
  // A drag must not also count as a click on the card underneath.
  const onClickCapture = (e) => {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  // The admin panel can shorten the list while it is open.
  useEffect(() => {
    if (index >= n) setIndex(0);
  }, [index, n, contentVersion]);

  const current = stories[Math.min(index, n - 1)];
  const currentProduct = getProduct(current.productId);

  return (
    <section ref={scope} className="section-y overflow-x-clip" aria-labelledby="styling-title">
      <SectionHeading id="styling-title" title="Styling 101 With Diamonds" subtitle="Trendsetting diamond jewellery suited for every occasion" />

      <div
        data-deck
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="Styling stories. Use the left and right arrow keys to browse."
        className="story-deck relative mx-auto mt-6 h-[min(118vw,540px)] max-w-[1400px] md:mt-8 md:h-[540px]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          drag.current = null;
        }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = null)}
        onClickCapture={onClickCapture}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            go(1);
          }
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            go(-1);
          }
        }}
      >
        {stories.map((story, i) => (
          <StoryCard
            key={story.id}
            story={story}
            index={i}
            total={n}
            offset={wrap(i - index, n)}
            layout={layout}
            playing={playing}
            onSelect={() => setIndex(i)}
            onExpand={() => setExpanded(true)}
          />
        ))}
      </div>

      {/* Title and controls under the deck: arrows, one progress step per story, pause. */}
      {/* On phones the row stays clear of the floating WhatsApp button in the bottom-right corner. */}
      <div className="mx-auto mt-6 w-[calc(100%-32px)] text-center md:w-[min(560px,calc(100%-64px))]">
        <p key={current.id} data-story-title data-story-index={index} aria-live="polite" className="story-title font-serif text-[clamp(19px,2vw,24px)] font-light leading-snug text-heading">
          {current.title}
        </p>

        <div className="mt-5 flex items-center gap-3 max-md:mx-12">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Play stories' : 'Pause stories'}
            className="story-arrow"
          >
            {paused ? <Play className="size-3.5" strokeWidth={1.6} /> : <Pause className="size-3.5" strokeWidth={1.6} />}
          </button>
          <button type="button" onClick={() => go(-1)} aria-label="Previous story" className="story-arrow">
            <ChevronLeft className="size-4" strokeWidth={1.5} />
          </button>

          <ol data-progress className="flex flex-1 gap-1.5" aria-label="Stories">
            {stories.map((s, i) => (
              <li key={s.id} className="flex-1">
                <button type="button" onClick={() => setIndex(i)} aria-label={`Story ${i + 1}: ${s.title}`} aria-current={i === index} className="block w-full py-2.5">
                  <span className="block h-[2px] overflow-hidden rounded-full bg-border-strong">
                    {i < index && <span className="block h-full bg-primary" />}
                    {i === index && (
                      <span
                        key={`${s.id}-${index}`}
                        className="story-progress block h-full bg-primary"
                        style={{ animationDuration: `${STORY_MS}ms`, animationPlayState: playing ? 'running' : 'paused' }}
                        onAnimationEnd={() => go(1)}
                      />
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <button type="button" onClick={() => go(1)} aria-label="Next story" className="story-arrow">
            <ChevronRight className="size-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <Drawer open={expanded} onClose={() => setExpanded(false)} side="full" labelledBy="story-viewer-title">
        <div className="flex h-full flex-col items-center justify-center bg-ink px-4 py-6">
          <div className="mb-3 flex w-full max-w-[420px] items-center justify-between gap-3 text-white">
            <h2 id="story-viewer-title" className="font-serif text-lg leading-snug">
              {current.title}
            </h2>
            <button type="button" onClick={() => setExpanded(false)} aria-label="Close story" className="shrink-0 rounded-full p-2 hover:bg-white/10">
              <X className="size-5" />
            </button>
          </div>
          {current.reel ? (
            <>
              <div className="relative h-[min(72vh,760px)] w-[min(92vw,420px)] overflow-hidden rounded-card bg-white">
                {expanded && (
                  <iframe
                    key={current.reel}
                    data-reel-embed
                    src={reelEmbed(current.reel)}
                    title={`Instagram reel: ${current.title}`}
                    allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"
                    allowFullScreen
                    loading="lazy"
                    className="absolute inset-0 h-full w-full border-0"
                  />
                )}
              </div>
              <a
                href={current.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 font-sans text-[11px] uppercase tracking-[0.14em] text-white/70 hover:text-white"
              >
                <InstagramIcon className="size-3.5" aria-hidden="true" /> Open on Instagram <ExternalLink className="size-3" aria-hidden="true" />
              </a>
            </>
          ) : (
            <div className="relative aspect-[9/16] h-[min(68vh,700px)] max-w-full overflow-hidden rounded-card">
              <img src={current.image} alt={current.title} className="h-full w-full object-cover" />
            </div>
          )}
          {currentProduct && (
            <div className="mt-4 flex w-full max-w-[420px] items-center gap-3 rounded-[6px] bg-white/8 p-2 text-white">
              <img src={currentProduct.image} alt="" className="size-12 shrink-0 rounded-[4px] bg-white object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-sans text-[13px] font-medium">{currentProduct.name}</p>
                <Link
                  to={productPath(currentProduct)}
                  onClick={() => setExpanded(false)}
                  className="mt-0.5 inline-flex items-center gap-1 font-sans text-[11px] uppercase tracking-[0.14em] text-white/70 hover:text-white"
                >
                  {productCode(currentProduct)} · View piece <ArrowRight className="size-3" aria-hidden="true" />
                </Link>
              </div>
              <LikeButton product={currentProduct} className="size-9! shrink-0" />
            </div>
          )}
          <div className="mt-4 flex items-center gap-4 text-white">
            <button type="button" onClick={() => go(-1)} aria-label="Previous story" className="rounded-full border border-white/30 p-2 hover:bg-white/10">
              <ChevronLeft className="size-5" />
            </button>
            <span className="font-sans text-xs tabular-nums tracking-[0.14em] text-white/70">
              {pad(index)} / {pad(n - 1)}
            </span>
            <button type="button" onClick={() => go(1)} aria-label="Next story" className="rounded-full border border-white/30 p-2 hover:bg-white/10">
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </Drawer>
    </section>
  );
}
