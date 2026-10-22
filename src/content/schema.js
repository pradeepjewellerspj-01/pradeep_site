/**
 * Shape and validation of admin-managed content. Plain JavaScript with no
 * browser or Vite imports: the server (server/content.mjs) and the admin
 * panel both use it, so a record the form accepts is a record the API accepts.
 *
 * Each `clean*` function returns { value } or { errors: { field: message } }.
 */

export const METAL_OPTIONS = [
  '24KT Yellow Gold',
  '22KT Yellow Gold',
  '20KT Yellow Gold',
  '18KT Yellow Gold',
  '18KT White Gold',
  '18KT Rose Gold',
  '14KT Yellow Gold',
  'Silver Jewellery',
  'Gemstone',
  'Platinum',
];

/** The group a piece belongs to by its metal: gold (any carat), silver, gemstone or other. */
export const metalType = (metal = '') =>
  /silver/i.test(metal) ? 'silver' : /gem|stone/i.test(metal) ? 'gemstone' : /gold/i.test(metal) ? 'gold' : 'other';

export const PROMO_TONES = ['burgundy', 'espresso', 'ivory'];
export const RATE_KEYS = ['gold24', 'gold22', 'gold20', 'gold18', 'silver', 'silverJewellery'];

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const IMAGE = /^(\/api\/images\/[a-f0-9]{24}|builtin:[a-z0-9.-]+|https:\/\/\S+)$/i;

const str = (v) => (typeof v === 'string' ? v.trim() : '');
const optStr = (v) => str(v) || null;
const num = (v) => (v === '' || v == null ? null : Number(v));

function collect(checks) {
  const errors = {};
  for (const [field, message] of checks) if (message) errors[field] = message;
  return Object.keys(errors).length ? errors : null;
}

const len = (v, min, max, label) => (v.length < min ? `${label} is required` : v.length > max ? `${label} is too long (max ${max})` : null);

export const slugify = (text) =>
  String(text)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// ---------- Products ----------

export function cleanProduct(input) {
  const v = {
    id: str(input.id).toLowerCase(),
    name: str(input.name),
    price: num(input.price),
    metal: str(input.metal),
    weight: num(input.weight),
    image: str(input.image),
    tags: [...new Set((Array.isArray(input.tags) ? input.tags : String(input.tags ?? '').split(',')).map((t) => slugify(t)).filter(Boolean))],
    description: str(input.description),
    hidden: Boolean(input.hidden),
    // Whether visitors see the price and weight (both optional). Both are hidden unless switched on.
    showPrice: Boolean(input.showPrice),
    showWeight: input.showWeight === true,
    position: Number.isFinite(Number(input.position)) ? Number(input.position) : 0,
    // Codes the piece had before (its old links keep working); set by the server on a rename.
    aliases: [...new Set((Array.isArray(input.aliases) ? input.aliases : []).map(str).filter((a) => SLUG.test(a)))].slice(-20),
    // Whether the photo carries the shop's watermark (set when uploaded through the admin panel).
    watermarked: Boolean(input.watermarked),
  };
  v.aliases = v.aliases.filter((a) => a !== v.id);
  const errors = collect([
    ['id', !SLUG.test(v.id) || v.id.length > 40 ? 'Code must be lowercase letters, numbers and dashes' : null],
    ['name', len(v.name, 2, 120, 'Name')],
    [
      'price',
      v.price != null && (!Number.isFinite(v.price) || v.price < 0 || v.price > 100_000_000)
        ? 'Enter the price in rupees'
        : v.showPrice && !v.price
          ? 'Enter the price to show it on the website'
          : null,
    ],
    ['metal', len(v.metal, 2, 60, 'Metal')],
    ['weight', v.weight != null && (!Number.isFinite(v.weight) || v.weight <= 0 || v.weight > 10_000) ? 'Weight must be in grams' : null],    ['image', !IMAGE.test(v.image) ? 'Add a photo' : null],
    ['tags', !v.tags.length ? 'Choose a category (or add a tag)' : v.tags.length > 25 ? 'Too many tags' : null],
    ['description', v.description.length > 1200 ? 'Description is too long (max 1200)' : null],
  ]);
  if (errors) return { errors };
  if (v.price != null) v.price = Math.round(v.price);
  if (v.weight != null) v.weight = Math.round(v.weight * 1000) / 1000;
  return { value: v };
}

// ---------- Promotions ----------

export function cleanPromotion(input) {
  const v = {
    id: str(input.id).toLowerCase(),
    occasion: str(input.occasion),
    label: str(input.label),
    title: str(input.title),
    cta: str(input.cta) || 'Explore',
    href: str(input.href) || '/category/all-jewellery',
    tone: PROMO_TONES.includes(input.tone) ? input.tone : 'burgundy',
    discount: optStr(input.discount),
    image: optStr(input.image),
    startDate: optStr(input.startDate),
    endDate: optStr(input.endDate),
    enabled: Boolean(input.enabled),
    priority: Math.round(Number(input.priority) || 0),
  };
  const errors = collect([
    ['id', !SLUG.test(v.id) || v.id.length > 60 ? 'ID must be lowercase letters, numbers and dashes' : null],
    ['occasion', len(v.occasion, 2, 60, 'Occasion')],
    ['label', len(v.label, 2, 40, 'Label')],
    ['title', len(v.title, 4, 110, 'Message')],
    ['cta', len(v.cta, 2, 20, 'Button text')],
    ['href', !/^\/[^\s]*$/.test(v.href) ? 'Link must be a page on this site, starting with /' : null],
    ['discount', v.discount && v.discount.length > 80 ? 'Offer text is too long (max 80)' : null],
    ['image', v.image && !IMAGE.test(v.image) ? 'Invalid image' : null],
    ['startDate', v.startDate && !DAY.test(v.startDate) ? 'Invalid date' : null],
    ['endDate', v.endDate && !DAY.test(v.endDate) ? 'Invalid date' : v.startDate && v.endDate && v.endDate < v.startDate ? 'End date is before the start date' : null],
    ['priority', Math.abs(v.priority) > 1000 ? 'Priority must be between -1000 and 1000' : null],
  ]);
  return errors ? { errors } : { value: v };
}

// ---------- Settings ----------

/** Dialable form of an Indian number: "0788-2296809" → "+917882296809", "78759 01752" → "+917875901752". */
export function telFor(display) {
  let d = String(display).replace(/\D/g, '');
  if (d.startsWith('91') && d.length === 12) return `+${d}`;
  if (d.startsWith('0')) d = d.slice(1);
  return d.length >= 10 ? `+91${d}` : '';
}

export function cleanSettings(input) {
  const c = input?.contact ?? {};
  const r = input?.rates ?? {};
  const contact = {
    whatsapp: String(c.whatsapp ?? '').replace(/\D/g, ''),
    phones: (Array.isArray(c.phones) ? c.phones : []).map((p) => ({ label: str(p.label) || 'Phone', display: str(p.display) })).filter((p) => p.display),
    address: {
      street: str(c.address?.street),
      city: str(c.address?.city),
      region: str(c.address?.region),
      postalCode: str(c.address?.postalCode),
    },
    instagram: str(c.instagram),
    facebook: str(c.facebook),
    googleReview: str(c.googleReview),
    hours: (Array.isArray(c.hours) ? c.hours : []).map((h) => ({ days: str(h.days), time: str(h.time) })).filter((h) => h.days || h.time),
  };
  if (contact.whatsapp.length === 10) contact.whatsapp = `91${contact.whatsapp}`;

  const values = {};
  for (const k of RATE_KEYS) values[k] = num(r.values?.[k]);
  const rates = { mode: r.mode === 'showroom' ? 'showroom' : 'ibja', values, note: str(r.note) };

  const url = (u) => !u || /^https:\/\/(www\.)?(instagram\.com|facebook\.com|fb\.com)\//i.test(u);
  const errors = collect([
    ['contact.whatsapp', !/^91[6-9]\d{9}$/.test(contact.whatsapp) ? 'Enter a 10-digit Indian mobile number' : null],
    [
      'contact.phones',
      !contact.phones.length
        ? 'Add at least one phone number'
        : contact.phones.some((p) => !telFor(p.display))
          ? 'Each phone needs at least 10 digits'
          : contact.phones.length > 8
            ? 'Up to 8 numbers'
            : null,
    ],
    ['contact.address', !contact.address.street || !contact.address.city ? 'Street and city are required' : null],
    ['contact.address.postalCode', contact.address.postalCode && !/^\d{6}$/.test(contact.address.postalCode) ? 'PIN code has 6 digits' : null],
    ['contact.instagram', !url(contact.instagram) ? 'Use your https://www.instagram.com/… link' : null],
    ['contact.facebook', !url(contact.facebook) ? 'Use your https://www.facebook.com/… link' : null],
    ['contact.googleReview', contact.googleReview && !/^https:\/\/\S+$/i.test(contact.googleReview) ? 'Use the https:// review link from your Google Business Profile' : null],
    ['contact.hours', contact.hours.length > 7 ? 'Up to 7 rows' : contact.hours.some((h) => h.days.length > 40 || h.time.length > 60) ? 'Keep each row short' : null],
    [
      'rates.values',
      rates.mode === 'showroom' && !RATE_KEYS.some((k) => values[k] > 0)
        ? 'Enter at least one showroom rate'
        : RATE_KEYS.some((k) => values[k] != null && !(values[k] > 0 && values[k] < 1_000_000))
          ? 'Rates are per gram, in rupees'
          : null,
    ],
    ['rates.note', rates.note.length > 160 ? 'Note is too long (max 160)' : null],
  ]);
  if (errors) return { errors };
  const value = { contact, rates };
  // The large-screen display's branding; optional so the other panels can save without it.
  if (input?.screen) {
    const sc = input.screen;
    value.screen = { tagline: str(sc.tagline), logo: optStr(sc.logo), showSilver: sc.showSilver !== false };
    const e = collect([
      ['screen.tagline', value.screen.tagline.length > 80 ? 'Tagline is too long (max 80)' : null],
      ['screen.logo', value.screen.logo && !IMAGE.test(value.screen.logo) ? 'Invalid logo image' : null],
    ]);
    if (e) return { errors: e };
  }
  // Customer reviews for the Reviews page; optional like `screen`.
  if (Array.isArray(input?.reviews)) {
    const errors = {};
    value.reviews = input.reviews.slice(0, MAX_REVIEWS + 1).map((r, i) => {
      const review = {
        name: str(r?.name),
        rating: Math.round(Number(r?.rating)),
        text: str(r?.text),
        date: optStr(r?.date),
        source: REVIEW_SOURCES.includes(r?.source) ? r.source : 'google',
      };
      if (!review.name) errors[`reviews.${i}.name`] = 'Name is required';
      else if (review.name.length > 60) errors[`reviews.${i}.name`] = 'Name is too long (max 60)';
      if (!(review.rating >= 1 && review.rating <= 5)) errors[`reviews.${i}.rating`] = 'Choose 1 to 5 stars';
      if (review.text.length > 1000) errors[`reviews.${i}.text`] = 'Review is too long (max 1000)';
      if (review.date && !DAY.test(review.date)) errors[`reviews.${i}.date`] = 'Invalid date';
      return review;
    });
    if (value.reviews.length > MAX_REVIEWS) errors.reviews = `Up to ${MAX_REVIEWS} reviews`;
    if (Object.keys(errors).length) return { errors };
  }
  // Home page sections switched on or off; optional like `screen`. Missing keys take their default.
  if (input?.home && typeof input.home === 'object') {
    value.home = Object.fromEntries(HOME_SECTIONS.map(({ id, on }) => [id, typeof input.home[id] === 'boolean' ? input.home[id] : on]));
  }
  // Jewellery categories (the "All Jewellery" menu and category pages); optional like `screen`.
  if (Array.isArray(input?.categories)) {
    const errors = {};
    value.categories = input.categories.slice(0, MAX_CATEGORIES + 1).map((c, i) => {
      const label = str(c?.label);
      const slug = slugify(str(c?.slug) || label);
      if (!label) errors[`categories.${i}.label`] = 'Name is required';
      else if (label.length > 40) errors[`categories.${i}.label`] = 'Name is too long (max 40)';
      else if (!slug || RESERVED_SLUGS.test(slug)) errors[`categories.${i}.label`] = 'Choose another name';
      return { slug, label };
    });
    if (value.categories.length > MAX_CATEGORIES) errors.categories = `Up to ${MAX_CATEGORIES} categories`;
    const seen = new Set();
    value.categories.forEach((c, i) => {
      if (c.slug && seen.has(c.slug)) errors[`categories.${i}.label`] = 'This category is already in the list';
      seen.add(c.slug);
    });
    if (Object.keys(errors).length) return { errors };
  }
  // Styling 101: Instagram reels shown on the home page; optional like `screen`.
  if (Array.isArray(input?.styling)) {
    const errors = {};
    value.styling = input.styling.slice(0, MAX_REELS + 1).map((r, i) => {
      const code = reelCode(r?.url);
      const reel = { code, url: code ? `https://www.instagram.com/reel/${code}/` : str(r?.url), title: str(r?.title), cover: optStr(r?.cover), productId: optStr(r?.productId) };
      if (!code) errors[`styling.${i}.url`] = 'Paste the link of an Instagram reel (instagram.com/reel/…)';
      if (reel.title.length > 90) errors[`styling.${i}.title`] = 'Title is too long (max 90)';
      if (reel.cover && !IMAGE.test(reel.cover)) errors[`styling.${i}.cover`] = 'Invalid cover image';
      if (reel.productId && !SLUG.test(reel.productId)) errors[`styling.${i}.productId`] = 'Invalid product';
      return reel;
    });
    if (value.styling.length > MAX_REELS) errors.styling = `Up to ${MAX_REELS} reels`;
    const seen = new Set();
    value.styling.forEach((r, i) => {
      if (r.code && seen.has(r.code)) errors[`styling.${i}.url`] = 'This reel is already in the list';
      seen.add(r.code);
    });
    if (Object.keys(errors).length) return { errors };
  }
  return { value };
}

// ---------- Customer reviews ----------

export const MAX_REVIEWS = 60;
// Where the review was written: on Google, or given in the showroom.
export const REVIEW_SOURCES = ['google', 'showroom'];

// ---------- Home page sections ----------

/** The home page's sections, in page order, that the admin panel can switch on and off (`on`: the default). */
export const HOME_SECTIONS = [
  { id: 'promoStrip', on: true, label: 'Offers strip', hint: 'The rotating offers band under the header, on every page' },
  { id: 'hero', on: true, label: 'Top banner slider', hint: 'The large photo slider at the top' },
  { id: 'discovery', on: true, label: 'Shop by Category & Explore Our World', hint: 'Category circles and the Gold, Diamond, Bridal and Silver cards' },
  { id: 'arrivals', on: true, label: 'New Arrivals', hint: 'The New Arrivals band with its two cards' },
  { id: 'styling', on: true, label: 'Styling 101 reels', hint: 'The Instagram reels / story cards' },
  { id: 'assurance', on: false, label: 'Pradeep Assurance', hint: 'Exchange, purity, trust and maintenance promises' },
  { id: 'exchange', on: false, label: 'Old gold exchange', hint: 'The exchange slideshow and its steps' },
  { id: 'promotions', on: false, label: 'Gift & exchange cards', hint: 'The #GiftOfChoice and old-gold exchange cards' },
];

// ---------- Categories ----------

export const MAX_CATEGORIES = 30;
// Slugs the site already uses for its own pages (all pieces, price caps).
const RESERVED_SLUGS = /^(all-jewellery|under-\d+k)$/;

// ---------- Instagram reels (Styling 101) ----------

export const MAX_REELS = 20;

/** The short code of an Instagram reel or post link, e.g. instagram.com/reel/C9xYz…/?igsh=… → "C9xYz…". */
export function reelCode(url) {
  const m = /^(?:https?:\/\/)?(?:www\.|m\.)?instagram\.com\/(?:[A-Za-z0-9_.]+\/)?(?:reel|reels|p|tv)\/([A-Za-z0-9_-]{5,40})/i.exec(str(url));
  return m ? m[1] : null;
}

// ---------- Large-screen advertisements ----------

/**
 * One advertisement on the large-display screen.
 *   type      brand (logo intro) | image | video | rates (gold-rate board) | campaign (an offer from Offers)
 *   media     background image or video (uploaded, builtin:… or https://)
 *   duration  seconds on screen; a video can instead move on when it ends (advanceOnEnd)
 *   showRates whether the gold-rate panel appears on this advertisement
 */
export const AD_TYPES = ['brand', 'image', 'video', 'rates', 'campaign'];

export function cleanAd(input) {
  const v = {
    id: str(input.id).toLowerCase(),
    type: AD_TYPES.includes(input.type) ? input.type : 'image',
    eyebrow: str(input.eyebrow),
    title: str(input.title),
    description: str(input.description),
    media: optStr(input.media),
    poster: optStr(input.poster),
    cta: str(input.cta),
    href: str(input.href),
    duration: Math.round(Number(input.duration) || 8),
    advanceOnEnd: input.advanceOnEnd !== false,
    showRates: Boolean(input.showRates),
    promotionId: optStr(input.promotionId),
    enabled: input.enabled !== false,
    startDate: optStr(input.startDate),
    endDate: optStr(input.endDate),
    position: Number.isFinite(Number(input.position)) ? Number(input.position) : 0,
  };
  const needsMedia = v.type === 'image' || v.type === 'video';
  const errors = collect([
    ['id', !SLUG.test(v.id) || v.id.length > 60 ? 'ID must be lowercase letters, numbers and dashes' : null],
    ['title', v.type === 'image' || v.type === 'video' ? len(v.title, 2, 90, 'Headline') : v.title.length > 90 ? 'Headline is too long (max 90)' : null],
    ['eyebrow', v.eyebrow.length > 50 ? 'Small heading is too long (max 50)' : null],
    ['description', v.description.length > 220 ? 'Description is too long (max 220)' : null],
    ['media', needsMedia && !v.media ? (v.type === 'video' ? 'Add a video' : 'Add an image') : v.media && !IMAGE.test(v.media) ? 'Invalid media' : null],
    ['poster', v.poster && !IMAGE.test(v.poster) ? 'Invalid poster image' : null],
    ['cta', v.cta.length > 24 ? 'Button text is too long (max 24)' : null],
    ['href', v.cta && !/^\/[^\s]*$/.test(v.href) ? 'Link must be a page on this site, starting with /' : null],
    ['duration', v.duration < 3 || v.duration > 120 ? 'Between 3 and 120 seconds' : null],
    ['promotionId', v.type === 'campaign' && !v.promotionId ? 'Choose an offer' : null],
    ['startDate', v.startDate && !DAY.test(v.startDate) ? 'Invalid date' : null],
    ['endDate', v.endDate && !DAY.test(v.endDate) ? 'Invalid date' : v.startDate && v.endDate && v.endDate < v.startDate ? 'End date is before the start date' : null],
  ]);
  if (errors) return { errors };
  if (!v.cta) v.href = '';
  return { value: v };
}
