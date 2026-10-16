import LuxuryButton from '../common/LuxuryButton';
import Logo from '../common/Logo';
import { promotions } from '../../data/editorial';
import { useStore } from '../../context/StoreContext';
import { useReveal } from '../../hooks/useReveal';

// Satin ribbon with a bow, drawn rather than photographed so it scales cleanly.
function Ribbon() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 374 320">
      <defs>
        <linearGradient id="ribbon-v" x1="0" x2="1">
          <stop offset="0" stopColor="#6f141a" />
          <stop offset=".45" stopColor="#9b2730" />
          <stop offset="1" stopColor="#74161c" />
        </linearGradient>
        <linearGradient id="ribbon-h" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9b2730" />
          <stop offset="1" stopColor="#6c1318" />
        </linearGradient>
      </defs>
      <rect x="40" y="0" width="22" height="320" fill="url(#ribbon-v)" />
      <rect x="0" y="250" width="374" height="20" fill="url(#ribbon-h)" />
    </svg>
  );
}

function Bow() {
  return (
    <svg aria-hidden="true" viewBox="0 0 80 80" className="pointer-events-none absolute left-[15%] top-[78%] size-[19%] min-w-14 -translate-x-1/2 -translate-y-1/2">
      <defs>
        <radialGradient id="bow" cx=".45" cy=".4" r=".7">
          <stop offset="0" stopColor="#b5343c" />
          <stop offset="1" stopColor="#6f141a" />
        </radialGradient>
      </defs>
      {[0, 60, 120, 180, 240, 300].map((r) => (
        <ellipse key={r} cx="40" cy="22" rx="12" ry="18" fill="url(#bow)" stroke="#5b0f14" strokeWidth=".6" transform={`rotate(${r} 40 40)`} />
      ))}
      <circle cx="40" cy="40" r="10" fill="#8a1d24" stroke="#5b0f14" strokeWidth=".8" />
    </svg>
  );
}

function PlinthFrame() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 360 330">
      <path
        d="M12 0H348Q360 0 360 12V290Q360 302 348 302H342Q330 302 330 314V318Q330 330 318 330H42Q30 330 30 318V314Q30 302 18 302H12Q0 302 0 290V12Q0 0 12 0Z"
        fill="var(--color-cream)"
        stroke="var(--color-champagne)"
        strokeWidth="1.2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function Promotions() {
  const scope = useReveal();
  const { openModal } = useStore();
  const { gift, oldGold } = promotions;

  return (
    <section ref={scope} className="section-y container-x" aria-label="Offers">
      <div className="grid gap-4 md:grid-cols-[374fr_356fr] md:gap-[9px]" data-reveal-stagger>
        {/* #GiftOfChoice */}
        <article className="relative min-h-[300px] overflow-hidden rounded-card bg-blush md:min-h-0 md:aspect-[374/320]">
          <Ribbon />
          <Bow />
          <div className="relative py-10 pl-[24%] pr-6 md:py-[12%]">
            <h2 className="font-serif text-[34px] font-normal leading-none text-primary md:text-[clamp(34px,3.5vw,50px)]" style={{ fontVariationSettings: "'opsz' 60" }}>
              {gift.title}
            </h2>
            <p className="mt-3 font-sans text-[13px] text-muted md:text-[14px]">{gift.copy}</p>
            <p className="mt-0.5 font-sans text-[12px] font-semibold uppercase tracking-[0.03em] text-primary md:text-[13px]">{gift.price}</p>
            <LuxuryButton to={gift.href} className="mt-6 md:mt-7">
              {gift.cta}
            </LuxuryButton>
          </div>
        </article>

        {/* Old gold exchange */}
        <article className="relative min-h-[320px] md:min-h-0 md:aspect-[356/330]">
          <PlinthFrame />
          <div className="relative px-8 pb-14 pt-10 md:px-[10%] md:pt-[9%]">
            <span className="inline-flex rounded-t-full border border-champagne bg-white/60 px-3 pb-2 pt-3">
              <Logo size="sm" />
            </span>
            <h2 className="mt-5 max-w-[340px] font-serif text-[17px] leading-snug text-ink md:text-[clamp(16px,1.45vw,20px)]">{oldGold.title}</h2>
            <p className="mt-3 max-w-[300px] font-sans text-[12px] leading-relaxed text-text">{oldGold.copy}</p>
            <LuxuryButton variant="gold" onClick={() => openModal('oldgold')} className="mt-6 md:mt-8">
              {oldGold.cta}
            </LuxuryButton>
          </div>
        </article>
      </div>
    </section>
  );
}
