import { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, A11y, Keyboard } from 'swiper/modules';
import 'swiper/css';
import LuxuryButton from '../common/LuxuryButton';
import { heroSlides } from '../../data/collections';
import { gsap, prefersReducedMotion, useGSAP } from '../../utils/gsap';

function SlideCopy({ slide }) {
  const dark = slide.tone === 'dark';
  return (
    <div
      className={`hero-copy absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-8 text-center md:inset-y-0 md:left-auto md:right-[6%] md:w-[40%] md:justify-center md:pb-0 ${
        dark ? 'text-white' : 'text-heading'
      }`}
    >
      <p className="hero-line font-serif text-sm tracking-[0.04em] md:text-base" style={{ fontVariationSettings: "'opsz' 40" }}>
        Pradeep Jewellers
      </p>
      <p className="hero-line t-eyebrow mt-1.5 opacity-85">{slide.eyebrow}</p>
      <h2 className="hero-line mt-3 font-serif text-[32px] font-light leading-none tracking-[0.01em] md:text-[clamp(34px,3.4vw,48px)]">{slide.title}</h2>
      <p className="hero-line t-script -mt-0.5 text-[44px] md:text-[clamp(46px,4.6vw,66px)]">{slide.script}</p>
      <p className="hero-line mt-3 font-display text-lg italic md:mt-5 md:text-[clamp(18px,1.5vw,22px)]">{slide.subtitle}</p>
      <div className="hero-line mt-4 md:mt-6">
        <LuxuryButton to={slide.href} variant="hero">
          {slide.cta}
        </LuxuryButton>
      </div>
    </div>
  );
}

export default function Hero() {
  const [active, setActive] = useState(0);
  const swiperRef = useRef(null);
  const scope = useRef(null);

  // Page-load entrance: the banner settles in, then the copy lines rise.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('.hero-frame', { opacity: 0, y: 18, duration: 1.4, ease: 'power3.out' });
    },
    { scope },
  );

  const animateCopy = (swiper) => {
    setActive(swiper.realIndex);
    if (prefersReducedMotion()) return;
    const lines = swiper.slides[swiper.activeIndex]?.querySelectorAll('.hero-line');
    if (lines?.length) gsap.fromTo(lines, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, delay: 0.15, overwrite: true });
  };

  return (
    <section aria-roledescription="carousel" aria-label="Featured collections" ref={scope} className="overflow-hidden pt-8 lg:pt-12">
      <div className="hero-frame">
        <Swiper
          className="hero-swiper"
          modules={[Autoplay, A11y, Keyboard]}
          loop
          centeredSlides
          slidesPerView={1.08}
          spaceBetween={10}
          speed={900}
          keyboard={{ enabled: true }}
          autoplay={{ delay: 5200, disableOnInteraction: false, pauseOnMouseEnter: true }}
          breakpoints={{
            768: { slidesPerView: 1.18, spaceBetween: 18 },
            1024: { slidesPerView: 1.27, spaceBetween: 26 },
          }}
          onSwiper={(s) => {
            swiperRef.current = s;
            animateCopy(s);
          }}
          onSlideChangeTransitionStart={animateCopy}
          a11y={{ prevSlideMessage: 'Previous banner', nextSlideMessage: 'Next banner' }}
        >
          {heroSlides.map((slide, i) => (
            <SwiperSlide key={slide.id}>
              {({ isActive }) => (
                <article className={`relative aspect-[4/5] overflow-hidden rounded-card transition-opacity duration-700 sm:aspect-[16/10] md:aspect-[2.5/1] ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  <img
                    src={slide.image}
                    alt={slide.alt}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    fetchPriority={i === 0 ? 'high' : 'auto'}
                    className="absolute inset-0 h-full w-full object-cover object-[var(--pos-phone)] sm:object-[var(--pos)]"
                    style={{ '--pos': slide.position, '--pos-phone': slide.mobilePosition ?? slide.position }}
                  />
                  <div
                    aria-hidden="true"
                    className={`absolute inset-0 ${
                      slide.tone === 'dark'
                        ? 'bg-[linear-gradient(to_top,rgba(20,8,6,0.75),transparent_60%)] md:bg-[linear-gradient(to_left,rgba(20,8,6,0.62)_0%,rgba(20,8,6,0.25)_45%,transparent_70%)]'
                        : 'bg-[linear-gradient(to_top,rgba(255,250,246,0.92),transparent_62%)] md:bg-[linear-gradient(to_left,rgba(255,250,246,0.88)_0%,rgba(255,250,246,0.45)_42%,transparent_68%)]'
                    }`}
                  />
                  <SlideCopy slide={slide} />
                </article>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="diamond-dots mt-5" role="tablist" aria-label="Choose banner">
        {heroSlides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-label={`Show banner ${i + 1}: ${s.title} ${s.script}`}
            aria-current={active === i}
            aria-selected={active === i}
            onClick={() => swiperRef.current?.slideToLoop(i)}
          />
        ))}
      </div>
    </section>
  );
}
