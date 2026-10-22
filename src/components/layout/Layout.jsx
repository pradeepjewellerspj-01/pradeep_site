import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import PromoStrip from './PromoStrip';
import MobileMenu from './MobileMenu';
import FloatingUI from './FloatingUI';
import SearchSheet from '../overlays/SearchSheet';
import SelectionDrawer from '../jewellery/SelectionDrawer';
import ServiceModal from '../overlays/ServiceModal';
import Toast from '../overlays/Toast';
import { useStore } from '../../context/StoreContext';
import { ScrollTrigger } from '../../utils/gsap';
import { useScreenshotGuard } from '../../hooks/useScreenshotGuard';

function RouteEffects() {
  const { pathname, search, hash } = useLocation();
  const { closePanel } = useStore();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    closePanel();
    // New page content changes layout; let ScrollTrigger re-measure.
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search]);

  // In-page anchors (/#id), once the ScrollTrigger refresh above has run.
  useEffect(() => {
    if (!hash) return undefined;
    const id = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 420);
    return () => window.clearTimeout(id);
  }, [pathname, hash]);
  return null;
}

export default function Layout() {
  useScreenshotGuard();
  return (
    <>
      <RouteEffects />
      <Header />
      <PromoStrip />
      <main id="main" tabIndex={-1} className="outline-none">
        <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <MobileMenu />
      <SearchSheet />
      <SelectionDrawer />
      <ServiceModal />
      <FloatingUI />
      <Toast />
    </>
  );
}
