import { useEffect, useRef, useState } from 'react';

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * A formatted number whose digits roll to their new value like a mechanical
 * counter, tinting briefly in the direction of the move.
 */
export default function RollingNumber({ value, format, className = '' }) {
  const text = format(value);
  const chars = [...text];
  const prev = useRef(value);
  const [dir, setDir] = useState(null);
  // Digits count up into place once on first paint, then roll only on change.
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setSettled(true)));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (value === prev.current) return undefined;
    setDir(value > prev.current ? 'up' : 'down');
    prev.current = value;
    const t = window.setTimeout(() => setDir(null), 1400);
    return () => window.clearTimeout(t);
  }, [value]);

  return (
    <span className={`roll tabular-nums ${className}`} data-dir={dir ?? undefined} role="text" aria-label={text}>
      {chars.map((c, i) => {
        const key = chars.length - i; // keyed from the right so places stay put
        if (!/\d/.test(c))
          return (
            <span key={`s${key}`} aria-hidden="true">
              {c}
            </span>
          );
        return (
          <span key={`d${key}`} className="roll-digit" aria-hidden="true">
            <span className="roll-strip" style={{ transform: `translateY(${settled ? -Number(c) * 10 : 0}%)` }}>
              {DIGITS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}
