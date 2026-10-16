import { WhatsappIcon } from '../common/BrandIcons';
import { enquiryUrl } from '../../services/whatsapp';

/**
 * Opens WhatsApp with a pre-filled enquiry; the customer presses Send themselves.
 * variant: 'solid' | 'outline' | 'link' | 'icon'
 */
export default function WhatsAppEnquiry({ products, variant = 'solid', label = 'Enquire on WhatsApp', className = '', ariaLabel }) {
  const list = Array.isArray(products) ? products : [products];
  const skins = {
    solid: 'h-[52px] gap-2.5 rounded-full bg-ink px-6 text-[13px] uppercase tracking-[0.14em] text-white hover:bg-primary-dark',
    outline: 'h-11 gap-2 rounded-full border border-ink/25 px-5 text-[12px] uppercase tracking-[0.14em] text-ink hover:border-primary hover:text-primary',
    link: 'gap-1.5 text-[12px] uppercase tracking-[0.14em] text-muted hover:text-primary',
    icon: 'size-9 rounded-full text-muted hover:bg-blush hover:text-primary',
  };
  const fallbackLabel = list.length > 1 ? `Enquire about ${list.length} pieces on WhatsApp` : `Enquire about ${list[0]?.name ?? 'this piece'} on WhatsApp`;

  return (
    <a
      href={enquiryUrl(list)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel ?? (variant === 'icon' ? fallbackLabel : undefined)}
      title={variant === 'icon' ? 'Enquire on WhatsApp' : undefined}
      className={`inline-flex items-center justify-center font-sans transition-colors duration-300 ${skins[variant]} ${className}`}
    >
      <WhatsappIcon className={variant === 'solid' ? 'size-[18px]' : 'size-4'} />
      {variant !== 'icon' && <span>{label}</span>}
    </a>
  );
}
