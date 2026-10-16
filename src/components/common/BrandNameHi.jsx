import { useEffect, useState } from 'react';
import { business } from '../../data/footer';

/**
 * "प्रदीप" as on the letterhead: Kruti Dev 680, with "प्र" in the warm
 * bronze and "दीप" in the brand colour (gold and ivory on dark backgrounds).
 *
 * Kruti Dev is a legacy (non-Unicode) font: it draws Devanagari from Latin
 * key codes, so the name is typed as KRUTI parts. It is shown that way only
 * once the font has actually loaded; until then, and when it is missing, the
 * Unicode name in the site's Devanagari font (same two colours), so nobody
 * ever sees the raw letters.
 *
 * Where the font comes from, first match wins:
 *   1. src/assets/fonts/KrutiDev680.woff2 | .woff | .ttf | .otf (bundled with the site)
 *   2. installed on the device as "Kruti Dev 680"
 * Without either, nothing is requested and the Unicode name stays.
 */
const FAMILY = 'Kruti Dev 680';
// प्रदीप on the Kruti Dev keyboard: प=i ्र=z | द=n ी=h प=i
const KRUTI = ['iz', 'nhi'];
const UNICODE = ['प्र', 'दीप'];
const FIRST_COLOUR = { brand: '#a2703f', light: '#d9b47a' };

const bundled = Object.values(import.meta.glob('../../assets/fonts/KrutiDev680.{woff2,woff,ttf,otf}', { eager: true, query: '?url', import: 'default' }));

let ready = null;
function loadKruti() {
  if (ready) return ready;
  if (typeof FontFace === 'undefined' || !document.fonts) return (ready = Promise.resolve(false));
  const tryFace = (source) =>
    new FontFace(FAMILY, source)
      .load()
      .then((face) => {
        document.fonts.add(face);
        return true;
      })
      .catch(() => false);
  ready = (bundled.length ? tryFace(`url(${bundled[0]})`) : Promise.resolve(false)).then((ok) => ok || tryFace("local('Kruti Dev 680'), local('KrutiDev680')"));
  return ready;
}

/** tone 'brand' for light backgrounds, 'light' for dark ones. */
export default function BrandNameHi({ className = '', tone = 'brand' }) {
  const [kruti, setKruti] = useState(false);
  useEffect(() => {
    let alive = true;
    loadKruti().then((ok) => alive && setKruti(ok));
    return () => {
      alive = false;
    };
  }, []);
  const [first, rest] = kruti ? KRUTI : UNICODE;
  return (
    <span
      lang={kruti ? undefined : 'hi'}
      className={`${className} ${kruti ? 'brand-kruti' : ''}`}
      style={kruti ? { fontFamily: `'${FAMILY}'`, fontWeight: 'normal' } : undefined}
      aria-label={kruti ? business.nameHi : undefined}
    >
      <span style={{ color: FIRST_COLOUR[tone] ?? FIRST_COLOUR.brand }}>{first}</span>
      {rest}
    </span>
  );
}
