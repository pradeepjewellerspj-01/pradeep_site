import { useSyncExternalStore } from 'react';

const subscribeMedia = (query) => (cb) => {
  const list = window.matchMedia(query);
  list.addEventListener('change', cb);
  return () => list.removeEventListener('change', cb);
};
const matches = (query) => () => typeof window !== 'undefined' && window.matchMedia(query).matches;

const REDUCED = '(prefers-reduced-motion: reduce)';
const subscribeReduced = subscribeMedia(REDUCED);

/** True when the visitor asks for reduced motion; follows changes live. */
export const useReducedMotion = () => useSyncExternalStore(subscribeReduced, matches(REDUCED), () => false);
