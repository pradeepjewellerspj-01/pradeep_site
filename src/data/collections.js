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
    subtitle: 'Explore latest designs under ₹50k',
    cta: 'Explore Now',
    href: '/category/under-50k',
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
    title: 'Under 50k',
    href: '/category/under-50k',
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
    { title: 'Station Chains', href: '/category/chains', image: images.arrivals.chain, alt: 'Rose gold chain draped on white' },
  ],
};

