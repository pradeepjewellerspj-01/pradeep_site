import { Check } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function Toast() {
  const { toast } = useStore();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[90] flex justify-center px-4">
      {toast && (
        <p key={toast.id} className="flex items-center gap-2 rounded-full bg-footer px-5 py-2.5 font-sans text-[13px] text-footer-text shadow-xl motion-safe:animate-[toast-in_0.45s_var(--ease-lux)]">
          <Check className="size-4 text-gold-light" aria-hidden="true" />
          {toast.message}
        </p>
      )}
    </div>
  );
}
