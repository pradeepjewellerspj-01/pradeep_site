// Footer columns. A link has either `to` (a route) or `modal` (a service panel).
export const footerLinks = [
  {
    title: 'Explore',
    links: [
      { label: 'Gold Rate Today', to: '/gold-rate' },
      { label: 'All Jewellery', to: '/category/all-jewellery' },
      { label: 'Gold', to: '/category/gold' },
      { label: 'Silver', to: '/category/silver' },
      { label: 'Diamond', to: '/category/diamond' },
      { label: 'Gemstones', to: '/category/gemstone' },
    ],
  },
  {
    title: 'Pradeep Jewellers',
    links: [
      { label: 'About Pradeep', to: '/info/about-pradeep' },
      { label: 'Customer Reviews', to: '/reviews' },
      { label: 'Find a Store', modal: 'store' },
      { label: 'Book an Appointment', modal: 'appointment' },
    ],
  },
];

// Business, phone and social details. These are the defaults from the
// Pradeep Jewellers letterhead; when the admin panel has saved its own
// (src/content/siteContent.js), applyContactSettings() replaces them in place
// before the site renders, so every import below sees the saved values.

const REGION_SHORT = { Chhattisgarh: 'C.G.' };
const addressLineOf = ({ street, city, region, postalCode }) =>
  `${street}, ${city}${region ? ` (${REGION_SHORT[region] ?? region})` : ''}${postalCode ? ` – ${postalCode}` : ''}`;

const mapsFor = (line) => {
  const q = encodeURIComponent(`Pradeep Jewellers, ${line}`);
  return {
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${q}`,
    // Keyless Google Maps embed for the store locator.
    mapsEmbedUrl: `https://maps.google.com/maps?q=${q}&z=16&output=embed`,
  };
};

const ADDRESS = { street: 'Jawahar Market, Camp-2, Power House', city: 'Bhilai', region: 'Chhattisgarh', postalCode: '490001', country: 'IN' };
const ADDRESS_LINE = addressLineOf(ADDRESS);
export const business = {
  name: 'Pradeep Jewellers',
  nameHi: 'प्रदीप',
  taglineHi: 'आज से, सदा के लिए',
  since: 1981,
  lines: ['Gold', 'Silver', 'Diamond'],
  hallmark: 'BIS Hallmark Jewellery',
  address: ADDRESS,
  addressLine: ADDRESS_LINE,
  ...mapsFor(ADDRESS_LINE),
};

// Phone numbers from the letterhead. `tel` is the dialable form.
export const phones = [
  { label: 'Showroom', display: '0788-2296809', tel: '+917882296809' },
  { label: 'Showroom', display: '0788-2296609', tel: '+917882296609' },
  { label: 'Mobile', display: '78759 01752', tel: '+917875901752' },
  { label: 'Mobile', display: '78752 37551', tel: '+917875237551' },
];

// Showroom timings, e.g. { days: 'Monday – Saturday', time: '11:00 am – 8:30 pm' }.
// Empty until set in the admin panel; nothing is shown while empty.
export const hours = [];

// The single source of the WhatsApp number: digits only, with country code,
// as wa.me expects. VITE_WHATSAPP_NUMBER sets the default per deployment.
const whatsappOf = (digits) => ({
  whatsapp: `+${digits.slice(0, 2)} ${digits.slice(2, 7)} ${digits.slice(7)}`,
  whatsappNumber: digits,
  whatsappLink: `https://wa.me/${digits}`,
});

export const contact = {
  phone: phones[0].display,
  phoneTel: phones[0].tel,
  ...whatsappOf((import.meta.env.VITE_WHATSAPP_NUMBER || '917898765209').replace(/\D/g, '')),
};

// Official profiles (VITE_INSTAGRAM_URL / VITE_FACEBOOK_URL set the defaults).
export const socialLinks = [
  { id: 'instagram', label: 'Instagram', href: import.meta.env.VITE_INSTAGRAM_URL || 'https://www.instagram.com/pradeepjewellers_bhilai/' },
  { id: 'facebook', label: 'Facebook', href: import.meta.env.VITE_FACEBOOK_URL || 'https://www.facebook.com/share/1DJjiiXtRz/' },
];
// Every profile, so one the admin cleared can come back with a later live update.
const allSocialLinks = socialLinks.map((s) => ({ ...s }));

// "Rate us on Google": the review link from the Google Business Profile (Ask for reviews → Share).
// Until one is set, the button opens the shop on Google Maps, where reviews can be written too.
export const googleReview = { href: import.meta.env.VITE_GOOGLE_REVIEW_URL || '' };
export const googleReviewUrl = () => googleReview.href || business.mapsUrl;

/** The current values in the admin panel's shape (used for its first import). */
export const contactSettings = () => ({
  whatsapp: contact.whatsappNumber,
  phones: phones.map(({ label, display }) => ({ label, display })),
  address: { street: business.address.street, city: business.address.city, region: business.address.region, postalCode: business.address.postalCode },
  instagram: socialLinks.find((s) => s.id === 'instagram')?.href ?? '',
  facebook: socialLinks.find((s) => s.id === 'facebook')?.href ?? '',
  googleReview: googleReview.href,
  hours: hours.map((h) => ({ ...h })),
});

/** Applies contact details saved in the admin panel (already validated by the API). */
export function applyContactSettings(c, telFor) {
  if (!c) return;
  if (c.address?.street) {
    business.address = { ...c.address, country: 'IN' };
    business.addressLine = addressLineOf(c.address);
    Object.assign(business, mapsFor(business.addressLine));
  }
  if (c.phones?.length) phones.splice(0, phones.length, ...c.phones.map((p) => ({ ...p, tel: telFor(p.display) })));
  hours.splice(0, hours.length, ...(c.hours ?? []));
  Object.assign(contact, { phone: phones[0].display, phoneTel: phones[0].tel }, c.whatsapp ? whatsappOf(c.whatsapp) : {});
  if (c.googleReview !== undefined) googleReview.href = c.googleReview;
  // Saved links replace the defaults; a profile the admin cleared is left out.
  socialLinks.splice(0, socialLinks.length, ...allSocialLinks.filter((s) => c[s.id] !== '').map((s) => ({ ...s, href: c[s.id] || s.href })));
}

// Their pages are written in src/data/legal.js.
export const legalLinks = ['Terms & Conditions', 'Privacy Notice', 'Disclaimer'];
