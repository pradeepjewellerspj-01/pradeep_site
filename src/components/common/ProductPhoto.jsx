/**
 * A product photo shown whole, never cropped, so the "© PRADEEP JEWELLERS"
 * watermark at its edge is always fully visible, whatever the photo's shape
 * (square, landscape, portrait). A blurred copy of the same photo fills the
 * rest of the frame. `zoom` scales only that backdrop on hover (inside a
 * `group`), so the photo itself is never trimmed.
 */
export default function ProductPhoto({ src, alt, className = '', zoom = false, ...imgProps }) {
  return (
    <div className={`relative overflow-hidden bg-surface ${className}`}>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        decoding="async"
        className={`absolute inset-0 h-full w-full scale-110 object-cover opacity-80 blur-2xl ${zoom ? 'transition-transform duration-[1100ms] ease-[var(--ease-lux)] group-hover:scale-125' : ''}`}
        {...(imgProps.loading ? { loading: imgProps.loading } : {})}
      />
      <img src={src} alt={alt} className="relative h-full w-full object-contain" {...imgProps} />
    </div>
  );
}
