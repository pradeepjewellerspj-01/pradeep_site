// Customer reviews shown on /reviews, added in the admin panel (Reviews tab).
// None are bundled: the page only ever shows what real customers wrote.
export const reviews = [];

/** Applies the reviews saved in the admin panel, newest first. */
export function applyReviews(list) {
  const next = (list ?? []).map((r) => ({ ...r })).sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  reviews.splice(0, reviews.length, ...next);
}

export const averageRating = () => (reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0);
