import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Accessible slide-in panel / centred modal.
 * side: 'left' | 'right' | 'full' | 'center'
 */
export default function Drawer({ open, onClose, side = 'right', title, children, footer, labelledBy, widthClass = 'w-[min(420px,100vw)]', panelClass = 'bg-white' }) {
  const panel = useRef(null);
  const returnFocus = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    returnFocus.current = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    const first = panel.current?.querySelector(FOCUSABLE);
    window.setTimeout(() => first?.focus(), 60);

    const onKey = (e) => {
      if (e.key === 'Escape') closeRef.current();
      if (e.key !== 'Tab' || !panel.current) return;
      const nodes = [...panel.current.querySelectorAll(FOCUSABLE)];
      if (!nodes.length) return;
      const [firstNode, lastNode] = [nodes[0], nodes[nodes.length - 1]];
      if (e.shiftKey && document.activeElement === firstNode) {
        e.preventDefault();
        lastNode.focus();
      } else if (!e.shiftKey && document.activeElement === lastNode) {
        e.preventDefault();
        firstNode.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
      returnFocus.current?.focus?.();
    };
  }, [open]);

  const position = {
    left: `left-0 top-0 h-full ${widthClass} ${open ? 'translate-x-0' : '-translate-x-full'}`,
    right: `right-0 top-0 h-full ${widthClass} ${open ? 'translate-x-0' : 'translate-x-full'}`,
    full: `inset-0 ${open ? 'translate-y-0' : 'translate-y-4'}`,
    center: `left-1/2 top-1/2 max-h-[90vh] w-[min(560px,calc(100vw-32px))] -translate-x-1/2 rounded-card ${open ? '-translate-y-1/2 scale-100' : '-translate-y-[46%] scale-[0.98]'}`,
  }[side];

  return (
    <div className={`fixed inset-0 z-[80] overflow-hidden ${open ? 'visible' : 'invisible'}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-footer/45 transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : title}
        className={`absolute flex flex-col ${panelClass} shadow-2xl transition-[transform,opacity] duration-500 ease-[var(--ease-lux)] ${position} ${open ? 'opacity-100' : 'opacity-0'}`}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 id={labelledBy} className="font-serif text-xl text-heading">
              {title}
            </h2>
            <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-ink hover:bg-blush hover:text-primary">
              <X className="size-5" strokeWidth={1.5} />
            </button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto">{open && children}</div>
        {footer && open && <div className="border-t border-border p-5">{footer}</div>}
      </div>
    </div>
  );
}
