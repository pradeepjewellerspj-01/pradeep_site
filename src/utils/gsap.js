import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);
// Phones resize the window as their address bar slides in and out while scrolling:
// re-measuring every trigger then makes the page jump. Real rotations still refresh.
ScrollTrigger.config({ ignoreMobileResize: true });

// One slow, soft ease for the whole site.
gsap.defaults({ ease: 'power2.out', duration: 1 });

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export { gsap, ScrollTrigger, useGSAP };
