import { HOME_SECTIONS } from '../content/schema';

// Which home page sections are shown (all, until the admin panel switches some off).
export const homeSections = Object.fromEntries(HOME_SECTIONS.map(({ id }) => [id, true]));

/** Applies the switches saved in the admin panel (missing ones stay on). */
export function applyHomeSections(saved) {
  for (const { id } of HOME_SECTIONS) homeSections[id] = saved?.[id] !== false;
}
