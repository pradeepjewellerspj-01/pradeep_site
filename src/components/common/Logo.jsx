import monogram from '../../assets/brand/pj-monogram.png';
import { business } from '../../data/footer';
import BrandNameHi from './BrandNameHi';

const SIZES = {
  sm: { mark: 'h-10', hi: 'text-[19px]', en: 'text-[8.5px]', gap: 'gap-2' },
  md: { mark: 'h-12', hi: 'text-[24px]', en: 'text-[10px]', gap: 'gap-2.5' },
  lg: { mark: 'h-[72px]', hi: 'text-[34px]', en: 'text-[13px]', gap: 'gap-3.5' },
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
      <span className="flex flex-col items-start leading-none" aria-hidden="true">
        <BrandNameHi tone={light ? 'light' : 'brand'} className={`font-hindi font-bold ${s.hi} leading-[1.05] ${light ? 'text-footer-text' : 'text-primary'}`} />
        <span className={`mt-[2px] font-serif font-semibold uppercase tracking-[0.08em] ${s.en} ${light ? 'text-gold-light' : 'text-brand-green'}`}>Jewellers</span>
        {tagline && (
          <span lang="hi" className={`mt-1.5 font-hindi text-[13px] ${light ? 'text-footer-muted' : 'text-gold-deep'}`}>
            {business.taglineHi}
          </span>
        )}
      </span>
      <span className="sr-only">{business.name}</span>
    </span>
  );
}
