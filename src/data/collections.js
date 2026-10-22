import { images } from './images';

// Hero carousel. Copy sits in the right third of the banner, as in the reference.
export const heroSlides = [
  {
    id: 'joy',
    image: images.hero[0],
    alt: 'Temple-style gold necklace with rubies on dark fabric',
    eyebrow: 'Presents',
    title: 'The joy of',
    script: 'adorning',
    subtitle: 'Explore our latest designs',
    cta: 'Explore Now',
    href: '/category/all-jewellery',
    tone: 'dark',
    position: '30% 50%',
  },
  {
    id: 'pearl',
    image: images.hero[1],
    alt: 'Sculpted gold rings and a pearl resting on stone',
    eyebrow: 'Introducing',
    title: 'Sculpted in',
    script: 'gold',
    subtitle: 'The new everyday gold edit',
    cta: 'Discover',
    href: '/category/gold',
    tone: 'light',
    position: '20% 50%',
  },
  {
    id: 'brilliance',
    image: images.hero[2],
    alt: 'Loose brilliant-cut diamonds on a black mirror',
    eyebrow: 'Certified',
    title: 'Pure',
    script: 'brilliance',
    subtitle: 'Solitaires certified for clarity and cut',
    cta: 'Explore Diamonds',
    href: '/category/diamond',
    tone: 'dark',
    position: '20% 60%',
    mobilePosition: '0% 60%',
  },
  {
    id: 'hoops',
    image: images.hero[3],
    alt: 'Gold hoop earrings on a blush pleated fan',
    eyebrow: 'New season',
    title: 'Stunning',
    script: 'every ear',
    subtitle: 'Hoops, studs & drops for every day',
    cta: 'Explore Earrings',
    href: '/category/earrings',
    tone: 'light',
    position: '30% 50%',
  },
  {
    id: 'bands',
    image: images.hero[4],
    alt: 'Three gold rings studded with diamonds on white',
    eyebrow: 'Wedding',
    title: 'Forever,',
    script: 'together',
    subtitle: 'Engagement rings & couple bands',
    cta: 'Explore Now',
    href: '/category/wedding',
    tone: 'light',
    position: '20% 50%',
  },
];

// "Pradeep Collections": one tall feature + two stacked tiles.
export const featuredCollections = {
  feature: {
    title: 'Pendants',
    href: '/category/pendants',
    image: images.collections.pendant,
    alt: 'Emerald-cut pendant glowing in warm light',
  },
  stacked: [
    {
      title: 'Stunning',
      script: 'every Ear',
      href: '/category/earrings',
      image: images.collections.earrings,
      alt: 'Twisted gold hoop earrings on pale stones',
      variant: 'light',
    },
    {
      title: 'Gold Coins',
      href: '/category/gold-coins',
      image: images.collections.coins,
      alt: 'Gold coins on a black surface',
      variant: 'dark',
    },
  ],
};

// "Pradeep Jewellers World": staggered two-column composition.
// `tall` cards are the longer tile in their column; columns alternate so the
// composition stays offset like the reference.
export const world = [
  { title: 'Wedding', href: '/category/wedding', image: images.world.wedding, alt: 'Bride in red with layered gold bridal jewellery', column: 0, tall: false, position: '50% 22%' },
  { title: 'Gold', href: '/category/gold', image: images.world.gold, alt: 'Woman in a silk sari wearing a gold choker', column: 0, tall: true, position: '50% 30%' },
  { title: 'Diamond', href: '/category/diamond', image: images.world.diamond, alt: 'Woman wearing diamond drop earrings', column: 1, tall: true, position: '50% 30%' },
  { title: 'Dailywear', href: '/category/daily-wear', image: images.world.daily, alt: 'Woman in a white shirt with a fine gold necklace', column: 1, tall: false, position: '50% 45%' },
];

export const newArrivals = {
  count: null, // e.g. a confirmed number of new pieces; hidden when null
  title: 'New Arrivals',
  copy: ['Fresh pieces, now in the showroom.', 'Explore the latest launches.'],
  band: images.arrivals.band,
  cards: [
    { title: 'Silver Idols', href: '/category/silver-idols', image: images.arrivals.silver, alt: 'Silver Ganesha idol with offerings' },
    { title: 'Snake Chains', href: '/category/chains', image: images.arrivals.chain, alt: 'Gold snake chain draped on white' },
  ],
};


// "Shop by Category" circles and "Explore Our World" cards on the home page.
export const discoveryCategories = [
  { label: 'Rings', href: '/category/rings', image: images.categories.rings },
  { label: 'Earrings', href: '/category/earrings', image: images.categories.earrings },
  { label: 'Bangles', href: '/category/bangles', image: images.categories.bangles },
  { label: 'Bracelets', href: '/category/bracelets', image: images.categories.bracelets },
];

export const discoveryCollections = [
  { label: 'Gold', subtitle: 'Timeless classics', href: '/category/gold', image: images.world.gold },
  { label: 'Diamond', subtitle: 'A little extra brilliance', href: '/category/diamond', image: images.world.diamond },
  { label: 'Bridal', subtitle: 'For your forever day', href: '/category/wedding', image: images.world.wedding },
  { label: 'Silver', subtitle: 'Thoughtful gifts & keepsakes', href: '/category/silver', image: images.arrivals.silver },
];

// ---------- Admin panel (Home page tab) ----------
// The banners, circles, cards and New Arrivals photos above can be replaced in
// the admin panel. Saved lists replace these in place before the site renders
// (and again with live updates); a list never saved keeps the defaults.

const BUNDLED = {
  hero: heroSlides.map((s) => ({ ...s })),
  categories: discoveryCategories.map((c) => ({ ...c })),
  collections: discoveryCollections.map((c) => ({ ...c })),
  arrivals: newArrivals.cards.map((c) => ({ ...c })),
};

/** The defaults in the admin panel's shape, photos as "builtin:…" references. */
export function bundledHomeContent(imageRef) {
  const withRef = (list) => list.map((item) => ({ ...item, image: imageRef(item.image) }));
  return {
    hero: withRef(BUNDLED.hero).map(({ id, image, alt, eyebrow, title, script, subtitle, cta, href, tone, position }) => ({ id, image, alt, eyebrow, title, script, subtitle, cta, href, tone, position })),
    categories: withRef(BUNDLED.categories),
    collections: withRef(BUNDLED.collections),
    arrivals: BUNDLED.arrivals.map((c) => imageRef(c.image)),
  };
}

/** Applies the home page content saved in the admin panel. */
export function applyHomeContent(saved, resolveImage) {
  const photo = (ref) => (ref ? resolveImage(ref) : null);
  const replace = (target, list) => target.splice(0, target.length, ...list);
  replace(
    heroSlides,
    saved?.hero?.length
      ? saved.hero.map((s) => ({ ...s, image: photo(s.image), alt: s.alt || `${s.title} ${s.script}`.trim() })).filter((s) => s.image)
      : BUNDLED.hero.map((s) => ({ ...s })),
  );
  replace(discoveryCategories, saved?.categories?.length ? saved.categories.map((c) => ({ ...c, image: photo(c.image) })) : BUNDLED.categories.map((c) => ({ ...c })));
  replace(discoveryCollections, saved?.collections?.length ? saved.collections.map((c) => ({ ...c, image: photo(c.image) })) : BUNDLED.collections.map((c) => ({ ...c })));
  // New Arrivals: only the photos change; titles and links stay.
  replace(
    newArrivals.cards,
    BUNDLED.arrivals.map((card, i) => ({ ...card, image: photo(saved?.arrivals?.[i]) ?? card.image })),
  );
}
