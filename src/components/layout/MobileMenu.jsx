import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Coins, Heart, Phone, X } from 'lucide-react';
import Drawer from '../overlays/Drawer';
import Logo from '../common/Logo';
import { GoogleIcon, WhatsappIcon } from '../common/BrandIcons';
import { primaryNav } from '../../data/navigation';
import { contact, googleReviewUrl } from '../../data/footer';
import { useJewellerySelection, useStore } from '../../context/StoreContext';
import { whatsAppUrl, buildWhatsAppMessage } from '../../services/whatsapp';
import { formatRate, useMarketPrices } from '../../market/useMarketPrices';

export default function MobileMenu() {
  const { panel, closePanel, openPanel } = useStore();
  const { count } = useJewellerySelection();
  const gold24 = useMarketPrices().get('gold24');
  const [expanded, setExpanded] = useState(null);
  const open = panel === 'menu';

  const go = () => closePanel();

  return (
    <Drawer open={open} onClose={closePanel} side="left" widthClass="w-[min(380px,88vw)]" labelledBy="mobile-menu-title">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h2 id="mobile-menu-title" className="sr-only">
          Menu
        </h2>
        <Link to="/" onClick={go} aria-label="Pradeep Jewellers home">
          <Logo size="sm" />
        </Link>
        <button type="button" onClick={closePanel} aria-label="Close menu" className="rounded-full p-2 hover:bg-blush">
          <X className="size-5" strokeWidth={1.5} />
        </button>
      </div>

      <nav aria-label="Mobile categories" className="px-5 py-2">
        <ul className="divide-y divide-border">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isOpen = expanded === item.slug;
            return (
              <li key={item.slug}>
                <div className="flex items-center">
                  <Link to={`/category/${item.slug}`} onClick={go} className="flex flex-1 items-center gap-3 py-3.5 font-sans text-[15px] text-ink">
                    <Icon aria-hidden="true" className="size-[18px] text-primary" strokeWidth={1.4} />
                    {item.label}
                  </Link>
                  {item.menu && (
                    <button
                      type="button"
                      aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${item.label}`}
                      aria-expanded={isOpen}
                      onClick={() => setExpanded(isOpen ? null : item.slug)}
                      className="rounded-full p-2.5 text-muted hover:bg-blush"
                    >
                      <ChevronDown className={`size-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
                {item.menu && (
                  <div className={`grid transition-[grid-template-rows] duration-500 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                      {item.menu.map((group) => (
                        <div key={group.title} className="pb-3 pl-8">
                          <p className="t-eyebrow mb-1.5 text-primary">{group.title}</p>
                          <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                            {group.links.map((l) => (
                              <li key={l.slug}>
                                <Link to={`/category/${l.slug}`} onClick={go} tabIndex={isOpen ? 0 : -1} className="font-sans text-[13px] text-text hover:text-primary">
                                  {l.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <Link to="/gold-rate" onClick={go} className="mx-5 mt-2 flex items-center justify-between gap-3 rounded-card bg-stage px-4 py-3.5 text-ivory">
        <span className="flex items-center gap-2.5 font-sans text-[13px]">
          <Coins className="size-4 text-champagne-soft" strokeWidth={1.5} aria-hidden="true" />
          Gold rate today
        </span>
        <span className="flex items-center gap-1.5 font-sans text-[12px] tabular-nums text-champagne-soft">
          {gold24 ? `24K ${formatRate(gold24.price)} / 10 gm` : 'See rates'}
          <ChevronRight className="size-3.5" aria-hidden="true" />
        </span>
      </Link>

      <div className="mx-5 mb-6 mt-2 grid grid-cols-2 gap-2">
        {[
          { label: `My Selection (${count})`, icon: Heart, action: () => openPanel('selection') },
          { label: 'WhatsApp us', icon: WhatsappIcon, action: () => window.open(whatsAppUrl(buildWhatsAppMessage([])), '_blank', 'noopener') },
        ].map(({ label, icon: Icon, action }) => (
          <button
            key={label}
            type="button"
            onClick={action}
            className="flex items-center gap-2 rounded-card border border-border px-3 py-3 text-left font-sans text-[13px] text-ink hover:border-primary hover:text-primary"
          >
            <Icon className="size-4 text-primary" strokeWidth={1.5} aria-hidden="true" />
            {label}
          </button>
        ))}
        {/* The same "Rate us on Google" button as in the footer. */}
        <a
          href={googleReviewUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="col-span-2 inline-flex items-center gap-2.5 rounded-full border border-border bg-white py-2 pl-2.5 pr-4 font-sans text-[13px] font-medium text-ink shadow-sm transition-colors hover:border-primary"
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

      <a href={`tel:${contact.phoneTel}`} className="mx-5 mb-8 flex items-center gap-2 font-sans text-[13px] text-muted">
        <Phone className="size-4" strokeWidth={1.5} aria-hidden="true" /> Showroom {contact.phone}
      </a>
    </Drawer>
  );
}
