import GoldIcon from '../common/GoldIcon';
import { assurance } from '../../data/editorial';
import { useReveal } from '../../hooks/useReveal';

export default function Assurance() {
  const scope = useReveal();
  const [first, second] = assurance.title;
  return (
    <section ref={scope} className="mt-14 border-t border-border lg:mt-20" aria-labelledby="assurance-title">
      <div className="mx-auto grid max-w-[1440px] md:grid-cols-2">
        <div className="flex flex-col items-center justify-center px-6 py-10 text-center md:py-16 lg:py-24" data-reveal>
          <h2 id="assurance-title" className="t-display text-ink">
            {first} <span className="text-primary">{second}</span>
          </h2>
          <p className="t-subtitle mt-3 md:mt-5">{assurance.subtitle}</p>
        </div>
        <ul className="grid grid-cols-3 items-start gap-2 border-t border-border px-4 py-10 md:border-l md:border-t-0 md:px-8 md:py-16 lg:px-14 lg:py-24" data-reveal-stagger>
          {assurance.items.map((item) => (
            <li key={item.icon} className="flex flex-col items-center text-center">
              <GoldIcon name={item.icon} className="size-11 md:size-14" />
              <p className="mt-3 font-serif text-[13px] leading-tight text-heading md:mt-4 md:text-[15px]">
                {item.label[0]}
                <br />
                {item.label[1]}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
