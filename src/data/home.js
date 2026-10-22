import { HOME_SECTIONS } from '../content/schema';

// Which home page sections are shown: each section's default until the admin panel saves its own.
export const homeSections = Object.fromEntries(HOME_SECTIONS.map(({ id, on }) => [id, on]));

/** Applies the switches saved in the admin panel (missing ones keep their default). */
export function applyHomeSections(saved) {
  for (const { id, on } of HOME_SECTIONS) homeSections[id] = typeof saved?.[id] === 'boolean' ? saved[id] : on;
}
