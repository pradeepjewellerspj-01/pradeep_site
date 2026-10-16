import { useMemo, useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { api } from './api';
import { Button, Dialog, ErrorBanner, Field, PhotoInput, Toggle, inputClass } from './ui';
import { PROMO_TONES, cleanPromotion, slugify } from '../content/schema';
import { indiaToday } from '../data/promotions';
import { primaryNav } from '../data/navigation';

const TONE_STYLE = {
  burgundy: 'bg-[#5b1a22] text-[#f4e6cf]',
  espresso: 'bg-[#2a1712] text-[#f4e6cf]',
  ivory: 'bg-[#f6efe2] text-[#3a2418] border border-border',
};

const LINKS = [
  ['/category/all-jewellery', 'All jewellery'],
  ...primaryNav.filter((n) => n.slug !== 'all-jewellery').map((n) => [`/category/${n.slug}`, n.label]),
  ['/category/gifting', 'Gifting'],
  ['/gold-rate', 'Gold rate today'],
];

const fmt = (d) => (d ? new Date(`${d}T12:00:00+05:30`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

/** Live now / Scheduled / Ended / Off, judged on India's date like the website. */
function status(p, today = indiaToday()) {
  if (!p.enabled) return { label: 'Off', cls: 'bg-border text-muted' };
  if (p.startDate && today < p.startDate) return { label: `Starts ${fmt(p.startDate)}`, cls: 'bg-gold-soft/40 text-gold-deep' };
  if (p.endDate && today > p.endDate) return { label: 'Ended', cls: 'bg-border text-muted' };
  return { label: 'Live now', cls: 'bg-up/15 text-up' };
}

function Preview({ p }) {
  return (
    <div className={`flex items-center gap-3 rounded-lg px-4 py-3 ${TONE_STYLE[p.tone] ?? TONE_STYLE.burgundy}`}>
      <div className="min-w-0 flex-1">
        <p className="truncate font-sans text-[10px] uppercase tracking-[0.2em] opacity-80">
          ✦ {p.label || 'Label'} — {p.occasion || 'Occasion'}
        </p>
        <p className="truncate font-display text-[16px] italic">{p.title || 'Your message'}</p>
        {p.discount && <p className="truncate font-sans text-[12px] opacity-90">{p.discount}</p>}
      </div>
      <span className="shrink-0 font-sans text-[11px] uppercase tracking-[0.16em] underline underline-offset-4">{p.cta || 'Explore'} →</span>
    </div>
  );
}

function OfferForm({ initial, isNew, onSaved, onDeleted, onClose }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [problem, setProblem] = useState(null);
  const [busy, setBusy] = useState(null);
  const set = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v?.target ? v.target.value : v }));
    setErrors((e) => (e[k] ? { ...e, [k]: null } : e)); // a corrected field drops its message
  };
  const customLink = !LINKS.some(([href]) => href === form.href);

  const save = async () => {
    const body = { ...form, id: isNew ? slugify(form.id || `${form.occasion}-${form.startDate?.slice(0, 4) ?? ''}`) : form.id };
    const { errors: local } = cleanPromotion(body);
    setErrors(local ?? {});
    setProblem(null);
    if (local) return;
    setBusy('save');
    try {
      const saved = await api(isNew ? 'promotions' : `promotions/${encodeURIComponent(form.id)}`, { method: isNew ? 'POST' : 'PUT', body });
      onSaved(saved, isNew);
    } catch (e) {
      setErrors(e.errors ?? {});
      setProblem(e.errors?.id ? 'An offer with this name already exists. Change the occasion or dates.' : e.message);
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete the offer “${form.occasion}”? To pause it instead, switch it off.`)) return;
    setBusy('delete');
    try {
      await api(`promotions/${encodeURIComponent(form.id)}`, { method: 'DELETE' });
      onDeleted(form.id);
    } catch (e) {
      setProblem(e.message);
      setBusy(null);
    }
  };

  return (
    <Dialog
      open
      title={isNew ? 'New offer' : `Edit offer`}
      onClose={onClose}
      footer={
        <>
          <Button onClick={save} busy={busy === 'save'} disabled={Boolean(busy)}>
            {isNew ? 'Create offer' : 'Save changes'}
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={Boolean(busy)}>
            Cancel
          </Button>
          {!isNew && (
            <Button variant="danger" className="ml-auto" onClick={remove} busy={busy === 'delete'} disabled={Boolean(busy)}>
              Delete
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-5">
        <ErrorBanner>{problem}</ErrorBanner>
        <div>
          <p className="mb-1.5 font-sans text-[11.5px] font-medium uppercase tracking-[0.12em] text-muted">Preview</p>
          <Preview p={form} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Occasion" error={errors.occasion}>
            {(p) => <input {...p} className={inputClass} value={form.occasion} onChange={set('occasion')} placeholder="e.g. Diwali · 2026" />}
          </Field>
          <Field label="Small label" error={errors.label}>
            {(p) => <input {...p} className={inputClass} value={form.label} onChange={set('label')} placeholder="e.g. Festive edit" />}
          </Field>
        </div>
        <Field label="Message" error={errors.title} hint="One short sentence.">
          {(p) => <input {...p} className={inputClass} value={form.title} onChange={set('title')} placeholder="e.g. Make this Diwali unforgettable." />}
        </Field>
        <Field label="Offer text" error={errors.discount} hint="Optional. Only write an offer the showroom has confirmed.">
          {(p) => (
            <input {...p} className={inputClass} value={form.discount ?? ''} onChange={set('discount')} placeholder="e.g. Up to 20% off making charges on selected jewellery" />
          )}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Button text" error={errors.cta}>
            {(p) => <input {...p} className={inputClass} value={form.cta} onChange={set('cta')} />}
          </Field>
          <Field label="Button opens" error={errors.href}>
            {(p) => (
              <select {...p} className={inputClass} value={customLink ? '__custom' : form.href} onChange={(e) => set('href')(e.target.value === '__custom' ? '/' : e.target.value)}>
                {LINKS.map(([href, label]) => (
                  <option key={href} value={href}>
                    {label}
                  </option>
                ))}
                <option value="__custom">Another page…</option>
              </select>
            )}
          </Field>
        </div>
        {customLink && (
          <Field label="Page address" error={errors.href} hint="A page on this website, e.g. /category/bangles">
            {(p) => <input {...p} className={inputClass} value={form.href} onChange={set('href')} />}
          </Field>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Starts" error={errors.startDate} hint="Empty: from now">
            {(p) => <input {...p} type="date" className={inputClass} value={form.startDate ?? ''} onChange={set('startDate')} />}
          </Field>
          <Field label="Ends (last day)" error={errors.endDate} hint="Empty: no end">
            {(p) => <input {...p} type="date" className={inputClass} value={form.endDate ?? ''} onChange={set('endDate')} />}
          </Field>
          <Field label="Priority" error={errors.priority} hint="Higher shows first">
            {(p) => <input {...p} type="number" className={inputClass} value={form.priority} onChange={set('priority')} />}
          </Field>
        </div>
        <fieldset>
          <legend className="mb-1.5 font-sans text-[11.5px] font-medium uppercase tracking-[0.12em] text-muted">Colour</legend>
          <div className="flex gap-2">
            {PROMO_TONES.map((t) => (
              <label
                key={t}
                className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 font-sans text-[13px] capitalize ${form.tone === t ? 'border-primary text-ink' : 'border-border text-muted'}`}
              >
                <input type="radio" name="tone" value={t} checked={form.tone === t} onChange={() => set('tone')(t)} className="sr-only" />
                <span className={`size-4 rounded-full ${TONE_STYLE[t]}`} aria-hidden="true" />
                {t}
              </label>
            ))}
          </div>
        </fieldset>
        <PhotoInput label="Image (optional)" value={form.image ?? ''} onChange={(v) => set('image')(v || null)} error={errors.image} aspect="aspect-[4/3]" />
        <Toggle checked={form.enabled} onChange={set('enabled')} label="Show on the website" description="Shown only between its start and end dates." />
      </div>
    </Dialog>
  );
}

export default function OffersPanel({ promotions, setPromotions, notify }) {
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const today = indiaToday();
  const sorted = useMemo(() => [...promotions].sort((a, b) => Number(b.enabled) - Number(a.enabled) || b.priority - a.priority), [promotions]);
  const liveCount = promotions.filter((p) => status(p, today).label === 'Live now').length;

  const toggle = async (p) => {
    setBusyId(p.id);
    try {
      const saved = await api(`promotions/${encodeURIComponent(p.id)}`, { method: 'PUT', body: { ...p, enabled: !p.enabled } });
      setPromotions((list) => list.map((x) => (x.id === p.id ? saved : x)));
      notify(saved.enabled ? 'Offer switched on' : 'Offer switched off');
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section aria-labelledby="offers-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="offers-title" className="font-serif text-2xl text-heading">
            Offers &amp; promo band
          </h2>
          <p className="font-sans text-[13px] text-muted">{liveCount} showing today in the band under the header. Several live offers rotate.</p>
        </div>
        <Button
          onClick={() =>
            setEditing({
              isNew: true,
              promo: {
                id: '',
                occasion: '',
                label: 'Festive edit',
                title: '',
                cta: 'Explore',
                href: '/category/all-jewellery',
                tone: 'burgundy',
                discount: '',
                image: null,
                startDate: today,
                endDate: '',
                enabled: true,
                priority: 20,
              },
            })
          }
        >
          <Plus className="size-4" /> New offer
        </Button>
      </div>

      <ul className="mt-5 space-y-2.5">
        {sorted.map((p) => {
          const s = status(p, today);
          return (
            <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-white p-3 sm:flex-nowrap sm:p-4">
              <div className="min-w-0 flex-1 basis-full sm:basis-auto">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-sans text-[14px] text-ink">{p.occasion}</p>
                  <span className={`rounded-full px-2 py-0.5 font-sans text-[10.5px] uppercase tracking-wider ${s.cls}`}>{s.label}</span>
                </div>
                <p className="truncate font-sans text-[12.5px] text-muted">
                  {p.title}
                  {p.startDate || p.endDate ? ` · ${p.startDate ? fmt(p.startDate) : 'now'} – ${p.endDate ? fmt(p.endDate) : 'no end'}` : ' · no dates'}
                </p>
              </div>
              <Button variant="ghost" className="px-3!" busy={busyId === p.id} onClick={() => toggle(p)}>
                {p.enabled ? 'Switch off' : 'Switch on'}
              </Button>
              <Button
                variant="outline"
                className="px-3!"
                onClick={() => setEditing({ isNew: false, promo: { ...p, discount: p.discount ?? '' } })}
                aria-label={`Edit ${p.occasion}`}
              >
                <Pencil className="size-3.5" /> Edit
              </Button>
            </li>
          );
        })}
      </ul>

      {editing && (
        <OfferForm
          key={editing.promo.id || 'new'}
          initial={editing.promo}
          isNew={editing.isNew}
          onClose={() => setEditing(null)}
          onSaved={(saved, isNew) => {
            setPromotions((list) => (isNew ? [saved, ...list] : list.map((x) => (x.id === saved.id ? saved : x))));
            setEditing(null);
            notify(isNew ? 'Offer created' : 'Saved');
          }}
          onDeleted={(id) => {
            setPromotions((list) => list.filter((x) => x.id !== id));
            setEditing(null);
            notify('Offer deleted');
          }}
        />
      )}
    </section>
  );
}
