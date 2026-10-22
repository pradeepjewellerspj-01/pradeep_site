import { useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import SectionHeading from '../common/SectionHeading';
import LuxuryButton from '../common/LuxuryButton';
import GoldIcon from '../common/GoldIcon';
import { exchange } from '../../data/editorial';
import { useStore } from '../../context/StoreContext';
import { useReveal } from '../../hooks/useReveal';

// Captions shown while the placeholder "film" plays. Swap the banner for a
// <video> element once footage is available.
const captions = [
  'Bring in your old gold from any jeweller',
  'Purity checked in front of you with our karatmeter',
  '0% deduction on 18KT and above',
  'Walk out with something new to cherish',
];
const CAPTION_MS = 3500;

function Ornament({ flip = false }) {
  return (
    <span aria-hidden="true" className={`hidden flex-1 items-center gap-3 md:flex ${flip ? 'flex-row-reverse' : ''}`}>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-champagne" style={flip ? { transform: 'scaleX(-1)' } : undefined} />
      <svg viewBox="0 0 24 24" className="size-5 text-champagne" fill="none" stroke="currentColor" strokeWidth="1.1">
        <path d="M12 3c1.8 2.5 1.8 5 0 7.5C10.2 8 10.2 5.5 12 3ZM12 21c-1.8-2.5-1.8-5 0-7.5 1.8 2.5 1.8 5 0 7.5ZM3 12c2.5-1.8 5-1.8 7.5 0C8 13.8 5.5 13.8 3 12ZM21 12c-2.5 1.8-5 1.8-7.5 0 2.5-1.8 5-1.8 7.5 0Z" />
      </svg>
    </span>
  );
}

const FILM_MS = CAPTION_MS * captions.length;
const TICK_MS = 100;

/**
 * One clock drives the film: zoom, caption and progress bar all follow the
 * elapsed time, so pausing holds every part exactly where it is and playing
 * resumes from there. At the end the frame eases back instead of snapping.
 */
function useFilm() {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!playing) return undefined;
    let last = performance.now();
    const t = window.setInterval(() => {
      const now = performance.now();
      const step = now - last;
      last = now;
      setElapsed((e) => Math.min(FILM_MS, e + step));
    }, TICK_MS);
    return () => window.clearInterval(t);
  }, [playing]);

  // Finished: stop, then rewind once the frame has eased back.
  useEffect(() => {
    if (elapsed < FILM_MS) return undefined;
    setPlaying(false);
    const t = window.setTimeout(() => setElapsed(0), 1400);
    return () => window.clearTimeout(t);
  }, [elapsed]);

  const toggle = () => {
    if (!playing && elapsed >= FILM_MS) setElapsed(0);
    setPlaying((p) => !p);
  };
  return { playing, elapsed, toggle };
}

export default function Exchange() {
  const scope = useReveal();
  const { openModal } = useStore();
  const { playing, elapsed, toggle } = useFilm();
  const progress = elapsed / FILM_MS;
  const caption = Math.min(captions.length - 1, Math.floor(elapsed / CAPTION_MS));
  const active = playing || (elapsed > 0 && elapsed < FILM_MS); // playing or paused mid-film

  return (
    <section ref={scope} className="section-y" aria-labelledby="exchange-title">
      <SectionHeading id="exchange-title" title={exchange.title} subtitle={exchange.subtitle} />

      <div className="relative mt-7 aspect-[4/3] overflow-hidden bg-ink sm:aspect-[16/8] md:mt-10 lg:aspect-[890/290]" data-reveal-media>
        {/* The film zooms this wrapper; the scroll reveal animates the img inside, so the two never fight. */}
        <div
          className="film-frame absolute inset-0"
          style={{
            transform: `scale(${1 + 0.1 * (active ? progress : 0)}) translate(${-1.2 * (active ? progress : 0)}%, ${-1 * (active ? progress : 0)}%)`,
            transitionDuration: active ? `${TICK_MS + 40}ms` : '1.3s',
          }}
        >
          <img src={exchange.image} alt="Diamond necklaces on display inside a Pradeep Jewellers boutique" loading="lazy" decoding="async" className="h-full w-full object-cover" />
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,rgba(30,16,10,0.85),rgba(30,16,10,0.42)_50%,rgba(30,16,10,0.3))]" />

        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? 'Pause exchange program film' : 'Play exchange program film'}
          className={`absolute left-1/2 top-[42%] inline-flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/30 text-white transition-all duration-500 hover:scale-105 hover:bg-white/45 md:size-[68px] ${
            playing ? 'opacity-0 hover:opacity-100 focus-visible:opacity-100' : 'opacity-100'
          }`}
        >
          {playing ? <Pause className="size-6" fill="currentColor" /> : <Play className="ml-1 size-6 md:size-7" fill="currentColor" />}
        </button>

        {/* Captions crossfade: every line is mounted, only the current one is visible. */}
        <div aria-live="polite" className="pointer-events-none absolute inset-x-6 top-[62%] md:top-[60%]">
          {captions.map((c, i) => (
            <p key={c} aria-hidden={!(active && i === caption)} className={`film-caption font-display text-xl italic text-white md:text-3xl ${active && i === caption ? 'is-on' : ''}`}>
              {c}
            </p>
          ))}
        </div>

        <h3 className={`absolute bottom-5 left-5 max-w-[60%] font-serif text-[26px] font-light leading-[1.05] text-white/90 transition-opacity duration-700 sm:bottom-7 sm:left-8 md:text-[clamp(32px,3.6vw,52px)] ${active ? 'opacity-0' : 'opacity-100'}`}>
          {exchange.bannerTitle[0]}
          <br />
          {exchange.bannerTitle[1]}
        </h3>

        <div className="absolute bottom-5 right-5 sm:bottom-7 md:left-1/2 md:right-auto md:-translate-x-1/2">
          <LuxuryButton variant="light" onClick={() => openModal('oldgold')} className="py-2! text-[14px]">
            Explore Now
          </LuxuryButton>
        </div>

        <div className={`absolute inset-x-0 bottom-0 h-[3px] bg-white/20 transition-opacity duration-700 ${active ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true">
          <div className="film-progress h-full origin-left bg-gold-light" style={{ transform: `scaleX(${progress})`, transitionDuration: active ? `${TICK_MS + 40}ms` : '0.6s' }} />
        </div>
      </div>

      <div className="container-x mt-5 flex items-center gap-4" data-reveal>
        <Ornament />
        <p className="max-w-[560px] text-center font-display text-[17px] italic leading-snug text-muted md:text-[19px]">{exchange.quote}</p>
        <Ornament flip />
      </div>

      <ul className="container-x mt-8 grid grid-cols-2 gap-y-8 md:mt-10 md:grid-cols-4" data-reveal-stagger>
        {exchange.benefits.map((b) => (
          <li key={b.icon} className="flex flex-col items-center text-center">
            <GoldIcon name={b.icon} className="size-14 md:size-[68px]" />
            <p className="mt-3 font-serif text-[14px] leading-tight text-heading md:text-[15px]">
              {b.label[0]}
              <br />
              {b.label[1]}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
