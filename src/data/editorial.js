import { images } from './images';

// "Styling 101 With Diamonds": vertical story cards.
export const stories = [
  { id: 's1', image: images.stories[0], title: 'Find the perfect diamond that speaks for you', productId: 'pj-1005' },
  { id: 's2', image: images.stories[1], title: 'Statement diamonds for the reception', productId: 'pj-1011' },
  { id: 's3', image: images.stories[2], title: 'One ring, three ways to stack', productId: 'pj-1027' },
  { id: 's4', image: images.stories[3], title: 'Drops that catch every light', productId: 'pj-1017' },
  { id: 's5', image: images.stories[4], title: 'The everyday stud, reimagined', productId: 'pj-1012' },
  { id: 's6', image: images.stories[5], title: 'Bracelets that move with you', productId: 'pj-1025' },
];

const BUNDLED_STORIES = stories.map((s) => ({ ...s }));

/**
 * Instagram reels added in the admin panel (Styling 101 tab) replace the
 * stories, in place; with none, the photo stories above return. A reel card
 * shows its cover (or an Instagram-style card) and plays the reel in
 * Instagram's own player when opened.
 */
export function applyStyling(reels, resolveImage) {
  const next = reels?.length
    ? reels.map((r) => ({
        id: `reel-${r.code}`,
        reel: r.code,
        url: r.url,
        title: r.title || 'Watch on Instagram',
        image: r.cover ? resolveImage(r.cover) : null,
        productId: r.productId || null,
      }))
    : BUNDLED_STORIES.map((s) => ({ ...s }));
  stories.splice(0, stories.length, ...next);
}

export const assurance = {
  title: ['Pradeep', 'Assurance'],
  subtitle: 'Crafted by experts, cherished by you',
  items: [
    { icon: 'craft', label: ['Quality', 'Craftsmanship'] },
    { icon: 'heart', label: ['Ethically', 'Sourced'] },
    { icon: 'diamond', label: ['100%', 'Transparency'] },
  ],
};

export const exchange = {
  title: 'Exchange Program',
  subtitle: 'Bring in your old gold, take home something new',
  bannerTitle: ["Welcome to Pradeep's", 'exchange program'],
  image: images.exchange,
  quote: "Trust us to be part of your precious moments and to deliver jewellery that you'll cherish forever.",
  benefits: [
    { icon: 'exchange', label: ['Pradeep', 'Exchange'] },
    { icon: 'purity', label: ['The Purity', 'Guarantee'] },
    { icon: 'diamond', label: ['Complete Transparency', 'and Trust'] },
    { icon: 'shield', label: ['Lifetime', 'Maintenance'] },
  ],
};

export const promotions = {
  gift: {
    title: '#GiftOfChoice',
    copy: 'Breathtaking gifts for your loved ones',
    price: 'Ask us on WhatsApp',
    cta: 'Explore Now',
    href: '/category/gifting',
  },
  oldGold: {
    title: 'Exchange your old gold at Pradeep, and make every gram count towards something new.',
    copy: 'Flat 0% deduction* on exchange of old gold (18KT and above) from any jeweller.',
    cta: 'Know more',
  },
};
