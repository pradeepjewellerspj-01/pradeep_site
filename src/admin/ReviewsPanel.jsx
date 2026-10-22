import { useState } from 'react';
import { ExternalLink, Plus, Star, Trash2 } from 'lucide-react';
import { api } from './api';
import { Button, ErrorBanner, Field, inputClass } from './ui';
import { MAX_REVIEWS, cleanSettings } from '../content/schema';

const card = 'rounded-xl border border-border bg-white p-5';
const today = () => new Date().toISOString().slice(0, 10);
const plain = (list) => (list ?? []).map((r) => ({ name: r.name, rating: r.rating, text: r.text ?? '', date: r.date ?? '', source: r.source ?? 'google' }));
// Each row keeps one key while it is edited.
let seq = 0;
const withKeys = (list) => list.map((r) => ({ ...r, key: ++seq }));
const strip = (list) => list.map(({ key, ...r }) => r);

function StarPicker({ value, onChange, error }) {
  return (
    <fieldset>
      <legend className="mb-1.5 font-sans text-[11.5px] font-medium uppercase tracking-[0.12em] text-muted">Stars</legend>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`} aria-pressed={value === n} className="rounded p-0.5">
            <Star className={`size-6 ${n <= value ? 'fill-gold text-gold' : 'text-border-strong'}`} strokeWidth={1.4} />
          </button>
        ))}
      </div>
      {error && <p className="mt-1.5 font-sans text-[12px] text-down">{error}</p>}
    </fieldset>
  );
}

/** Customer reviews for the website's Reviews page (/reviews). */
export default function ReviewsPanel({ settings, setSettings, notify }) {
  const [list, setList] = useState(() => withKeys(plain(settings.reviews)));
  const [errors, setErrors] = useState({});
  const [problem, setProblem] = useState(null);
  const [busy, setBusy] = useState(false);

  const update = (i, k, v) => setList((l) => l.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const add = () => setList((l) => [...withKeys([{ name: '', rating: 5, text: '', date: today(), source: 'google' }]), ...l]);
  const remove = (i) => setList((l) => l.filter((_, j) => j !== i));

  const save = async () => {
    const body = { contact: settings.contact, rates: settings.rates, reviews: strip(list) };
    const { errors: local } = cleanSettings(body);
    setErrors(local ?? {});
    setProblem(null);
    if (local) return;
    setBusy(true);
    try {
      const saved = await api('settings', { method: 'PUT', body });
      setSettings(saved);
      setList(withKeys(plain(saved.reviews)));
      notify('Reviews saved');
    } catch (e) {
      setErrors(e.errors ?? {});
      setProblem(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="reviews-title" className="max-w-3xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="reviews-title" className="font-serif text-2xl text-heading">
            Customer reviews
          </h2>
          <p className="font-sans text-[13px] text-muted">
            Shown on the website’s Reviews page with the average rating. Copy your best Google reviews here, or add what customers told you in the showroom. Only add real reviews.
          </p>
        </div>
        <a href="/reviews" target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 font-sans text-[13px] text-muted hover:text-primary">
          <ExternalLink className="size-4" /> View page
        </a>
      </div>

      <Button variant="outline" onClick={add} disabled={list.length >= MAX_REVIEWS}>
        <Plus className="size-4" /> Add a review
      </Button>
      <ErrorBanner>{errors.reviews}</ErrorBanner>

      <ul className="space-y-3">
        {list.map((r, i) => (
          <li key={r.key} className={card}>
            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <Field label="Customer name" error={errors[`reviews.${i}.name`]}>
                {(p) => <input {...p} className={inputClass} value={r.name} onChange={(e) => update(i, 'name', e.target.value)} placeholder="e.g. Priya S." />}
              </Field>
              <StarPicker value={r.rating} onChange={(v) => update(i, 'rating', v)} error={errors[`reviews.${i}.rating`]} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Where">
                {(p) => (
                  <select {...p} className={inputClass} value={r.source} onChange={(e) => update(i, 'source', e.target.value)}>
                    <option value="google">Google review</option>
                    <option value="showroom">In the showroom</option>
                  </select>
                )}
              </Field>
              <Field label="Date" error={errors[`reviews.${i}.date`]} hint="Optional">
                {(p) => <input {...p} type="date" className={inputClass} value={r.date} onChange={(e) => update(i, 'date', e.target.value)} />}
              </Field>
            </div>
            <Field label="Review" className="mt-4" error={errors[`reviews.${i}.text`]} hint="Optional: a rating alone is fine">
              {(p) => <textarea {...p} rows={3} className={inputClass} value={r.text} onChange={(e) => update(i, 'text', e.target.value)} />}
            </Field>
            <Button variant="ghost" className="mt-3 text-down!" onClick={() => remove(i)}>
              <Trash2 className="size-4" /> Remove
            </Button>
          </li>
        ))}
        {!list.length && <li className={`${card} text-center font-sans text-[13px] text-muted`}>No reviews yet. The page asks visitors to write one on Google.</li>}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={save} busy={busy}>
          Save reviews
        </Button>
        <ErrorBanner>{problem || (Object.keys(errors).length ? 'Please check the highlighted fields' : null)}</ErrorBanner>
      </div>
    </section>
  );
}
