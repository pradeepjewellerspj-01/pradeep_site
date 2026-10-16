import { business } from './footer';
import { activePromotions, indiaToday } from './promotions';

/**
 * The showroom-TV advertisement sequence (/screen, src/components/adstage/).
 *
 * These are the defaults, played until the admin panel has advertisements of
 * its own (applyAds replaces them before the site renders). Media are
 * "builtin:<name>" references into src/data/images.js, uploaded files
 * (/api/images/…) or https URLs. Copy states only what the shop offers; the
 * campaign slot shows a live offer from Offers, and is skipped when none is live.
 * Field reference: cleanAd() in src/content/schema.js.
 */
const DEFAULT_ADS = [
  {
    id: 'brand',
    type: 'brand',
    eyebrow: `Since ${business.since}`,
    title: '',
    description: 'Gold, silver and diamond jewellery',
    media: null,
    duration: 7,
  },
  {
    id: 'gold-necklaces',
    type: 'image',
    eyebrow: 'The gold collection',
    title: 'Gold, made to be kept.',
    description: 'Necklaces, sets and everyday gold in BIS hallmarked 22KT.',
    media: 'builtin:hero.0',
    cta: 'Explore gold',
    href: '/category/gold',
    duration: 9,
  },
  {
    id: 'bridal',
    type: 'image',
    eyebrow: 'The bridal edit',
    title: 'For the day you will always remember.',
    description: 'Bridal sets, bangles and jhumkas for the wedding season.',
    media: 'builtin:world.gold',
    cta: 'Discover bridal',
    href: '/category/wedding',
    duration: 9,
  },
  {
    id: 'rings-diamonds',
    type: 'image',
    eyebrow: 'Rings & diamonds',
    title: 'Light, held in gold.',
    description: 'Solitaires, engagement rings and diamond jewellery.',
    media: 'builtin:hero.2',
    cta: 'Discover diamonds',
    href: '/category/diamond',
    duration: 9,
  },
  {
    id: 'live-offer',
    type: 'campaign',
    promotionId: 'auto', // the highest-priority offer live today
    media: 'builtin:world.wedding',
    duration: 8,
  },
].map((ad, position) => ({
  cta: '',
  href: '',
  poster: null,
  advanceOnEnd: true,
  showRates: false,
  promotionId: null,
  enabled: true,
  startDate: null,
  endDate: null,
  ...ad,
  position,
}));

export const ads = DEFAULT_ADS.map((ad) => ({ ...ad }));

/** The defaults, for the admin panel's "start from the default sequence". */
export const bundledAds = DEFAULT_ADS.map((ad) => ({ ...ad }));

/** Branding on the screen; `logo` null means the PJ monogram lockup. */
export const screen = { tagline: business.taglineHi, logo: null, showSilver: true };

/** Applies admin-saved advertisements (an empty list keeps the defaults) and screen branding. */
const DEFAULT_SCREEN = { ...screen };

export function applyAds(list, settings) {
  // Also called again with live updates: an emptied list or cleared branding returns to the defaults.
  ads.splice(0, ads.length, ...(list?.length ? list : DEFAULT_ADS.map((ad) => ({ ...ad }))));
  Object.assign(screen, DEFAULT_SCREEN, settings ? { tagline: settings.tagline || DEFAULT_SCREEN.tagline, logo: settings.logo ?? null, showSilver: settings.showSilver !== false } : {});
}

/**
 * What plays now: enabled, inside its dates (India time), with campaigns
 * resolved to their offer. A campaign whose offer is not live is skipped.
 */
export function playableAds(list = ads, now = new Date(), promotionList = undefined) {
  const today = indiaToday(now);
  const live = activePromotions(now, promotionList);
  return list
    .filter((ad) => ad.enabled !== false && (!ad.startDate || ad.startDate <= today) && (!ad.endDate || today <= ad.endDate))
    .map((ad) => {
      if (ad.type !== 'campaign') return ad;
      const promo = ad.promotionId === 'auto' ? live[0] : live.find((p) => p.id === ad.promotionId);
      if (!promo) return null;
      return {
        ...ad,
        eyebrow: ad.eyebrow || `${promo.label} · ${promo.occasion}`,
        title: ad.title || promo.title,
        description: ad.description || promo.discount || '',
        cta: ad.cta || promo.cta,
        href: ad.cta ? ad.href : promo.href,
        media: ad.media || promo.image || null,
      };
    })
    .filter(Boolean);
}
