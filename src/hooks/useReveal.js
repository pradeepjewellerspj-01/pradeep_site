import { useRef } from 'react';
import { gsap, prefersReducedMotion, useGSAP } from '../utils/gsap';

/**
 * Scroll reveals scoped to one section.
 *  [data-reveal]          – fades up 24px
 *  [data-reveal-stagger]  – direct children fade up in sequence
 *  [data-reveal-media]    – image settles from a 1.06 scale while its frame fades in
 */
export function useReveal() {
  const scope = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const root = scope.current;
      if (!root) return;

      root.querySelectorAll('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 24,
          opacity: 0,
          duration: 1.1,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });

      root.querySelectorAll('[data-reveal-stagger]').forEach((group) => {
        gsap.from(group.children, {
          y: 32,
          opacity: 0,
          duration: 1.1,
          stagger: 0.12,
          scrollTrigger: { trigger: group, start: 'top 85%', once: true },
        });
      });

      root.querySelectorAll('[data-reveal-media]').forEach((frame) => {
        const img = frame.querySelector('img');
        const tl = gsap.timeline({ scrollTrigger: { trigger: frame, start: 'top 88%', once: true } });
        tl.from(frame, { opacity: 0, duration: 1.2 });
        if (img) tl.from(img, { scale: 1.06, duration: 1.8, ease: 'power3.out', clearProps: 'transform' }, 0);
      });
    },
    { scope },
  );

  return scope;
}
