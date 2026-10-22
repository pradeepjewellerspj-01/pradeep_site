import { productImages as img } from './images';
import { images } from './images';

// Mock catalogue. `tags` drive category pages and search.
export const products = [
  { id: 'pj-1001', name: 'Sapphire Halo Drop Earrings', price: 84500, metal: '18KT White Gold', image: img[0], tags: ['earrings', 'diamond', 'gemstone', 'women', 'party-wear', 'drops'] },
  { id: 'pj-1002', name: 'Classic Halo Diamond Studs', price: 46800, metal: '18KT White Gold', image: img[1], tags: ['earrings', 'diamond', 'studs', 'women', 'daily-wear', 'office-wear', 'under-50k', 'gifting'] },
  { id: 'pj-1003', name: 'Cushion Solitaire Pendant', price: 38900, metal: '18KT White Gold', image: img[2], tags: ['pendants', 'diamond', 'women', 'under-50k', 'gifting', 'daily-wear'] },
  { id: 'pj-1004', name: 'Rainbow Gemstone Cocktail Rings', price: 72300, metal: '22KT Yellow Gold', image: img[3], tags: ['rings', 'finger-rings', 'gemstone', 'gold', 'women', 'party-wear'] },
  { id: 'pj-1005', name: 'Vintage Halo Engagement Ring', price: 96200, metal: '18KT White Gold', image: img[4], tags: ['rings', 'finger-rings', 'diamond', 'wedding', 'engagement-rings', 'solitaires'] },
  { id: 'pj-1006', name: 'Filigree Rose Gold Bracelet', price: 41200, metal: '18KT Rose Gold', image: img[5], tags: ['bracelets', 'gold', 'women', 'under-50k', 'gifting', 'daily-wear'] },
  { id: 'pj-1007', name: 'Ruby Kada Bracelet', price: 128000, metal: '22KT Yellow Gold', image: img[6], tags: ['bracelets', 'bangles', 'gold', 'gemstone', 'ruby', 'traditional', 'wedding'] },
  { id: 'pj-1008', name: 'Sculpted Twin Hoops', price: 28400, metal: '22KT Yellow Gold', image: img[7], tags: ['earrings', 'gold', 'hoops', 'daily-wear', 'under-50k', 'office-wear', 'women'] },
  { id: 'pj-1009', name: 'Temple Bead Ear Studs', price: 19800, metal: '22KT Yellow Gold', image: img[8], tags: ['earrings', 'gold', 'studs', 'traditional', 'under-50k', 'kids', 'gold-earrings'] },
  { id: 'pj-1010', name: 'Kundan Flower Studs', price: 24600, metal: '22KT Yellow Gold', image: img[9], tags: ['earrings', 'gold', 'polki', 'studs', 'traditional', 'under-50k', 'gold-earrings'] },
  { id: 'pj-1011', name: 'Pear Cascade Diamond Drops', price: 112500, metal: '18KT White Gold', image: img[10], tags: ['earrings', 'diamond', 'drops', 'wedding', 'party-wear', 'women', 'pear'] },
  { id: 'pj-1012', name: 'Petite Bloom Diamond Studs', price: 22650, metal: '18KT Yellow Gold', image: img[11], tags: ['earrings', 'diamond', 'studs', 'daily-wear', 'under-50k', 'kids', 'gifting'] },
  { id: 'pj-1013', name: 'Rose Gold Medallion Drops', price: 31500, metal: '18KT Rose Gold', image: img[12], tags: ['earrings', 'gold', 'drops', 'daily-wear', 'under-50k', 'casual-wear'] },
  { id: 'pj-1014', name: 'Heritage Bridal Gold Set', price: 345000, metal: '22KT Yellow Gold', image: img[13], tags: ['necklaces', 'gold', 'wedding', 'bridal-sets', 'traditional', 'mangalsutra'] },
  { id: 'pj-1015', name: 'Ruby Chandelier Earrings', price: 58900, metal: '22KT Yellow Gold', image: img[14], tags: ['earrings', 'gold', 'gemstone', 'ruby', 'traditional', 'jhumkas', 'wedding'] },
  { id: 'pj-1016', name: 'Twisted Rope Bangles (Pair)', price: 142000, metal: '22KT Yellow Gold', image: img[15], tags: ['bangles', 'gold', 'traditional', 'wedding', 'women', 'gold-bangles'] },
  { id: 'pj-1017', name: 'Laurel Wreath Diamond Earrings', price: 64300, metal: '18KT White Gold', image: img[16], tags: ['earrings', 'diamond', 'party-wear', 'women', 'marquise'] },
  { id: 'pj-1018', name: 'Peacock Polki Danglers', price: 49900, metal: '22KT Yellow Gold', image: img[17], tags: ['earrings', 'gold', 'polki', 'gemstone', 'traditional', 'jhumkas', 'under-50k', 'emerald'] },
  { id: 'pj-1019', name: 'Cuban Link Gold Chain', price: 118000, metal: '22KT Yellow Gold', image: img[18], tags: ['chains', 'gold', 'men', 'for-him', 'gold-chains', 'minimal-chains'] },
  { id: 'pj-1020', name: 'Layered Pearl & Gold Necklace', price: 76400, metal: '22KT Yellow Gold', image: img[19], tags: ['necklaces', 'chains', 'gold', 'pearl', 'gemstone', 'women', 'party-wear'] },
  { id: 'pj-1021', name: 'Emerald Cut Pendant', price: 44750, metal: '18KT Yellow Gold', image: images.collections.pendant, tags: ['pendants', 'gemstone', 'emerald', 'under-50k', 'gifting', 'women'] },
  { id: 'pj-1022', name: '24KT Lakshmi Gold Coin (10g)', price: 76500, metal: '24KT Yellow Gold', image: images.collections.coins, tags: ['gold-coins', 'coins', 'gold', 'gifting', 'more'] },
  { id: 'pj-1023', name: 'Station Rose Gold Chain', price: 27800, metal: '18KT Rose Gold', image: images.arrivals.chain, tags: ['chains', 'gold', 'mangalsutra', 'daily-wear', 'under-50k', 'minimal-chains'] },
  { id: 'pj-1024', name: 'Silver Ganesha Idol', price: 18500, metal: '999 Silver', image: images.arrivals.silver, tags: ['silver-idols', 'silver', 'gifting', 'more', 'under-50k'] },
  { id: 'pj-1025', name: 'Diamond Tennis Bracelet', price: 112000, metal: '18KT White Gold', image: images.categories.bracelets, tags: ['bracelets', 'diamond', 'women', 'party-wear', 'diamond-bracelets'] },
  { id: 'pj-1026', name: 'Jaali Jhumkas', price: 52400, metal: '22KT Yellow Gold', image: images.categories.earrings, tags: ['earrings', 'gold', 'jhumkas', 'traditional', 'wedding'] },
  { id: 'pj-1027', name: 'Floral Diamond Cocktail Ring', price: 58200, metal: '22KT Yellow Gold', image: images.categories.rings, tags: ['rings', 'finger-rings', 'diamond', 'gold', 'party-wear', 'gold-rings'] },
  { id: 'pj-1028', name: 'Carved Gold Bangles (Pair)', price: 98600, metal: '22KT Yellow Gold', image: images.categories.bangles, tags: ['bangles', 'gold', 'traditional', 'gold-bangles', 'women'] },
];

export const formatPrice = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

// Also finds a piece by a code it had before its tag number was changed.
export const getProduct = (id) => products.find((p) => p.id === id) ?? products.find((p) => p.aliases?.includes(id));

// What visitors may see: each is switched on per piece in the admin panel (both off by default).
export const shownPrice = (product) => (product.showPrice && product.price ? product.price : null);
export const shownWeight = (product) => (product.showWeight === true && product.weight ? product.weight : null);

// Customer-facing reference, e.g. "pj-1014" → "PJ-1014".
export const productCode = (product) => product.id.toUpperCase();

export const productPath = (product) => `/product/${product.id}`;

// Which market rate a piece's metal relates to (null for metals not quoted).
// Silver pieces use the showroom's silver jewellery rate when one is set (ProductPage).
export const marketKeyForMetal = (metal = '') => {
  const m = metal.toLowerCase();
  if (m.includes('silver')) return 'silver';
  if (m.includes('22kt')) return 'gold22';
  if (m.includes('20kt')) return 'gold20';
  if (m.includes('18kt')) return 'gold18';
  if (m.includes('gold')) return 'gold24';
  return null;
};

// Map loose slugs ("finger-rings", "under-25k", "gold-earrings") onto the catalogue.
export const productsForSlug = (slug) => {
  if (!slug || slug === 'all-jewellery') return products;
  const priceCap = slug.match(/under-(\d+)k/);
  if (priceCap) return products.filter((p) => p.price != null && p.price <= Number(priceCap[1]) * 1000);
  const direct = products.filter((p) => p.tags.includes(slug));
  if (direct.length) return direct;
  const words = slug.split('-').filter((w) => w.length > 2);
  const loose = products.filter((p) =>
    words.some((w) => p.tags.some((t) => t.includes(w)) || p.name.toLowerCase().includes(w)),
  );
  return loose;
};

export const searchProducts = (query) => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter(
    (p) => p.name.toLowerCase().includes(q) || p.metal.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q)),
  );
};

// The catalogue as shipped with the site, for the admin panel's first import.
export const bundledProducts = products.map((p) => ({ ...p }));

/**
 * Replaces the catalogue with the one saved in the admin panel, in place,
 * before the site renders. Optional fields: `price` (never shown to visitors),
 * `weight` (grams) and `description`.
 */
export function applyProducts(list, resolveImage) {
  const usable = list.map((p) => ({ ...p, image: resolveImage(p.image) })).filter((p) => p.image);
  products.splice(0, products.length, ...usable);
}
