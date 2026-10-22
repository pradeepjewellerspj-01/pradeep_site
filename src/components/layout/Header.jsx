import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Menu, Search } from 'lucide-react';
import Logo from '../common/Logo';
import IconButton from '../common/IconButton';
import SearchBox from './SearchBox';
import DesktopNav from './DesktopNav';
import TopBar from './TopBar';
import { useJewellerySelection, useStore } from '../../context/StoreContext';

function SelectionButton() {
  const { count, openSelection } = useJewellerySelection();
  const label = `My selection, ${count} ${count === 1 ? 'piece' : 'pieces'}`;
  // The count pops only when it changes, not on every page load.
  const [changed, setChanged] = useState(false);
  const prev = useRef(count);
  useEffect(() => {
    if (prev.current === count) return;
    prev.current = count;
    setChanged(true);
  }, [count]);
  const bump = changed ? 'motion-safe:animate-[toast-in_0.4s_var(--ease-lux)]' : '';
  return (
    <>
      <IconButton label={label} onClick={openSelection} badge={count} className="lg:hidden">
        <Heart className="size-[19px]" strokeWidth={1.4} />
      </IconButton>
      <button type="button" onClick={openSelection} aria-label={label} className="header-selection group hidden lg:inline-flex">
        <Heart className="selection-heart size-[14px] text-champagne-soft" strokeWidth={1.5} fill={count ? 'currentColor' : 'none'} aria-hidden="true" />
        My selection
        <span key={count} className={`header-selection-count tabular-nums ${bump}`}>
          {count}
        </span>
      </button>
    </>
  );
}

export default function Header() {
  const { openPanel } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const lastY = useRef(0);

  // Sticky header: the category bar tucks away while scrolling down and
  // returns on scroll up.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      setNavHidden(y > 220 && y > lastY.current);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 bg-white transition-shadow duration-500 ${scrolled ? 'shadow-[0_1px_0_var(--color-border),0_8px_24px_-18px_rgba(45,7,8,0.35)]' : 'shadow-[0_1px_0_var(--color-border)]'}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>

      <TopBar />

      <div className="container-wide grid h-[68px] grid-cols-[auto_1fr_auto] items-center gap-2 sm:h-[76px] sm:gap-4 lg:h-[84px] lg:grid-cols-[1fr_minmax(0,560px)_1fr] lg:gap-10">
        <div className="flex items-center gap-1">
          <IconButton label="Open menu" onClick={() => openPanel('menu')} className="-ml-2 lg:hidden">
            <Menu className="size-[22px]" strokeWidth={1.4} />
          </IconButton>
          <Link to="/" aria-label="Pradeep Jewellers home" className="shrink-0">
            <span className="sm:hidden">
              <Logo size="sm" />
            </span>
            <span className="hidden sm:block">
              <Logo size="md" />
            </span>
          </Link>
        </div>

        <div className="hidden w-full lg:block">
          <SearchBox />
        </div>

        <div className="flex items-center justify-end gap-0.5 lg:gap-2">
          <IconButton label="Search" onClick={() => openPanel('search')} className="lg:hidden">
            <Search className="size-[19px]" strokeWidth={1.4} />
          </IconButton>
          <SelectionButton />
        </div>
      </div>

      {/* Category bar (desktop) */}
      <div className={`hidden overflow-visible transition-[max-height,opacity] duration-500 lg:block ${navHidden ? 'pointer-events-none max-h-0 opacity-0' : 'max-h-16 opacity-100'}`}>
        <DesktopNav />
      </div>
    </header>
  );
}
