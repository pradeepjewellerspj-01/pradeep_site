import { business, contact, phones } from './footer';

// Policy pages linked from the footer. Keyed by the slug of the footer label.
// Each section is a heading with paragraphs (`p`), optional bullet points (`list`)
// and paragraphs that follow the list (`after`).
// Update `updated` whenever the wording changes.

const UPDATED = '2026-10-16';
const phoneList = phones.map((ph) => ph.display).join(', ');
const showroom = `${business.name}, ${business.addressLine}`;

const contactSection = {
  heading: 'Contact us',
  p: [`${showroom}.`, `Phone: ${phoneList}. WhatsApp: ${contact.whatsapp}.`],
};

export const legalPages = {
  'terms-and-conditions': {
    title: 'Terms & Conditions',
    updated: UPDATED,
    intro: `These terms apply to your use of this website, run by ${business.name} of Bhilai, Chhattisgarh. By using the website you agree to them. If you do not agree, please do not use the website.`,
    sections: [
      {
        heading: 'About this website',
        p: [
          'This website is a catalogue to help you discover our jewellery. You cannot buy or pay for anything on it. You can save pieces to “My Selection” and send us an enquiry on WhatsApp, call us, or visit the showroom.',
          'Any sale takes place only in our showroom, or as agreed directly with our team, and is confirmed by our invoice. The invoice and the terms explained to you at the time of purchase apply to that sale.',
        ],
      },
      {
        heading: 'Prices and metal rates',
        p: ['Prices shown on this website are indicative only and are not an offer to sell at that price.'],
        list: [
          'The final price of a piece depends on the metal rate on the day of purchase, its exact weight, making charges, stone or diamond charges where applicable, and taxes, including GST.',
          'Gold and silver rates on this website are indicative rates published by the India Bullion and Jewellers Association (IBJA), shown per 10 grams for gold and per kg for silver. 20K is calculated from IBJA’s 999 rate × 0.833, as IBJA does not publish it. They are not our selling rate and exclude GST and making charges.',
          'The price and availability of a piece are confirmed by our team before any purchase.',
        ],
      },
      {
        heading: 'Products, images and availability',
        p: [
          'We take care to describe our jewellery accurately. Photographs, colours and 3D views are representative, and the actual piece may differ slightly in colour, finish, size or weight. Weights and dimensions shown are approximate.',
          'Pieces shown may already have been sold or may need to be made to order. Saving a piece to “My Selection” does not reserve it.',
        ],
      },
      {
        heading: 'Hallmarking and certification',
        p: [
          'Gold jewellery we sell is BIS hallmarked as required by law. Where a diamond or gemstone is sold with a certificate, the certificate details are given to you at the time of purchase. Please check the hallmark and any certificate on your invoice when you buy.',
        ],
      },
      {
        heading: 'Old gold exchange',
        p: [
          'Exchange offers described on this website, including deduction terms, apply as stated in the offer and may change or end at any time. The exchange value is decided in the showroom after checking the purity and weight of your gold in front of you. The online estimator gives an estimate only.',
        ],
      },
      {
        heading: 'Enquiries and appointments',
        p: [
          'When you send an enquiry or appointment request, the website opens WhatsApp with your message filled in. Nothing is sent until you press Send. An appointment is confirmed only when our team confirms it with you.',
        ],
      },
      {
        heading: 'Offers',
        p: [
          'Offers and promotions are valid for the period stated and are subject to their own conditions, which our team will explain. Offers cannot be combined unless we say so.',
        ],
      },
      {
        heading: 'Use of the website',
        p: ['You agree not to misuse the website, including by trying to disrupt it, gain unauthorised access to it, or copy its content in bulk.'],
      },
      {
        heading: 'Intellectual property',
        p: [
          `The name ${business.name}, our logo, designs, photographs and text on this website belong to ${business.name} or are used with permission. You may not copy, reproduce or use them for commercial purposes without our written permission.`,
        ],
      },
      {
        heading: 'Links to other websites',
        p: [
          'The website links to services we do not control, such as WhatsApp, Instagram, Facebook and Google Maps. Your use of those services is governed by their own terms and policies.',
        ],
      },
      {
        heading: 'Liability',
        p: [
          'The website is provided on an “as available” basis. To the extent permitted by law, we are not responsible for any loss arising from your use of the website or from reliance on information on it, including indicative prices and rates. Nothing in these terms limits your rights as a consumer under Indian law.',
        ],
      },
      {
        heading: 'Changes to these terms',
        p: ['We may update these terms from time to time. The date at the top of this page shows when they were last changed.'],
      },
      {
        heading: 'Governing law',
        p: ['These terms are governed by the laws of India. Any dispute is subject to the jurisdiction of the courts at Durg, Chhattisgarh.'],
      },
      contactSection,
    ],
  },

  'privacy-notice': {
    title: 'Privacy Notice',
    updated: UPDATED,
    intro: `This notice explains what personal information ${business.name} handles when you use this website or contact us, and how we use it. We collect as little as possible.`,
    sections: [
      {
        heading: 'What this website does not collect',
        p: ['You do not need an account to use this website, and we do not take payments on it. The website does not use advertising or analytics cookies to track you.'],
      },
      {
        heading: 'Stored on your own device',
        p: [
          '“My Selection” — the pieces you save with ♡ — is stored only in your browser on your device. It is not sent to us. You can clear it at any time by removing the pieces, or by clearing your browser’s site data.',
        ],
      },
      {
        heading: 'When you contact us',
        p: ['You choose what to share with us when you get in touch:'],
        list: [
          'WhatsApp: enquiry and appointment buttons open WhatsApp with a message filled in, which may include the pieces you selected and, for appointments, your name, mobile number and preferred date. Nothing is sent until you press Send. We then receive your message and WhatsApp number.',
          'Phone and showroom visits: we receive the details you give us.',
        ],
      },
      {
        heading: 'How we use your information',
        list: [
          'To reply to your enquiry and share prices, availability and details of pieces.',
          'To arrange and confirm appointments.',
          'To complete a purchase and keep the records the law requires, such as invoices.',
        ],
        after: ['We do not sell your personal information, and we do not use it for unrelated marketing without your consent.'],
      },
      {
        heading: 'Services from other companies',
        p: ['Some features rely on other companies, which handle data under their own privacy policies:'],
        list: [
          'WhatsApp (Meta) carries the messages you send us.',
          'Google Maps shows our location in the “Find a Store” panel; the map loads from Google only when you open it.',
          'Google Fonts provides the website’s typefaces, so your browser connects to Google to load them.',
          'Instagram (Meta) plays the reels in “Styling 101 With Diamonds”; a reel loads from Instagram only when you open it.',
          'Instagram and Facebook, if you follow the links to our profiles.',
        ],
      },
      {
        heading: 'How long we keep information',
        p: ['We keep enquiry messages only as long as needed to help you, and purchase records for as long as the law requires.'],
      },
      {
        heading: 'Your rights',
        p: [
          'Under India’s Digital Personal Data Protection Act, 2023, you may ask us to access, correct or erase the personal information we hold about you, or withdraw any consent you have given. To do so, or to raise a concern, contact us using the details below. We will respond within a reasonable time.',
        ],
      },
      {
        heading: 'Changes to this notice',
        p: ['We may update this notice from time to time. The date at the top of this page shows when it was last changed.'],
      },
      contactSection,
    ],
  },

  disclaimer: {
    title: 'Disclaimer',
    updated: UPDATED,
    intro: 'The information on this website is provided to help you discover our jewellery. Please read the points below before relying on it.',
    sections: [
      {
        heading: 'Gold and silver rates',
        p: [
          'Rates are indicative rates published by the India Bullion and Jewellers Association (IBJA), shown per 10 grams for gold and per kg for silver; 20K is calculated from IBJA’s 999 rate × 0.833, as IBJA does not publish it. They are shown for reference only, update during the day, and may be delayed or temporarily unavailable. When the latest rates cannot be fetched, the website shows the most recent rates it has, with the date they were published.',
          'These rates are not our selling rate. They exclude GST and making charges. Please ask our team for the rate that applies on the day of purchase.',
        ],
      },
      {
        heading: 'Prices',
        p: [
          'Prices of pieces on this website are indicative and may change with the metal rate, weight and charges. The final price is confirmed by our team and shown on our invoice.',
        ],
      },
      {
        heading: 'Images and 3D views',
        p: [
          'Photographs, colours and 3D views are representative. Actual pieces may differ slightly in colour, finish, size and weight because of photography, screens and the handmade nature of jewellery.',
        ],
      },
      {
        heading: 'Old gold estimate',
        p: ['The old gold exchange calculator gives an estimate only. The actual value is decided in the showroom after checking the purity and weight of your gold.'],
      },
      {
        heading: 'Accuracy',
        p: [
          'We work to keep this website accurate and up to date, but errors can occur. If you notice a mistake, please let us know. In case of any difference, the details confirmed by our team and on our invoice apply.',
        ],
      },
      {
        heading: 'Other websites',
        p: ['Links to other websites and services are provided for convenience. We are not responsible for their content or practices.'],
      },
      contactSection,
    ],
  },
};
