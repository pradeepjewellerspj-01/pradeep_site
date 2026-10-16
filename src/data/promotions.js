/**
 * Campaign announcements for the promotion strip under the header.
 *
 * Editing guide (no component changes needed):
 *   enabled    – master switch.
 *   startDate  – first day shown, 'YYYY-MM-DD' (India time). null = no start limit.
 *   endDate    – last day shown, inclusive. null = no end limit.
 *   priority   – higher shows first.
 *   tone       – background treatment: 'burgundy' | 'espresso' | 'ivory'.
 *   label      – small kicker, e.g. 'Festive edit'.
 *   occasion   – the occasion line, e.g. 'Dussehra · 2026'.
 *   title      – one restrained sentence.
 *   cta / href – link text and destination (any site route).
 *   discount   – optional offer text, e.g. 'Up to 20% off on selected jewellery'.
 *                Leave null unless the offer is confirmed by the store.
 *   image      – optional imported image shown beside the text on wide screens.
 *
 * Festival dates move every year: check startDate/endDate before each season.
 */
export const promotions = [
  {
    id: 'dussehra-2026',
    occasion: 'Dussehra · 2026',
    label: 'Festive edit',
    title: 'Celebrate the occasion with something timeless.',
    cta: 'Explore',
    href: '/category/gold',
    tone: 'burgundy',
    discount: null,
    image: null,
    startDate: '2026-09-28',
    endDate: '2026-10-21',
    enabled: true,
    priority: 30,
  },
  {
    id: 'diwali-2026',
    occasion: 'Diwali · 2026',
    label: 'Festive edit',
    title: 'Make this Diwali unforgettable.',
    cta: 'Explore',
    href: '/category/all-jewellery',
    tone: 'espresso',
    discount: null,
    image: null,
    startDate: '2026-10-05',
    endDate: '2026-11-10',
    enabled: true,
    priority: 25,
  },
  {
    id: 'wedding-season-2026',
    occasion: 'Wedding season',
    label: 'The wedding edit',
    title: 'Timeless pieces for your celebrations.',
    cta: 'Discover',
    href: '/category/wedding',
    tone: 'burgundy',
    discount: null,
    image: null,
    startDate: '2026-10-01',
    endDate: '2027-02-28',
    enabled: true,
    priority: 20,
  },
  {
    id: 'karwa-chauth-2026',
    occasion: 'Karwa Chauth',
    label: 'Festive edit',
    title: 'A promise, kept in gold.',
    cta: 'Explore',
    href: '/category/gold',
    tone: 'espresso',
    discount: null,
    image: null,
    startDate: null,
    endDate: null,
    enabled: false,
    priority: 22,
  },
  {
    id: 'akshaya-tritiya',
    occasion: 'Akshaya Tritiya',
    label: 'Auspicious gold',
    title: 'A timeless occasion for timeless gold.',
    cta: 'Explore',
    href: '/category/gold',
    tone: 'espresso',
    discount: null,
    image: null,
    startDate: null,
    endDate: null,
    enabled: false,
    priority: 30,
  },
  {
    id: 'holi',
    occasion: 'Holi',
    label: 'Holi edit',
    title: 'Celebrate colour. Wear something timeless.',
    cta: 'Discover',
    href: '/category/gemstone',
    tone: 'burgundy',
    discount: null,
    image: null,
    startDate: null,
    endDate: null,
    enabled: false,
    priority: 30,
  },
  {
    id: 'raksha-bandhan',
    occasion: 'Raksha Bandhan',
    label: 'Gifting edit',
    title: 'For the bond that lasts a lifetime.',
    cta: 'Discover',
    href: '/category/gifting',
    tone: 'ivory',
    discount: null,
    image: null,
    startDate: null,
    endDate: null,
    enabled: false,
    priority: 30,
  },
  {
    id: 'valentines-day',
    occasion: 'Valentine’s Day',
    label: 'Gifting edit',
    title: 'Say it with something that lasts.',
    cta: 'Discover',
    href: '/category/gifting',
    tone: 'burgundy',
    discount: null,
    image: null,
    startDate: null,
    endDate: null,
    enabled: false,
    priority: 30,
  },
  {
    id: 'christmas-new-year',
    occasion: 'Christmas & New Year',
    label: 'Season’s edit',
    title: 'Close the year with something timeless.',
    cta: 'Discover',
    href: '/category/gifting',
    tone: 'espresso',
    discount: null,
    image: null,
    startDate: null,
    endDate: null,
    enabled: false,
    priority: 30,
  },
  {
    id: 'independence-day',
    occasion: 'Independence Day',
    label: 'Heritage edit',
    title: 'Crafted in India, worn with pride.',
    cta: 'Explore',
    href: '/category/all-jewellery',
    tone: 'ivory',
    discount: null,
    image: null,
    startDate: null,
    endDate: null,
    enabled: false,
    priority: 30,
  },
  {
    id: 'republic-day',
    occasion: 'Republic Day',
    label: 'Heritage edit',
    title: 'Traditions worth wearing.',
    cta: 'Explore',
    href: '/category/all-jewellery',
    tone: 'ivory',
    discount: null,
    image: null,
    startDate: null,
    endDate: null,
    enabled: false,
    priority: 30,
  },
  {
    id: 'diamond-collection',
    occasion: 'The diamond collection',
    label: 'Collection',
    title: 'Light, held in gold.',
    cta: 'Discover',
    href: '/category/diamond',
    tone: 'espresso',
    discount: null,
    image: null,
    startDate: null,
    endDate: null,
    enabled: false,
    priority: 10,
  },
  {
    id: 'gold-collection',
    occasion: 'The gold collection',
    label: 'Collection',
    title: 'Everyday gold, made to be kept.',
    cta: 'Discover',
    href: '/category/gold',
    tone: 'espresso',
    discount: null,
    image: null,
    startDate: null,
    endDate: null,
    enabled: false,
    priority: 10,
  },
  {
    id: 'jewellery-sale',
    occasion: 'Showroom offer',
    label: 'Limited period',
    title: 'Selected pieces, for a limited time.',
    cta: 'Explore',
    href: '/category/all-jewellery',
    tone: 'burgundy',
    discount: null, // e.g. 'Up to 20% off on selected jewellery' — only once confirmed
    image: null,
    startDate: null,
    endDate: null,
    enabled: false,
    priority: 40,
  },
  {
    // Always-on fallback so the strip is never empty between occasions.
    id: 'showroom',
    occasion: 'The Pradeep showroom',
    label: 'New in',
    title: 'Save the pieces you love, then ask us on WhatsApp.',
    cta: 'Discover',
    href: '/category/all-jewellery',
    tone: 'espresso',
    discount: null,
    image: null,
    startDate: null,
    endDate: null,
    enabled: true,
    priority: 0,
  },
];

/** Today's date in India as 'YYYY-MM-DD'. */
export const indiaToday = (now = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(now);

/** Promotions to show on `now`: enabled, inside their dates, highest priority first. */
export function activePromotions(now = new Date(), list = promotions) {
  const today = indiaToday(now);
  return list
    .filter((p) => p.enabled && (!p.startDate || p.startDate <= today) && (!p.endDate || today <= p.endDate))
    .sort((a, b) => b.priority - a.priority);
}

// The promotions as shipped with the site, for the admin panel's first import.
export const bundledPromotions = promotions.map((p) => ({ ...p }));

/** Replaces the promotions with those saved in the admin panel, in place, before the site renders. */
export function applyPromotions(list, resolveImage) {
  promotions.splice(0, promotions.length, ...list.map((p) => ({ ...p, image: p.image ? resolveImage(p.image) : null })));
}
