import { CalendarDays } from 'lucide-react';
import { WhatsappIcon } from '../common/BrandIcons';
import { buildWhatsAppMessage, whatsAppUrl } from '../../services/whatsapp';
import { useStore } from '../../context/StoreContext';

const fab =
  'inline-flex size-12 items-center justify-center rounded-full border border-white/70 bg-stage text-champagne-soft shadow-[0_10px_30px_-10px_rgba(0,0,0,0.55)] transition-transform duration-500 hover:scale-105 md:size-14';

/** Floating actions: book an appointment, or talk to the showroom on WhatsApp. */
export default function FloatingUI() {
  const { openModal } = useStore();
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex items-center gap-2.5 md:bottom-6 md:right-6 md:gap-3">
      <button type="button" onClick={() => openModal('appointment')} aria-label="Book an appointment" title="Book an appointment" className={fab}>
        <CalendarDays className="size-5 md:size-6" strokeWidth={1.5} />
      </button>
      <a
        href={whatsAppUrl(buildWhatsAppMessage([]))}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Pradeep Jewellers on WhatsApp"
        title="Chat on WhatsApp"
        className={fab}
      >
        <WhatsappIcon className="size-6 md:size-7" />
      </a>
    </div>
  );
}
