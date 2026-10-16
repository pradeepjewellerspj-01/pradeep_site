import { contact } from '../data/footer';
import { formatPrice, productCode, productPath } from '../data/products';

const GREETING = 'Hi Pradeep Jewellers,';
const SIGN_OFF = 'Thank you.';

const pageUrl = (product) => (typeof window === 'undefined' ? '' : `${window.location.origin}${productPath(product)}`);

/**
 * The one place enquiry text is written. Accepts a product or a list of products.
 * `includePrice` adds the catalogue's indicative price to a single-piece enquiry.
 */
export function buildWhatsAppMessage(input, { includePrice = true } = {}) {
  const seen = new Set();
  const list = (Array.isArray(input) ? input : [input]).filter((p) => p && !seen.has(p.id) && seen.add(p.id));

  if (list.length === 0) {
    return [GREETING, '', 'I would like to know more about your jewellery.', '', SIGN_OFF].join('\n');
  }

  if (list.length === 1) {
    const [p] = list;
    const url = pageUrl(p);
    return [
      `${GREETING} I'm interested in the ${p.name} (${productCode(p)}).`,
      ...(includePrice && p.price ? [`Indicative price on your website: ${formatPrice(p.price)}`] : []),
      ...(url ? [url] : []),
      '',
      'Please share more details.',
      '',
      SIGN_OFF,
    ].join('\n');
  }

  return [
    GREETING,
    '',
    "I'm interested in these jewellery pieces:",
    '',
    ...list.map((p, i) => `${i + 1}. ${p.name} — ${productCode(p)}`),
    '',
    'Please share the price, availability and details for these pieces.',
    '',
    SIGN_OFF,
  ].join('\n');
}

/** wa.me link with the message pre-filled. The customer still presses Send. */
export const whatsAppUrl = (message) =>
  message ? `${contact.whatsappLink}?text=${encodeURIComponent(message)}` : contact.whatsappLink;

export const enquiryUrl = (products) => whatsAppUrl(buildWhatsAppMessage(products));
