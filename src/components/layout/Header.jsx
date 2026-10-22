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
  const bar = useRef(null);
  const [barHeight, setBarHeight] = useState(0);

  // Sticky header: the category bar tucks away while scrolling down and
  // returns on scroll up. Small movements (a trackpad's jitter, a phone's
  // bounce) are ignored so it never flickers.
  useEffect(() => {
    const onScroll = () => {
      const y = Math.max(0, window.scrollY);
      setScrolled(y > 8);
      const delta = y - lastY.current;
      if (y <= 220) setNavHidden(false);
      else if (Math.abs(delta) > 6) setNavHidden(delta > 0);
      else return; // keep lastY until the movement is clear
      lastY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // The category bar slides behind the header instead of collapsing, so the
  // header's height (and the page under it) never moves while scrolling. A
  // spacer after the header keeps the page clear of the bar at the top.
  useEffect(() => {
    const el = bar.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(() => setBarHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <header className={`sticky top-0 z-50 bg-white transition-shadow duration-500 ${scrolled ? 'shadow-[0_1px_0_var(--color-border),0_8px_24px_-18px_rgba(45,7,8,0.35)]' : 'shadow-[0_1px_0_var(--color-border)]'}`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
          Skip to content
        </a>

        <TopBar />

        {/* Above the category bar, full width, so the bar slides out of sight behind it. */}
        <div className="relative z-10 bg-white">
          <div className="container-wide grid h-[76px] grid-cols-[auto_1fr_auto] items-center gap-2 sm:h-[88px] sm:gap-4 lg:h-[96px] lg:grid-cols-[1fr_minmax(0,560px)_1fr] lg:gap-10">
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
        </div>

        {/* Category bar (desktop): hangs under the header and slides up behind it. */}
        <div
          ref={bar}
          inert={navHidden}
          className={`absolute inset-x-0 top-full hidden bg-white shadow-[0_1px_0_var(--color-border)] transition-[translate,opacity] duration-500 ease-[var(--ease-lux)] lg:block ${
            navHidden ? 'pointer-events-none -translate-y-full opacity-0' : 'translate-y-0 opacity-100'
          }`}
        >
          <DesktopNav />
        </div>
      </header>
      <div aria-hidden="true" className="hidden lg:block" style={{ height: barHeight }} />
    </>
  );
}
