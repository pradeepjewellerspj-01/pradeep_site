// Small monochrome brand glyphs (Lucide v1 ships no brand icons).
const base = { viewBox: '0 0 24 24', 'aria-hidden': true };

export const InstagramIcon = (props) => (
  <svg {...base} fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const FacebookIcon = (props) => (
  <svg {...base} fill="currentColor" {...props}>
    <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4a21 21 0 0 0-2.3-.1c-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21Z" />
  </svg>
);

// Line version for the header strip, matching InstagramIcon's stroke.
export const FacebookLineIcon = (props) => (
  <svg {...base} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14.5 21v-7.5h2.6l.4-3h-3V8.7c0-.9.3-1.5 1.5-1.5H17.6V4.5a20 20 0 0 0-2.3-.1c-2.3 0-3.9 1.4-3.9 4v2.1H8.8v3h2.6V21" />
  </svg>
);

export const WhatsappIcon = (props) => (
  <svg {...base} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" {...props}>
    <path d="M3.5 20.5 4.8 16A8.6 8.6 0 1 1 8 19.3Z" />
    <path d="M9 8.6c.2-.5.6-.6.9-.6h.5c.2 0 .4 0 .5.4l.7 1.6c0 .2 0 .4-.1.5l-.5.6c-.1.1-.2.3 0 .5a6 6 0 0 0 2.9 2.5c.2.1.4 0 .5-.1l.6-.7c.1-.2.3-.2.5-.1l1.6.8c.2.1.3.2.3.4 0 .5-.2 1.2-.7 1.5-.6.4-1.5.6-2.9 0a9.3 9.3 0 0 1-4.6-4.5c-.5-1.2-.4-2.2-.2-2.6Z" fill="currentColor" stroke="none" />
  </svg>
);

export const GoogleIcon = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z" fill="#4285f4" />
    <path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" fill="#34a853" />
    <path d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9.1Z" fill="#fbbc05" />
    <path d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.8 9.4 6 12 6Z" fill="#ea4335" />
  </svg>
);

export const PlayStoreIcon = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path d="M4 3.5v17l9-8.5Z" fill="#34c3ff" />
    <path d="M4 3.5 13 12l3-2.8L5.4 3.2c-.5-.3-1-.2-1.4.3Z" fill="#00e07a" />
    <path d="M4 20.5 13 12l3 2.8-10.6 6c-.5.3-1 .2-1.4-.3Z" fill="#ff3d57" />
    <path d="m16 9.2 3.6 2c.7.4.7 1.2 0 1.6l-3.6 2L13 12Z" fill="#ffd400" />
  </svg>
);

export const AppleIcon = (props) => (
  <svg {...base} fill="currentColor" {...props}>
    <path d="M16.4 12.6c0-2.4 2-3.5 2-3.6a4.3 4.3 0 0 0-3.4-1.8c-1.4-.2-2.8.8-3.5.8s-1.9-.8-3-.8a4.6 4.6 0 0 0-3.9 2.3c-1.7 2.9-.4 7.2 1.2 9.6.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8s1.9.8 3.1.8 2-1.2 2.8-2.4a10 10 0 0 0 1.3-2.6 4 4 0 0 1-2.7-3.9ZM14.1 5.6A4 4 0 0 0 15 2.7a4.2 4.2 0 0 0-2.7 1.4 3.9 3.9 0 0 0-1 2.8 3.5 3.5 0 0 0 2.8-1.3Z" />
  </svg>
);
