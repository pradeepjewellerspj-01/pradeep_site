import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { api } from './api';
import { Button, Dialog, ErrorBanner, Field, inputClass } from './ui';

const MIN = 10; // as server/auth.mjs

const when = (iso) => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

/** A rough guide while typing; the server has the final say. */
function strength(pw) {
  if (!pw) return null;
  if (pw.length < MIN) return { label: `Too short: ${MIN - pw.length} more character${MIN - pw.length > 1 ? 's' : ''}`, tone: 'text-down', bars: 1 };
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
  if (pw.length >= 14 && kinds >= 3) return { label: 'Strong', tone: 'text-up', bars: 4 };
  if (kinds >= 2) return { label: 'Good', tone: 'text-up', bars: 3 };
  return { label: 'Okay. Mixing in numbers or capitals makes it stronger.', tone: 'text-muted', bars: 2 };
}

/**
 * Change the admin password. Every other device is signed out; this one
 * stays signed in. A forgotten password is reset by the developer
 * (npm run admin:reset-password, see README).
 */
export default function PasswordDialog({ info, onClose, onChanged }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [problem, setProblem] = useState(null);
  const [busy, setBusy] = useState(false);
  const s = strength(form.next);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((x) => (x[k] ? { ...x, [k]: null } : x));
  };

  const save = async (e) => {
    e?.preventDefault();
    const local = {};
    if (!form.current) local.current = 'Enter the current password';
    if (form.next.length < MIN) local.next = `Use at least ${MIN} characters`;
    else if (form.next === form.current) local.next = 'Choose a password different from the current one';
    if (!local.next && form.confirm !== form.next) local.confirm = 'The two new passwords do not match';
    setErrors(local);
    setProblem(null);
    if (Object.keys(local).length) return;
    setBusy(true);
    try {
      const { changedAt } = await api('password', { method: 'PUT', body: { current: form.current, next: form.next } });
      onChanged(changedAt);
    } catch (err) {
      setErrors(err.errors ?? {});
      setProblem(err.errors ? null : err.message);
    } finally {
      setBusy(false);
    }
  };

  const type = show ? 'text' : 'password';
  return (
    <Dialog
      open
      title="Change password"
      onClose={busy ? () => {} : onClose}
      footer={
        <>
          <Button onClick={save} busy={busy}>
            Change password
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
        </>
      }
    >
      <form onSubmit={save} className="space-y-4" data-password-form>
        <p className="font-sans text-[13px] text-muted">
          {info?.changedAt ? `Last changed ${when(info.changedAt)}.` : 'You are using the first password set by your developer.'} After the change, every other phone or computer is signed out.
        </p>
        <ErrorBanner>{problem}</ErrorBanner>
        <Field label="Current password" error={errors.current}>
          {(p) => <input {...p} type={type} autoComplete="current-password" className={inputClass} value={form.current} onChange={set('current')} />}
        </Field>
        <Field label="New password" error={errors.next}>
          {(p) => <input {...p} type={type} autoComplete="new-password" className={inputClass} value={form.next} onChange={set('next')} />}
        </Field>
        {s && !errors.next && (
          <div className="-mt-2" aria-live="polite">
            <div className="flex gap-1" aria-hidden="true">
              {[1, 2, 3, 4].map((i) => (
                <span key={i} className={`h-1 flex-1 rounded-full ${i <= s.bars ? (s.bars >= 3 ? 'bg-up' : s.bars === 2 ? 'bg-gold-deep' : 'bg-down') : 'bg-border'}`} />
              ))}
            </div>
            <p className={`mt-1 font-sans text-[12px] ${s.tone}`}>{s.label}</p>
          </div>
        )}
        <Field label="New password, again" error={errors.confirm}>
          {(p) => <input {...p} type={type} autoComplete="new-password" className={inputClass} value={form.confirm} onChange={set('confirm')} />}
        </Field>
        <button type="button" onClick={() => setShow((v) => !v)} className="inline-flex items-center gap-1.5 font-sans text-[12.5px] text-primary hover:underline" aria-pressed={show}>
          {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />} {show ? 'Hide passwords' : 'Show passwords'}
        </button>
        <p className="font-sans text-[12px] text-subtle">At least {MIN} characters. Use something you do not use anywhere else. If it is forgotten, your developer can reset it.</p>
        {/* Enter submits */}
        <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
      </form>
    </Dialog>
  );
}
