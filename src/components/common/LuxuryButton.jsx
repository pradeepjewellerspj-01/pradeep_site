import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const variants = {
  // Outlined pill with chevron ("Explore Now >", "Know more >")
  outline: 'border border-primary/45 bg-white text-ink hover:border-primary hover:bg-primary hover:text-white',
  gold: 'border border-champagne bg-cream text-ink hover:border-gold hover:bg-gold hover:text-white',
  // Solid white pill on photography ("Explore Now" on the exchange banner)
  light: 'border border-white bg-white text-ink hover:bg-ink hover:border-ink hover:text-white',
  // Rectangular hero CTA ("SHOP NOW")
  hero: 'rounded-[2px] bg-hero-btn text-heading uppercase tracking-[0.06em] text-[13px] hover:bg-white',
};

export default function LuxuryButton({ to, onClick, children, variant = 'outline', chevron = true, className = '', ...rest }) {
  const shape = variant === 'hero' ? 'px-6 py-2.5' : 'rounded-full px-5 py-2.5 md:px-6 md:py-3';
  const classes = `group inline-flex items-center gap-3 font-serif text-[15px] transition-colors duration-500 ${shape} ${variants[variant]} ${className}`;
  const content = (
    <>
      <span>{children}</span>
      {chevron && variant !== 'hero' && (
        <ChevronRight aria-hidden="true" className="size-4 transition-transform duration-500 group-hover:translate-x-0.5" strokeWidth={1.6} />
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes} {...rest}>
      {content}
    </button>
  );
}
