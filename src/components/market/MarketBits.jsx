import { useEffect, useId, useRef, useState } from 'react';
import { Info } from 'lucide-react';
import { formatAsOf, formatChangePct, formatTime, marketLabel, useMarketPrices } from '../../market/useMarketPrices';

/** ▲ +0.34% / ▼ −0.08% — direction is shown by shape as well as colour. */
export function PriceChange({ pct, className = '' }) {
  if (pct == null || !Number.isFinite(pct)) return null; // no earlier rate to compare with
  const up = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-1 font-sans tabular-nums ${up ? 'text-up' : 'text-down'} ${className}`}>
      <svg viewBox="0 0 8 8" className={`size-[7px] ${up ? '' : 'rotate-180'}`} aria-hidden="true">
        <path d="M4 1 7.5 7h-7Z" fill="currentColor" />
      </svg>
      <span className="sr-only">{up ? 'up' : 'down'}</span>
      {formatChangePct(pct)}
    </span>
  );
}

/** The data-source label. Reference and demo data are never presented as live. */
export function MarketStatus({ market, className = '', long = true }) {
  const label = marketLabel(market);
  return (
    <span className={`inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.2em] ${className}`}>
      <span className={`market-dot market-dot--${label.tone}`} aria-hidden="true" />
      {long ? label.long : label.short}
    </span>
  );
}

/**
 * "Rate source": a small disclosure explaining where the numbers come from.
 * tone: 'dark' (on the stage) | 'light'; placement: 'top' | 'bottom'.
 */
export function RateSource({ tone = 'dark', placement = 'top', align = 'left', className = '' }) {
  const market = useMarketPrices();
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  const id = useId();

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !wrap.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  const { source, mode, asOf, updatedAt } = market;
  const dark = tone === 'dark';
  const rows =
    mode === 'demo'
      ? [['Data', 'Simulated for demonstration. Not a market rate.']]
      : [
          source?.kind && ['Rate', source.kind],
          ['Unit', 'Gold per 10 grams, silver per kg'],
          source?.note && ['Excludes', source.note.replace(/^Rates exclude /, '').replace(/\.$/, '')],
          asOf && ['Published', formatAsOf(asOf, true)],
          mode === 'live' && updatedAt && ['Received', formatTime(updatedAt)],
        ].filter(Boolean);

  return (
    <span
      ref={wrap}
      className={`relative inline-flex ${className}`}
      // Hover only for a real mouse: touch taps also emit enter events, which would fight the toggle.
      onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        // A mouse click keeps the hover-opened panel open; touch and keyboard toggle it.
        onClick={(e) => setOpen((o) => (e.nativeEvent.pointerType === 'mouse' ? true : !o))}
        className={`-my-2.5 inline-flex items-center gap-1.5 py-2.5 font-sans text-[10px] uppercase tracking-[0.2em] underline decoration-dotted underline-offset-4 transition-colors ${
          dark ? 'text-ivory/50 decoration-ivory/25 hover:text-ivory/80' : 'text-muted decoration-border-strong hover:text-ink'
        }`}
      >
        <Info className="size-3" strokeWidth={1.5} aria-hidden="true" />
        Rate source
      </button>
      <span
        id={id}
        role="note"
        className={`rate-source ${open ? 'is-open' : ''} ${placement === 'top' ? 'bottom-full mb-3' : 'top-full mt-3'} ${align === 'right' ? 'right-0' : 'left-0'} ${
          dark ? 'rate-source--dark' : 'rate-source--light'
        }`}
      >
        <span className="block font-serif text-[15px] leading-snug">{mode === 'demo' ? 'Demo data' : (source?.name ?? 'Market feed')}</span>
        <span className="mt-3 block space-y-1.5">
          {rows.map(([k, v]) => (
            <span key={k} className="flex gap-3 font-sans text-[12px] leading-snug">
              <span className="w-[72px] shrink-0 text-[10px] uppercase tracking-[0.16em] opacity-55">{k}</span>
              <span>{v}</span>
            </span>
          ))}
        </span>
        {source?.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block font-sans text-[11px] underline underline-offset-4 opacity-70 hover:opacity-100"
          >
            {new URL(source.url).hostname}
          </a>
        )}
      </span>
    </span>
  );
}
