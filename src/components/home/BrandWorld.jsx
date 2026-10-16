import { Link } from 'react-router-dom';
import SectionHeading from '../common/SectionHeading';
import { world } from '../../data/collections';
import { useReveal } from '../../hooks/useReveal';

function WorldCard({ item }) {
  return (
    <Link
      to={item.href}
      className={`media-zoom group relative block rounded-card ${item.tall ? 'aspect-[532/380]' : 'aspect-[532/340]'}`}
      data-reveal-media
    >
      <img src={item.image} alt={item.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full rounded-card object-cover" style={{ objectPosition: item.position }} />
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-card bg-[linear-gradient(to_top,var(--color-overlay)_0%,color-mix(in_srgb,var(--color-overlay)_70%,transparent)_14%,transparent_42%)] transition-opacity duration-700 group-hover:opacity-90"
      />
      <span className="absolute inset-x-0 bottom-[7%] text-center font-serif text-[22px] font-medium text-white md:text-[26px]" style={{ fontVariationSettings: "'opsz' 30" }}>
        {item.title}
      </span>
    </Link>
  );
}

export default function BrandWorld() {
  const scope = useReveal();
  const columns = [world.filter((w) => w.column === 0), world.filter((w) => w.column === 1)];
  return (
    <section ref={scope} className="section-y" aria-labelledby="world-title">
      <SectionHeading id="world-title" title="Pradeep Jewellers World" subtitle="A companion for every occasion" />
      <div className="container-narrow mt-7 grid gap-1.5 sm:grid-cols-2 md:mt-10 md:gap-[7px]">
        {columns.map((col, i) => (
          <div key={i} className="flex flex-col gap-1.5 md:gap-[7px]">
            {col.map((item) => (
              <WorldCard key={item.title} item={item} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
