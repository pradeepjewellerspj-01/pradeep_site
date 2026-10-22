import { useEffect, useId, useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { uploadPhoto } from './api';
import { resolveImage } from '../data/images';

export const inputClass =
  'w-full rounded-lg border border-border-strong bg-white px-3.5 py-2.5 font-sans text-[14px] text-ink outline-none transition-colors placeholder:text-subtle focus:border-primary disabled:bg-surface disabled:text-muted';

/** Label, control, hint and error for one form field. */
export function Field({ label, hint, error, children, className = '' }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block font-sans text-[11.5px] font-medium uppercase tracking-[0.12em] text-muted">
        {label}
      </label>
      {typeof children === 'function' ? children({ id, 'aria-invalid': Boolean(error) || undefined, 'aria-describedby': error || hint ? `${id}-note` : undefined }) : children}
      {(error || hint) && (
        <p id={`${id}-note`} className={`mt-1.5 font-sans text-[12px] ${error ? 'text-down' : 'text-subtle'}`}>
          {error || hint}
        </p>
      )}
    </div>
  );
}

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  outline: 'border border-border-strong bg-white text-ink hover:border-primary hover:text-primary',
  ghost: 'text-muted hover:bg-blush hover:text-ink',
  danger: 'border border-down/40 bg-white text-down hover:bg-down hover:text-white',
};

export function Button({ variant = 'primary', busy = false, className = '', children, ...props }) {
  return (
    <button
      type="button"
      {...props}
      disabled={busy || props.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 font-sans text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${className}`}
    >
      {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span
        aria-hidden="true"
        className={`mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 ${checked ? 'bg-primary' : 'bg-border-strong'}`}
      >
        <span className={`size-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </span>
      <span>
        <span className="block font-sans text-[14px] text-ink">{label}</span>
        {description && <span className="block font-sans text-[12px] text-muted">{description}</span>}
      </span>
    </label>
  );
}

/** A centred dialog for editing one record. */
export function Dialog({ open, title, onClose, children, footer, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className={`m-auto ${wide ? 'w-[min(1280px,calc(100vw-24px))]' : 'w-[min(720px,calc(100vw-24px))]'} max-h-[calc(100vh-24px)] overflow-hidden rounded-2xl bg-white p-0 text-ink shadow-2xl backdrop:bg-black/45`}
    >
      {open && (
        <div className="flex max-h-[calc(100vh-24px)] flex-col">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-serif text-xl text-heading">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-muted hover:bg-blush">
              <X className="size-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
          {footer && <div className="flex flex-wrap items-center gap-2 border-t border-border bg-surface px-5 py-3.5">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}

/** Photo picker: shows the current photo and uploads a replacement. */
/** `safeAspect`: the shape the website crops this photo to, so the watermark stays inside it. */
export function PhotoInput({ value, onChange, error, aspect = 'aspect-square', label = 'Photo', watermark = true, safeAspect = null, fit = 'cover', maxEdge, className = 'max-w-[220px]' }) {
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);
  const input = useRef(null);
  const src = value ? resolveImage(value) : null;

  const pick = async (file) => {
    if (!file) return;
    setBusy(true);
    setProblem(null);
    try {
      onChange(await uploadPhoto(file, { watermark, safeAspect, ...(maxEdge ? { maxEdge } : {}) }));
    } catch (e) {
      setProblem(e.message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <Field label={label} error={problem || error} hint={`JPEG, PNG or WebP. Resized${watermark ? ' and watermarked' : ''} automatically.`}>
      {({ id }) => (
        <div className={`relative w-full ${className} overflow-hidden rounded-lg border border-dashed ${error ? 'border-down' : 'border-border-strong'} bg-cream ${aspect}`}>
          {src && <img src={src} alt="" className={`absolute inset-0 h-full w-full ${fit === 'contain' ? 'object-contain' : 'object-cover'}`} />}
          <label
            htmlFor={id}
            className={`absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-1.5 font-sans text-[12.5px] transition-colors ${
              src ? 'bg-black/0 text-transparent hover:bg-black/45 hover:text-white focus-within:bg-black/45 focus-within:text-white' : 'text-muted hover:text-primary'
            }`}
          >
            {busy ? <Loader2 className="size-6 animate-spin text-primary" /> : <ImagePlus className="size-6" strokeWidth={1.4} />}
            {busy ? 'Uploading…' : src ? 'Replace photo' : 'Add photo'}
            <input ref={input} id={id} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={busy} onChange={(e) => pick(e.target.files?.[0])} />
          </label>
          {src && value && !busy && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 text-muted shadow hover:text-down"
              aria-label="Remove photo"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      )}
    </Field>
  );
}

/** Small transient confirmation at the bottom of the screen. */
export function useNotice() {
  const [notice, setNotice] = useState(null);
  useEffect(() => {
    if (!notice) return undefined;
    const t = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(t);
  }, [notice]);
  const view = notice && (
    <p
      role="status"
      className={`fixed bottom-5 left-1/2 z-[80] -translate-x-1/2 rounded-full px-5 py-2.5 font-sans text-[13px] text-white shadow-lg ${notice.tone === 'error' ? 'bg-down' : 'bg-ink'}`}
    >
      {notice.text}
    </p>
  );
  return { notify: (text, tone = 'ok') => setNotice({ text, tone }), view };
}

export function ErrorBanner({ children }) {
  if (!children) return null;
  return <p className="rounded-lg border border-down/30 bg-down/5 px-4 py-3 font-sans text-[13px] text-down">{children}</p>;
}
