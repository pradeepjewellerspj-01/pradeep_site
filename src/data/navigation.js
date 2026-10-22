import { Coins, Diamond, Gem, Sparkle, Sparkles } from 'lucide-react';

/**
 * Category bar. Kept deliberately short: five entries, and a small dropdown
 * only on All Jewellery and Gold. Every link points at a tag that exists in
 * data/products.js. Add a link here only once products carry its tag.
 */
const link = (label, slug) => ({ label, slug });

export const primaryNav = [
  {
    label: 'All Jewellery',
    slug: 'all-jewellery',
    icon: Sparkles,
    menu: [
      {
        title: 'Category',
        links: [link('Earrings', 'earrings'), link('Rings', 'finger-rings'), link('Pendants', 'pendants'), link('Necklaces', 'necklaces'), link('Bracelets', 'bracelets'), link('Bangles', 'bangles')],
      },
    ],
  },
  {
    label: 'Gold',
    slug: 'gold',
    icon: Coins,
    menu: [{ title: 'Gold', links: [link('Gold Earrings', 'gold-earrings'), link('Gold Chains', 'gold-chains'), link('Gold Bangles', 'gold-bangles'), link('Gold Coins', 'gold-coins')] }],
  },
  { label: 'Silver', slug: 'silver', icon: Sparkle },
  { label: 'Diamond', slug: 'diamond', icon: Gem },
  { label: 'Gemstones', slug: 'gemstone', icon: Diamond },
];

const categoryGroup = primaryNav[0].menu[0];

/** The categories bundled with the site, for the admin panel. */
export const BUNDLED_CATEGORIES = categoryGroup.links.map(({ label, slug }) => ({ label, slug }));

// Every category set in the admin panel, shown or not (page titles use it).
const allCategories = [...BUNDLED_CATEGORIES];

/**
 * Categories saved in the admin panel (Products tab) replace the "All
 * Jewellery" menu, in place and in their order. A category shows in the menu
 * only once a piece on the website carries it, so no menu link leads to an
 * empty page. With none saved, the bundled list stays.
 */
export function applyCategories(list, products) {
  const next = list?.length ? list : BUNDLED_CATEGORIES;
  allCategories.splice(0, allCategories.length, ...next);
  const used = new Set(products.flatMap((p) => p.tags));
  categoryGroup.links.splice(0, categoryGroup.links.length, ...next.filter((c) => used.has(c.slug)).map((c) => link(c.label, c.slug)));
}

/** The admin-set name of a category ("finger-rings" → "Rings"), if it is one. */
export const categoryLabel = (slug) => allCategories.find((c) => c.slug === slug)?.label ?? null;

// Suggestions surfaced by the search dropdown before the user types.
export const searchSuggestions = ['Gold', 'Diamond', 'Earrings', 'Rings', 'Necklaces', 'Bangles', 'Mangalsutra'];

export const searchPlaceholder = 'Search jewellery, gold, diamonds…';

export const toSlug = (text) =>
  text
    .toLowerCase()
    .replace(/₹/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
