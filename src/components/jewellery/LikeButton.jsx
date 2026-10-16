import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useJewellerySelection } from '../../context/StoreContext';

const SPARKS = [0, 60, 120, 180, 240, 300];

/**
 * Save / unsave a piece. variant: 'overlay' (on imagery), 'outline' (detail page), 'dark' (showroom).
 */
export default function LikeButton({ product, variant = 'overlay', className = '', withLabel = false }) {
  const { isSelected, toggleSelection } = useJewellerySelection();
  const saved = isSelected(product.id);
  const [burst, setBurst] = useState(0);

  const onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!saved) setBurst((b) => b + 1);
    toggleSelection(product.id);
  };

  const skins = {
    overlay: 'size-9 bg-white/92 text-primary shadow-[0_2px_10px_-4px_rgba(45,7,8,0.35)] hover:bg-white',
    outline: 'h-[52px] min-w-[52px] border border-primary/35 bg-white text-primary hover:border-primary',
    dark: 'size-9 border border-white/20 bg-white/5 text-gold-light hover:border-gold-light/60',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${product.name} from your selection` : `Save ${product.name} to your selection`}
      title={saved ? 'Saved to your selection' : 'Save to selection'}
      className={`like-btn inline-flex items-center justify-center gap-2 rounded-full transition-[background,border-color,box-shadow] duration-500 ${skins[variant]} ${withLabel ? 'px-5' : ''} ${saved ? 'is-saved' : ''} ${className}`}
    >
      <span className="relative inline-flex">
        <Heart className="like-icon size-[17px]" strokeWidth={1.5} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
        {burst > 0 && (
          <span key={burst} className="like-sparks" aria-hidden="true">
            {SPARKS.map((deg) => (
              <i key={deg} style={{ '--a': `${deg}deg` }} />
            ))}
          </span>
        )}
      </span>
      {withLabel && <span className="font-sans text-[13px] tracking-[0.06em]">{saved ? 'Saved to selection' : 'Save to selection'}</span>}
    </button>
  );
}
