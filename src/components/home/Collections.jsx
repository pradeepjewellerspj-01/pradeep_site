import { Link } from 'react-router-dom';
import SectionHeading from '../common/SectionHeading';
import { featuredCollections } from '../../data/collections';
import { useReveal } from '../../hooks/useReveal';

function Tile({ item, className, children, position = '50% 50%' }) {
  return (
    <Link to={item.href} className={`media-zoom group relative block rounded-card ${className}`} data-reveal-media aria-label={`${item.title}${item.script ? ` ${item.script}` : ''}`}>
      <img src={item.image} alt={item.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: position }} />
      {children}
    </Link>
  );
}

export default function Collections() {
  const scope = useReveal();
  const { feature, stacked } = featuredCollections;
  const [ear, coins] = stacked;

  return (
    <section ref={scope} className="section-y container-x" aria-labelledby="collections-title">
      <SectionHeading id="collections-title" title="Pradeep Collections" subtitle="Explore our newly launched collection" />

      <div className="mt-7 grid grid-cols-2 gap-1.5 lg:mt-10 lg:aspect-[1134/670] lg:grid-rows-2">
        <Tile item={feature} className="col-span-2 aspect-[4/5] sm:aspect-[16/11] lg:col-span-1 lg:row-span-2 lg:aspect-auto" position="50% 45%">
          <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,10,6,0.55),transparent_45%)]" />
          <span className="t-overlay absolute inset-x-0 bottom-[9%] text-center text-[54px] md:text-[clamp(56px,5.6vw,80px)]">{feature.title}</span>
        </Tile>

        <Tile item={ear} className="aspect-square sm:aspect-[16/10] lg:aspect-auto" position="35% 50%">
          <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_left,rgba(250,240,230,0.85),transparent_65%)]" />
          <span className="absolute right-[6%] top-1/2 -translate-y-1/2 text-right text-primary">
            <span className="block font-serif text-[22px] font-light leading-none md:text-[clamp(26px,2.6vw,38px)]">{ear.title}</span>
            <span className="t-script block text-[30px] md:text-[clamp(36px,3.6vw,54px)]">{ear.script}</span>
          </span>
        </Tile>

        <Tile item={coins} className="aspect-square sm:aspect-[16/10] lg:aspect-auto" position="0% 60%">
          <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_left,rgba(10,8,6,0.92)_0%,rgba(10,8,6,0.7)_32%,transparent_62%)]" />
          <span className="t-overlay absolute bottom-[8%] right-[6%] text-[34px] sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 md:text-[clamp(40px,4vw,60px)]">{coins.title}</span>
        </Tile>
      </div>
    </section>
  );
}
