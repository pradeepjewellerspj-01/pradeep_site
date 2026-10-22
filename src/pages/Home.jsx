import Hero from '../components/home/Hero';
import HomeDiscovery from '../components/home/HomeDiscovery';
import NewArrivals from '../components/home/NewArrivals';
import Editorial from '../components/home/Editorial';
import Assurance from '../components/home/Assurance';
import Exchange from '../components/home/Exchange';
import Promotions from '../components/home/Promotions';
import { homeSections } from '../data/home';
import { useContentVersion } from '../content/useContentVersion';

// The showroom-TV advertisement lives on its own page, /screen (pages/ScreenPage.jsx).
// Each section can be switched off in the admin panel (Home page tab).
export default function Home() {
  useContentVersion(); // switches changed in the admin panel arrive live
  const on = homeSections;
  return (
    <>
      <h1 className="sr-only">Pradeep Jewellers: timeless gold, diamond and fine jewellery</h1>
      {on.hero && <Hero />}
      {on.discovery && <HomeDiscovery />}
      {on.arrivals && <NewArrivals />}
      {on.styling && <Editorial />}
      {on.assurance && <Assurance />}
      {on.exchange && <Exchange />}
      {on.promotions && <Promotions />}
    </>
  );
}
