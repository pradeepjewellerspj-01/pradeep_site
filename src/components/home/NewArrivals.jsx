import { Link } from 'react-router-dom';
import { Gem } from 'lucide-react';
import { newArrivals } from '../../data/collections';
import { useReveal } from '../../hooks/useReveal';

export default function NewArrivals() {
  const scope = useReveal();
  const { title, count, copy, band, cards } = newArrivals;

  return (
    <section ref={scope} className="section-y" aria-labelledby="arrivals-title">
      <div className="relative overflow-hidden bg-taupe">
        <img src={band} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[70%_50%] md:object-[right_45%]" />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_right,rgba(98,86,74,0.78)_0%,rgba(120,108,96,0.45)_45%,rgba(120,108,96,0.05)_75%)]" />
        <div className="container-x relative pb-28 pt-9 text-white md:pb-[150px] md:pt-12 lg:pb-[170px]" data-reveal>
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="arrivals-title" className="font-serif text-[28px] font-normal leading-tight md:text-[34px]" style={{ fontVariationSettings: "'opsz' 36" }}>
              {title}
            </h2>
            {count && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1.5 font-sans text-[11px] font-medium">
                <Gem className="size-3" aria-hidden="true" /> {count}
              </span>
            )}
          </div>
          <p className="mt-2 max-w-md font-serif text-[14px] leading-relaxed md:text-[15px]">
            {copy[0]}
            <br />
            {copy[1]}
          </p>
        </div>
      </div>

      <div className="container-x relative -mt-20 grid grid-cols-2 gap-3 md:-mt-[120px] md:gap-6 lg:-mt-[140px]" data-reveal-stagger>
        {cards.map((card) => (
          <Link key={card.title} to={card.href} className="group block rounded-card bg-white p-1.5 shadow-[0_10px_30px_-18px_rgba(45,7,8,0.4)] md:p-[7px]">
            <span className="media-zoom relative block aspect-[4/3] overflow-hidden rounded-[5px] md:aspect-[352/180]">
              <img src={card.image} alt={card.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.5),transparent_45%)]" />
              <span className="absolute bottom-3 left-3 font-serif text-[14px] text-white md:bottom-4 md:left-4 md:text-[17px]">{card.title}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
