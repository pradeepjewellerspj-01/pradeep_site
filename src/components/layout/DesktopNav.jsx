import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { primaryNav } from '../../data/navigation';
import { images } from '../../data/images';

const menuArt = { 'all-jewellery': images.world.wedding, gold: images.world.gold };

// Icon + label category bar. Entries with a `menu` open a compact panel on hover/focus.
export default function DesktopNav() {
  const [active, setActive] = useState(null);
  const closeTimer = useRef();
  const location = useLocation();

  useEffect(() => setActive(null), [location.pathname]);

  const openMenu = (item) => {
    window.clearTimeout(closeTimer.current);
    setActive(item.menu ? item.slug : null);
  };
  const scheduleClose = () => {
    closeTimer.current = window.setTimeout(() => setActive(null), 160);
  };

  const current = primaryNav.find((n) => n.slug === active && n.menu);

  return (
    <nav aria-label="Jewellery categories" className="relative" onMouseLeave={scheduleClose}>
      <ul className="container-wide flex items-center justify-center gap-x-[clamp(22px,3vw,52px)]">
        {primaryNav.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.slug;
          return (
            <li key={item.slug} onMouseEnter={() => openMenu(item)}>
              <Link
                to={`/category/${item.slug}`}
                onFocus={() => openMenu(item)}
                onKeyDown={(e) => e.key === 'Escape' && setActive(null)}
                aria-expanded={item.menu ? isActive : undefined}
                aria-haspopup={item.menu ? 'true' : undefined}
                className={`nav-link ${isActive ? 'is-active' : ''}`}
              >
                <Icon aria-hidden="true" className="nav-icon size-[14px]" strokeWidth={1.3} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div
        onMouseEnter={() => window.clearTimeout(closeTimer.current)}
        className={`absolute inset-x-0 top-full z-40 border-t border-border bg-white shadow-[0_24px_40px_-24px_rgba(45,7,8,0.25)] transition-[opacity,visibility,transform] duration-400 ${
          current ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'
        }`}
      >
        {current && (
          <div className="mx-auto flex w-fit max-w-[calc(100%-64px)] gap-14 py-8">
            {current.menu.map((group) => (
              <div key={group.title} className="min-w-[150px]">
                <p className="mb-3 font-sans text-[10px] uppercase tracking-[0.22em] text-gold-deep">{group.title}</p>
                <ul className={`grid gap-x-10 gap-y-2.5 ${group.links.length > 12 ? 'grid-cols-3' : group.links.length > 5 ? 'grid-cols-2' : ''}`}>
                  {group.links.map((l) => (
                    <li key={l.slug}>
                      <Link to={`/category/${l.slug}`} className="font-sans text-[13.5px] text-text transition-colors hover:text-primary">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <Link to={`/category/${current.slug}`} className="group relative block w-[240px] overflow-hidden rounded-card">
              <img src={menuArt[current.slug] ?? images.world.daily} alt="" className="h-36 w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-overlay/90 to-transparent px-4 pb-3 pt-10 font-serif text-[16px] text-white">
                {current.slug === 'all-jewellery' ? 'View all jewellery' : `View all ${current.label}`}
                <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={1.4} aria-hidden="true" />
              </span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
