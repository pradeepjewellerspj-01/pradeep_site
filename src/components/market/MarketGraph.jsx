import { useEffect, useId, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../utils/gsap';

const W = 600;

const pathFor = (values, h, pad) => {
  if (values.length < 2) return { line: '', area: '', end: [0, h / 2], baseline: null };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const y = (v) => pad + (1 - (v - min) / span) * (h - pad * 2);
  const step = W / (values.length - 1);
  // Monotone-ish smoothing: quadratic midpoints keep the line calm.
  let line = `M0 ${y(values[0]).toFixed(2)}`;
  for (let i = 1; i < values.length; i += 1) {
    const x0 = (i - 1) * step;
    const x1 = i * step;
    const mx = (x0 + x1) / 2;
    line += ` Q${x0.toFixed(1)} ${y(values[i - 1]).toFixed(2)} ${mx.toFixed(1)} ${((y(values[i - 1]) + y(values[i])) / 2).toFixed(2)}`;
  }
  const last = values[values.length - 1];
  line += ` T${W} ${y(last).toFixed(2)}`;
  return { line, area: `${line} L${W} ${h} L0 ${h} Z`, end: [W, y(last)], y };
};

/**
 * Quiet session sparkline. New points ease in rather than snapping.
 * tone: 'dark' (on the showroom stage) | 'light'
 */
export default function MarketGraph({ values = [], reference, height = 120, tone = 'dark', className = '', label, draw = false }) {
  const gradId = useId();
  const [shown, setShown] = useState(values);
  const from = useRef(values);
  const raf = useRef();

  useEffect(() => {
    const target = values;
    const start = from.current;
    if (prefersReducedMotion() || start.length !== target.length) {
      from.current = target;
      setShown(target);
      return undefined;
    }
    const t0 = performance.now();
    const dur = 900;
    const frame = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - (1 - k) ** 3;
      const next = target.map((v, i) => start[i] + (v - start[i]) * e);
      from.current = next;
      setShown(next);
      if (k < 1) raf.current = requestAnimationFrame(frame);
    };
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf.current);
  }, [values]);

  const pad = 10;
  const { line, area, end, y } = pathFor(shown, height, pad);
  const refY = reference != null && y && shown.length > 1 ? y(Math.min(Math.max(reference, Math.min(...shown)), Math.max(...shown))) : null;
  const stroke = tone === 'dark' ? 'var(--color-champagne-soft)' : 'var(--color-gold-deep)';

  return (
    <div className={`relative ${draw ? 'graph-draw' : ''} ${className}`} style={{ height }}>
    <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" className="block h-full w-full overflow-visible" role="img" aria-label={label}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={stroke} stopOpacity={tone === 'dark' ? 0.1 : 0.12} />
          <stop offset="1" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {refY != null && (
        <line x1="0" x2={W} y1={refY} y2={refY} stroke={stroke} strokeOpacity="0.28" strokeDasharray="2 5" vectorEffect="non-scaling-stroke" />
      )}
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="1.25" strokeLinecap="round" vectorEffect="non-scaling-stroke" className={tone === 'dark' ? 'graph-line-glow' : undefined} />
    </svg>
    <span aria-hidden="true" className="graph-end" style={{ top: `${(end[1] / height) * 100}%`, color: stroke }} />
    </div>
  );
}
