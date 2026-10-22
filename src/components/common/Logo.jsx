import monogram from '../../assets/brand/pj-monogram.png';
import { business } from '../../data/footer';
import BrandNameHi from './BrandNameHi';

// "प्रदीप" is sized so it spans the same width as "JEWELLERS" under it, and
// the two lines together stand about as tall as the monogram beside them.
const SIZES = {
  sm: { mark: 'h-[58px]', hi: 'text-[30px]', en: 'text-[10.5px]', gap: 'gap-2' },
  md: { mark: 'h-[72px]', hi: 'text-[38px]', en: 'text-[13px]', gap: 'gap-2.5' },
  lg: { mark: 'h-[100px]', hi: 'text-[50px]', en: 'text-[16px]', gap: 'gap-3.5' },
};

/**
 * The Pradeep Jewellers lockup from the letterhead: the PJ monogram, "प्रदीप"
 * and "JEWELLERS". tone 'light' is for dark backgrounds; `tagline` adds
 * "आज से, सदा के लिए" under the name.
 */
export default function Logo({ tone = 'brand', size = 'md', tagline = false, className = '' }) {
  const s = SIZES[size];
  const light = tone === 'light';
  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <img src={monogram} alt="" aria-hidden="true" className={`${s.mark} w-auto shrink-0`} />
      <span className="flex flex-col items-center leading-none" aria-hidden="true">
        <BrandNameHi className={`font-hindi font-bold ${s.hi} leading-[0.98] ${light ? 'text-footer-text' : 'text-brand-maroon'}`} />
        <span className={`font-serif font-semibold uppercase tracking-[0.08em] ${s.en} ${light ? 'text-gold-light' : 'text-brand-green'}`}>Jewellers</span>
        {tagline && (
          <span lang="hi" className={`mt-1.5 font-hindi text-[13px] italic ${light ? 'text-gold-light' : 'text-brand-gold'}`}>
            {business.taglineHi}
          </span>
        )}
      </span>
      <span className="sr-only">{business.name}</span>
    </span>
  );
}
