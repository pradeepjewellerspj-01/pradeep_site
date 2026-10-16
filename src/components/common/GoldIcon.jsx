import { useId } from 'react';

// Brushed-gold glyphs for the assurance and exchange rows. Original artwork;
// the reference uses metallic gold icons, so these share a gradient fill.
const glyphs = {
  craft: (
    <>
      <rect x="6" y="14" width="28" height="18" rx="2.5" />
      <rect x="30" y="18" width="12" height="10" rx="1.5" />
      <circle cx="20" cy="23" r="3.5" fill="#fff" opacity=".85" />
      <rect x="14" y="31" width="5" height="11" rx="1" />
    </>
  ),
  heart: (
    <>
      <path d="M24 42 8.6 27.4A9.6 9.6 0 0 1 22 13.6L24 15.5l2-1.9a9.6 9.6 0 0 1 13.4 13.8Z" />
      <path d="M22 20v9h7" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity=".9" />
    </>
  ),
  diamond: (
    <>
      <path d="M12 10h24l8 10-20 22L4 20Z" />
      <path d="M4 20h40M17 10l-3 10 10 22 10-22-3-10M24 10l-10 10M24 10l10 10" fill="none" stroke="#fff" strokeWidth="1.1" opacity=".7" />
    </>
  ),
  shield: (
    <>
      <path d="M8 9h32v15c0 9.5-7 15.5-16 19-9-3.5-16-9.5-16-19Z" />
      <path d="M17 18h14M24 18v14M19 30h10" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".85" />
    </>
  ),
  purity: (
    <>
      <path d="M24 4 44 30H4Z" />
      <path d="M24 13 35 27H13Z" fill="#fff" opacity=".85" />
      <rect x="4" y="33" width="40" height="9" rx="1.5" />
      <text x="24" y="40" textAnchor="middle" fontSize="6.5" fontFamily="Georgia, serif" fill="#fff">
        916 · 22KT
      </text>
    </>
  ),
  exchange: (
    <>
      <circle cx="24" cy="24" r="15" />
      <path d="M17 26c1.5 4 6 5.5 9.5 3.5M31 22c-1.5-4-6-5.5-9.5-3.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path d="M26 27.5l1.2 2.6 2.6-1.2M22 20.5l-1.2-2.6-2.6 1.2" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 13a19 19 0 0 1 32 0M40 35a19 19 0 0 1-32 0" fill="none" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
};

export default function GoldIcon({ name, className = 'size-12' }) {
  const id = useId();
  const gradient = `gold-${id}`;
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0cf9c" />
          <stop offset=".5" stopColor="#c99359" />
          <stop offset="1" stopColor="#9a6a3a" />
        </linearGradient>
      </defs>
      <g fill={`url(#${gradient})`} stroke={`url(#${gradient})`} strokeWidth="0">
        {glyphs[name]}
      </g>
    </svg>
  );
}
