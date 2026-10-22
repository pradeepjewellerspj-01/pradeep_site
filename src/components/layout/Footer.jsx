import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Clock, MapPin, Phone } from 'lucide-react';
import Logo from '../common/Logo';
import { AppleIcon, FacebookIcon, GoogleIcon, InstagramIcon, PlayStoreIcon, WhatsappIcon } from '../common/BrandIcons';
import { business, contact, footerLinks, googleReviewUrl, hours, legalLinks, phones, socialLinks } from '../../data/footer';
import { toSlug } from '../../data/navigation';
import { useStore } from '../../context/StoreContext';

const socialIcons = { instagram: InstagramIcon, facebook: FacebookIcon };
const linkClass = 'font-sans text-[13px] text-footer-muted transition-colors hover:text-white';

function FooterLink({ link }) {
  const { openModal } = useStore();
  if (link.modal)
    return (
      <button type="button" onClick={() => openModal(link.modal)} className={linkClass}>
        {link.label}
      </button>
    );
  return (
    <Link to={link.to} className={linkClass}>
      {link.label}
    </Link>
  );
}

/** A link column; collapsible on phones. */
function LinkColumn({ title, links }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/12 md:border-0">
      <h3 className="hidden font-serif text-[17px] text-footer-text md:mb-4 md:block">{title}</h3>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-4 font-serif text-[17px] text-footer-text md:hidden"
      >
        {title}
        <ChevronDown className={`size-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      <ul className={`space-y-2.5 pb-4 md:block md:pb-0 ${open ? 'block' : 'hidden'}`}>
        {links.map((l) => (
          <li key={l.label}>
            <FooterLink link={l} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The app is not released yet: the store marks are shown as "coming soon", not as links. */
function AppComingSoon() {
  return (
    <div>
      <h3 className="font-serif text-[17px]">Pradeep App</h3>
      <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-gold-light/40 px-3 py-1 font-sans text-[10px] uppercase tracking-[0.22em] text-gold-light">
        <span aria-hidden="true">✦</span> Coming soon
      </p>
      <p className="mt-3 max-w-[220px] font-sans text-[13px] leading-relaxed text-footer-muted">Save pieces and chat with the showroom from your phone.</p>
      <ul className="mt-4 flex gap-2.5 opacity-60" aria-label="Coming soon to Google Play and the App Store">
        {[
          { icon: <PlayStoreIcon className="size-4" />, name: 'Google Play' },
          { icon: <AppleIcon className="size-4 text-footer-text" />, name: 'App Store' },
        ].map(({ icon, name }) => (
          <li key={name} className="flex items-center gap-1.5 whitespace-nowrap rounded-md bg-footer-raise px-2.5 py-1.5 font-sans text-[11px] text-footer-text">
            {icon}
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="px-3 pb-6 pt-4 md:px-[3%]" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Pradeep Jewellers footer
      </h2>
      <div className="footer-shell relative rounded-[10px] bg-footer text-footer-text">
        {/* Open-book notch at the top centre and lobes at the bottom */}
        <svg aria-hidden="true" viewBox="0 0 80 16" className="absolute -top-px left-1/2 h-4 w-20 -translate-x-1/2" preserveAspectRatio="none">
          <path d="M0 0h80c-14 0-22 1.5-28 6-5 3.8-8 7-12 10-4-3-7-6.2-12-10C22 1.5 14 0 0 0Z" fill="var(--color-bg)" />
        </svg>
        <svg aria-hidden="true" viewBox="0 0 100 14" className="absolute -bottom-[13px] left-1/2 h-[14px] w-24 -translate-x-1/2" preserveAspectRatio="none">
          <path d="M0 0h100C88 0 86 13 72 13 60 13 54 7 50 1 46 7 40 13 28 13 14 13 12 0 0 0Z" fill="var(--color-footer)" />
        </svg>

        <div className="mx-auto max-w-[1240px] px-6 pb-8 pt-10 md:px-10 lg:px-[5%] lg:pt-14">
          <div className="grid gap-y-8 md:grid-cols-2 md:gap-x-10 lg:grid-cols-[1.25fr_0.8fr_1fr_1.45fr_1fr]">
            {/* Brand */}
            <div>
              <Link to="/" aria-label="Pradeep Jewellers home" className="inline-block">
                <Logo tone="light" size="lg" tagline />
              </Link>
              <p className="mt-4 font-sans text-[11px] uppercase tracking-[0.18em] text-footer-muted">Since {business.since}</p>
              <p className="mt-1.5 font-sans text-[11px] uppercase tracking-[0.18em] text-footer-muted">{business.lines.join(' · ')}</p>
              <p className="mt-1.5 font-sans text-[11px] uppercase tracking-[0.18em] text-gold-light">{business.hallmark}</p>
              <ul className="mt-5 flex items-center gap-3">
                {socialLinks.map(({ id, label, href }) => {
                  const Icon = socialIcons[id];
                  return (
                    <li key={id}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Pradeep Jewellers on ${label}`}
                        className="inline-flex size-11 items-center justify-center rounded-full bg-footer-raise text-footer-text transition-colors hover:bg-footer-text hover:text-footer"
                      >
                        <Icon className="size-5" />
                      </a>
                    </li>
                  );
                })}
              </ul>
              <a
                href={googleReviewUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2.5 rounded-full bg-white py-2 pl-2.5 pr-4 font-sans text-[13px] font-medium text-ink transition-transform duration-300 hover:-translate-y-0.5"
              >
                <GoogleIcon className="size-5" />
                <span className="flex flex-col leading-tight">
                  <span className="text-[11px] tracking-[0.12em] text-gold" aria-hidden="true">
                    ★★★★★
                  </span>
                  Rate us on Google
                </span>
              </a>
            </div>

            {footerLinks.map((col) => (
              <LinkColumn key={col.title} {...col} />
            ))}

            {/* Contact */}
            <div>
              <h3 className="mb-4 font-serif text-[17px]">Contact Us</h3>
              <address className="not-italic">
                <a href={business.mapsUrl} target="_blank" rel="noopener noreferrer" className={`flex gap-2.5 leading-relaxed ${linkClass}`}>
                  <MapPin className="mt-0.5 size-4 shrink-0 text-gold-light" strokeWidth={1.4} aria-hidden="true" />
                  <span>{business.addressLine}</span>
                </a>
                <ul className="mt-3 space-y-2.5">
                  <li>
                    <a href={contact.whatsappLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2.5 ${linkClass}`}>
                      <WhatsappIcon className="size-4 text-gold-light" /> WhatsApp {contact.whatsapp}
                    </a>
                  </li>
                  <li className="flex gap-2.5">
                    <Phone className="mt-0.5 size-4 shrink-0 text-gold-light" strokeWidth={1.4} aria-hidden="true" />
                    <span className="flex flex-wrap gap-x-1.5 gap-y-1">
                      {phones.map((ph, i) => (
                        <a key={`${ph.tel}-${i}`} href={`tel:${ph.tel}`} className={linkClass}>
                          {ph.display}
                          {i < phones.length - 1 && ','}
                        </a>
                      ))}
                    </span>
                  </li>
                  {hours.length > 0 && (
                    <li className="flex gap-2.5">
                      <Clock className="mt-0.5 size-4 shrink-0 text-gold-light" strokeWidth={1.4} aria-hidden="true" />
                      <span className="space-y-0.5">
                        {hours.map((h) => (
                          <span key={`${h.days}${h.time}`} className="block">
                            {h.days}
                            {h.days && h.time && ': '}
                            {h.time}
                          </span>
                        ))}
                      </span>
                    </li>
                  )}
                </ul>
              </address>
            </div>

            <AppComingSoon />
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/15 pt-5 md:flex-row md:items-center md:justify-between">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-[12px] text-footer-text">
              <span>© {new Date().getFullYear()} Pradeep Jewellers. All Rights Reserved.</span>
              <span aria-hidden="true" className="max-md:hidden text-white/25">
                |
              </span>
              <span className="text-footer-muted">
                Powered by{' '}
                <a href="https://googlixlabs.com" target="_blank" rel="noopener" className="text-footer-text underline decoration-white/30 underline-offset-4 hover:text-white">
                  googlixlabs.com
                </a>
              </span>
            </p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {legalLinks.map((l) => (
                <li key={l}>
                  <Link to={`/info/${toSlug(l)}`} className="font-sans text-[11px] text-footer-muted hover:text-white">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
