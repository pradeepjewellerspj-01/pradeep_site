import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Gem } from 'lucide-react';
import { images } from '../../data/images';

const categories = [
  { label: 'Rings', href: '/category/rings', image: images.categories.rings },
  { label: 'Earrings', href: '/category/earrings', image: images.categories.earrings },
  { label: 'Bangles', href: '/category/bangles', image: images.categories.bangles },
  { label: 'Bracelets', href: '/category/bracelets', image: images.categories.bracelets },
];

const collections = [
  { label: 'Gold', subtitle: 'Timeless classics', href: '/category/gold', image: images.world.gold, tone: 'gold' },
  { label: 'Diamond', subtitle: 'A little extra brilliance', href: '/category/diamond', image: images.world.diamond, tone: 'diamond' },
  { label: 'Bridal', subtitle: 'For your forever day', href: '/category/wedding', image: images.world.wedding, tone: 'bridal' },
  { label: 'Silver', subtitle: 'Thoughtful gifts & keepsakes', href: '/category/silver', image: images.arrivals.silver, tone: 'silver' },
];

function CategoryCircle({ item }) {
  return (
    <Link to={item.href} className="group flex min-w-0 flex-col items-center text-center">
      <span className="relative block size-[76px] overflow-hidden rounded-full border border-[#c8a66d] bg-[#f7f0e8] p-1 shadow-[0_5px_18px_rgba(90,57,25,.08)] transition duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_10px_24px_rgba(90,57,25,.16)] sm:size-[96px] md:size-[108px]">
        <img src={item.image} alt="" loading="lazy" decoding="async" className="size-full rounded-full object-cover transition-transform duration-700 group-hover:scale-110" />
      </span>
      <span className="mt-2.5 font-serif text-sm text-[#3d2921] sm:mt-3 sm:text-base">{item.label}</span>
      <span className="mt-2 h-[2px] w-5 bg-[#b8944e] transition-all duration-300 group-hover:w-9" />
    </Link>
  );
}

function CollectionCard({ item }) {
  return (
    <Link to={item.href} className={`pj-discovery-card pj-discovery-${item.tone} group relative isolate flex min-h-[150px] flex-col items-center justify-center overflow-hidden border border-[#d9c6a4] px-3 py-5 text-center transition duration-500 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(68,42,22,.15)] sm:min-h-[190px] md:min-h-[210px]`}>
      <img src={item.image} alt="" loading="lazy" decoding="async" className="absolute inset-0 -z-20 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-[#24150f]/85 via-[#24150f]/35 to-[#24150f]/10" />
      <Gem aria-hidden="true" className="mb-2.5 size-6 text-[#f1d49a] sm:mb-3 sm:size-8" strokeWidth={1.25} />
      <span className="font-serif text-xl text-white sm:text-2xl">{item.label}</span>
      <span className="mt-1.5 text-[9px] uppercase tracking-[.16em] text-white/85 sm:text-[10px] sm:tracking-[.2em]">{item.subtitle}</span>
      <span className="mt-3 inline-flex size-7 items-center justify-center rounded-full border border-white/55 text-white transition group-hover:bg-white group-hover:text-[#3d2921]"><ArrowUpRight size={15} /></span>
    </Link>
  );
}

export default function HomeDiscovery() {
  return (
    <section className="container-wide pb-10 pt-7 sm:pb-14 sm:pt-9 md:pt-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex items-center justify-center gap-3 text-center sm:mb-7">
          <span className="h-px w-7 bg-[#c8a86a] sm:w-14" />
          <div>
            <p className="text-[9px] uppercase tracking-[.22em] text-[#9b7945] sm:text-[10px] sm:tracking-[.26em]">Find your signature style</p>
            <h2 className="mt-1 font-serif text-2xl font-normal text-[#38251e] sm:text-3xl">Shop by Category</h2>
          </div>
          <span className="h-px w-7 bg-[#c8a86a] sm:w-14" />
        </div>
        <div className="grid grid-cols-4 gap-2 sm:gap-5 md:gap-8">
          {categories.map((item) => <CategoryCircle key={item.label} item={item} />)}
        </div>
      </div>

      <div className="mx-auto mt-9 max-w-6xl sm:mt-12 md:mt-14">
        <div className="mb-4 flex items-end justify-between gap-3 sm:mb-6">
          <div>
            <p className="text-[9px] uppercase tracking-[.22em] text-[#9b7945] sm:text-[10px] sm:tracking-[.26em]">Made for every moment</p>
            <h2 className="mt-1 font-serif text-2xl font-normal text-[#38251e] sm:text-3xl">Explore Our World</h2>
          </div>
          <Link to="/search" className="mb-1 inline-flex shrink-0 items-center gap-1 text-xs text-[#78572e] transition hover:gap-2 sm:text-sm">View all <ArrowUpRight size={15} /></Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {collections.map((item) => <CollectionCard key={item.label} item={item} />)}
        </div>
        <Link to="/search" className="mx-auto mt-7 flex w-fit flex-col items-center gap-2 text-[#856638] transition hover:text-[#4c3024] sm:mt-9">
          <span className="flex items-center gap-3 text-[10px] font-medium uppercase tracking-[.25em] sm:text-[11px] sm:tracking-[.3em]"><span className="h-px w-8 bg-[#d7c4a0] sm:w-16" />More to explore<span className="h-px w-8 bg-[#d7c4a0] sm:w-16" /></span>
          <ArrowDown size={19} strokeWidth={1.4} />
        </Link>
      </div>
    </section>
  );
}
