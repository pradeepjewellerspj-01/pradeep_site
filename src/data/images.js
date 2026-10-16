// Central image registry. Every photograph on the site is imported here so
// swapping in Pradeep Jewellers' own photography is a one-file change.
// Placeholder photography: Unsplash (Unsplash License).

import heroSlide1 from '../assets/images/hero/slide-1.webp';
import heroSlide2 from '../assets/images/hero/slide-2.webp';
import heroSlide3 from '../assets/images/hero/slide-3.webp';
import heroSlide4 from '../assets/images/hero/slide-4.webp';
import heroSlide5 from '../assets/images/hero/slide-5.webp';

import collectionPendant from '../assets/images/collections/pendant.webp';
import collectionEarrings from '../assets/images/collections/earrings.webp';
import collectionCoins from '../assets/images/collections/coins.webp';

import catEarrings from '../assets/images/categories/earrings.webp';
import catRings from '../assets/images/categories/rings.webp';
import catBracelets from '../assets/images/categories/bracelets.webp';
import catBangles from '../assets/images/categories/bangles.webp';

import worldWedding from '../assets/images/editorial/world-wedding.webp';
import worldDiamond from '../assets/images/editorial/world-diamond.webp';
import worldGold from '../assets/images/editorial/world-gold.webp';
import worldDaily from '../assets/images/editorial/world-daily.webp';
import arrivalsBand from '../assets/images/editorial/arrivals-band.webp';
import arrivalsSilver from '../assets/images/editorial/arrivals-silver.webp';
import arrivalsChain from '../assets/images/editorial/arrivals-chain.webp';
import exchangeBanner from '../assets/images/editorial/exchange.webp';

import story1 from '../assets/images/styling/story-1.webp';
import story2 from '../assets/images/styling/story-2.webp';
import story3 from '../assets/images/styling/story-3.webp';
import story4 from '../assets/images/styling/story-4.webp';
import story5 from '../assets/images/styling/story-5.webp';
import story6 from '../assets/images/styling/story-6.webp';


const productModules = import.meta.glob('../assets/images/products/*.webp', {
  eager: true,
  import: 'default',
});

export const productImages = Object.keys(productModules)
  .sort()
  .map((key) => productModules[key]);

export const images = {
  hero: [heroSlide1, heroSlide2, heroSlide3, heroSlide4, heroSlide5],
  collections: {
    pendant: collectionPendant,
    earrings: collectionEarrings,
    coins: collectionCoins,
  },
  categories: {
    earrings: catEarrings,
    rings: catRings,
    bracelets: catBracelets,
    bangles: catBangles,
  },
  world: {
    wedding: worldWedding,
    diamond: worldDiamond,
    gold: worldGold,
    daily: worldDaily,
  },
  arrivals: {
    band: arrivalsBand,
    silver: arrivalsSilver,
    chain: arrivalsChain,
  },
  exchange: exchangeBanner,
  stories: [story1, story2, story3, story4, story5, story6],
};

// Every bundled photo by a stable name ("products.product-03", "collections.pendant"),
// so content saved in the admin panel can refer to them as "builtin:<name>".
const flatten = (value, prefix) =>
  typeof value === 'string' ? { [prefix]: value } : Object.entries(value).reduce((all, [k, v]) => ({ ...all, ...flatten(v, `${prefix}.${k}`) }), {});

export const builtinImages = {
  ...Object.fromEntries(Object.keys(productModules).map((key) => [`products.${key.split('/').pop().replace('.webp', '')}`, productModules[key]])),
  ...Object.fromEntries(Object.entries(images).flatMap(([k, v]) => Object.entries(flatten(v, k)))),
};

/** "builtin:…" → bundled URL; uploaded (/api/images/…) and https URLs pass through. */
export const resolveImage = (ref) => (ref?.startsWith('builtin:') ? (builtinImages[ref.slice(8)] ?? null) : ref);

/** The reverse: a bundled URL → "builtin:…" (for the first import into the admin database). */
export const imageRef = (url) => {
  const key = Object.keys(builtinImages).find((k) => builtinImages[k] === url);
  return key ? `builtin:${key}` : url;
};
