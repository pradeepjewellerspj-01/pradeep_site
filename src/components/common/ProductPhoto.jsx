/**
 * A product photo filling its card, so every card in a grid looks the same
 * whatever the photo's shape (no empty bands). Photos uploaded through the
 * admin panel keep their watermark inside the centre square that stays
 * visible (PRODUCT_CARD_ASPECT in admin/api.js); the product page shows the
 * whole photo. `zoom` scales the photo on hover (inside a `group`).
 */
export default function ProductPhoto({ src, alt, className = '', zoom = false, ...imgProps }) {
  return (
    <div className={`relative overflow-hidden bg-surface ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-cover ${zoom ? 'transition-transform duration-[1100ms] ease-[var(--ease-lux)] group-hover:scale-105' : ''}`}
        {...imgProps}
      />
    </div>
  );
}
