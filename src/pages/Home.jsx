import Hero from '../components/home/Hero';
import HomeDiscovery from '../components/home/HomeDiscovery';
import NewArrivals from '../components/home/NewArrivals';
import Editorial from '../components/home/Editorial';
import Assurance from '../components/home/Assurance';
import Exchange from '../components/home/Exchange';
import Promotions from '../components/home/Promotions';

// The showroom-TV advertisement lives on its own page, /screen (pages/ScreenPage.jsx).
export default function Home() {
  return (
    <>
      <h1 className="sr-only">Pradeep Jewellers: timeless gold, diamond and fine jewellery</h1>
      <Hero />
      <HomeDiscovery />
      <NewArrivals />
      <Editorial />
      <Assurance />
      <Exchange />
      <Promotions />
    </>
  );
}
