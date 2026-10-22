import { useState } from 'react';
import { Download, Plus, Printer, Trash2 } from 'lucide-react';
import { api } from './api';
import { Button, ErrorBanner, Field, inputClass } from './ui';
import { cleanSettings } from '../content/schema';
import ReviewQR from '../components/common/ReviewQR';
import { business } from '../data/footer';
import { downloadReviewQr, printReviewCard } from './reviewQrFiles';

const card = 'rounded-xl border border-border bg-white p-5';
const h3 = 'font-serif text-lg text-heading';

export default function ContactPanel({ settings, setSettings, notify }) {
  const [c, setC] = useState(() => ({ googleReview: '', ...structuredClone(settings.contact) }));
  const [errors, setErrors] = useState({});
  const [problem, setProblem] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setC((x) => ({ ...x, [k]: e.target.value }));
  // The QR follows the link as typed, so it can be checked before saving.
  const reviewTarget = /^https:\/\/\S+$/i.test(c.googleReview.trim()) ? c.googleReview.trim() : business.mapsUrl;
  const setAddr = (k) => (e) => setC((x) => ({ ...x, address: { ...x.address, [k]: e.target.value } }));
  const setRow = (list, i, k) => (e) => setC((x) => ({ ...x, [list]: x[list].map((r, j) => (j === i ? { ...r, [k]: e.target.value } : r)) }));
  const addRow = (list, row) => setC((x) => ({ ...x, [list]: [...x[list], row] }));
  const removeRow = (list, i) => setC((x) => ({ ...x, [list]: x[list].filter((_, j) => j !== i) }));

  const save = async () => {
    const body = { contact: c, rates: settings.rates };
    const { errors: local } = cleanSettings(body);
    setErrors(local ?? {});
    setProblem(null);
    if (local) return;
    setBusy(true);
    try {
      const saved = await api('settings', { method: 'PUT', body });
      setSettings(saved);
      setC({ googleReview: '', ...structuredClone(saved.contact) });
      notify('Contact details saved');
    } catch (e) {
      setErrors(e.errors ?? {});
      setProblem(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="contact-title" className="max-w-3xl space-y-5">
      <div>
        <h2 id="contact-title" className="font-serif text-2xl text-heading">
          Contact &amp; timings
        </h2>
        <p className="font-sans text-[13px] text-muted">Used in the footer, Find a Store, every WhatsApp button and the policy pages.</p>
      </div>

      <div className={card}>
        <h3 className={h3}>WhatsApp</h3>
        <Field label="WhatsApp number" className="mt-3 max-w-xs" error={errors['contact.whatsapp']} hint="10-digit mobile. All enquiry buttons open a chat with this number.">
          {(p) => <input {...p} type="tel" inputMode="tel" className={inputClass} value={c.whatsapp.replace(/^91(?=\d{10}$)/, '')} onChange={set('whatsapp')} />}
        </Field>
      </div>

      <div className={card}>
        <h3 className={h3}>Phone numbers</h3>
        <ErrorBanner>{errors['contact.phones']}</ErrorBanner>
        <ul className="mt-3 space-y-2">
          {c.phones.map((ph, i) => (
            <li key={i} className="flex items-center gap-2">
              <input
                aria-label={`Label for number ${i + 1}`}
                className={`${inputClass} max-w-[140px]`}
                value={ph.label}
                onChange={setRow('phones', i, 'label')}
                placeholder="Showroom"
              />
              <input aria-label={`Number ${i + 1}`} type="tel" className={inputClass} value={ph.display} onChange={setRow('phones', i, 'display')} placeholder="0788-2296809" />
              <button
                type="button"
                onClick={() => removeRow('phones', i)}
                aria-label={`Remove number ${i + 1}`}
                className="rounded-full p-2 text-muted hover:bg-blush hover:text-down"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-2 font-sans text-[12px] text-subtle">The first number is the main showroom number (Call buttons).</p>
        <Button variant="outline" className="mt-3" onClick={() => addRow('phones', { label: 'Mobile', display: '' })}>
          <Plus className="size-4" /> Add number
        </Button>
      </div>

      <div className={card}>
        <h3 className={h3}>Address</h3>
        <ErrorBanner>{errors['contact.address']}</ErrorBanner>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Street / market" className="sm:col-span-2">
            {(p) => <input {...p} className={inputClass} value={c.address.street} onChange={setAddr('street')} />}
          </Field>
          <Field label="City">{(p) => <input {...p} className={inputClass} value={c.address.city} onChange={setAddr('city')} />}</Field>
          <Field label="State">{(p) => <input {...p} className={inputClass} value={c.address.region} onChange={setAddr('region')} />}</Field>
          <Field label="PIN code" error={errors['contact.address.postalCode']}>
            {(p) => <input {...p} inputMode="numeric" className={inputClass} value={c.address.postalCode} onChange={setAddr('postalCode')} />}
          </Field>
        </div>
        <p className="mt-2 font-sans text-[12px] text-subtle">The map in Find a Store searches Google Maps for “Pradeep Jewellers” at this address.</p>
      </div>

      <div className={card}>
        <h3 className={h3}>Showroom timings</h3>
        <ErrorBanner>{errors['contact.hours']}</ErrorBanner>
        <ul className="mt-3 space-y-2">
          {c.hours.map((h, i) => (
            <li key={i} className="flex items-center gap-2">
              <input aria-label={`Days, row ${i + 1}`} className={inputClass} value={h.days} onChange={setRow('hours', i, 'days')} placeholder="Monday – Saturday" />
              <input aria-label={`Time, row ${i + 1}`} className={inputClass} value={h.time} onChange={setRow('hours', i, 'time')} placeholder="11:00 am – 8:30 pm" />
              <button type="button" onClick={() => removeRow('hours', i)} aria-label={`Remove row ${i + 1}`} className="rounded-full p-2 text-muted hover:bg-blush hover:text-down">
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
        {!c.hours.length && <p className="mt-2 font-sans text-[13px] text-muted">No timings yet. Nothing is shown on the website until you add them.</p>}
        <Button variant="outline" className="mt-3" onClick={() => addRow('hours', { days: '', time: '' })}>
          <Plus className="size-4" /> Add row
        </Button>
      </div>

      <div className={card}>
        <h3 className={h3}>Social profiles</h3>
        <div className="mt-3 grid gap-3">
          <Field label="Instagram" error={errors['contact.instagram']} hint="Leave empty to hide the icon">
            {(p) => <input {...p} type="url" className={inputClass} value={c.instagram} onChange={set('instagram')} placeholder="https://www.instagram.com/…" />}
          </Field>
          <Field label="Facebook" error={errors['contact.facebook']} hint="Leave empty to hide the icon">
            {(p) => <input {...p} type="url" className={inputClass} value={c.facebook} onChange={set('facebook')} placeholder="https://www.facebook.com/…" />}
          </Field>
        </div>
      </div>

      <div className={card}>
        <h3 className={h3}>Google reviews</h3>
        <Field
          label="Review link"
          className="mt-3"
          error={errors['contact.googleReview']}
          hint="For the “Rate us on Google” buttons. In your Google Business Profile: Ask for reviews → copy the link (looks like https://g.page/r/…/review). Empty: the buttons open your shop on Google Maps."
        >
          {(p) => <input {...p} type="url" className={inputClass} value={c.googleReview} onChange={set('googleReview')} placeholder="https://g.page/r/…/review" />}
        </Field>
        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border pt-4">
          <ReviewQR url={reviewTarget} className="size-28 shrink-0 rounded-md border border-border p-1" />
          <div className="min-w-0 flex-1 space-y-2">
            <p className="font-sans text-[13px] text-ink">QR code for the shop counter, bills and WhatsApp status: customers scan it to rate you on Google.</p>
            {!c.googleReview.trim() && <p className="font-sans text-[12px] text-down">Add your review link above first. Without it, the QR only opens your shop on Google Maps.</p>}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => printReviewCard(reviewTarget).catch((e) => notify(e.message, 'error'))}>
                <Printer className="size-4" /> Print counter card
              </Button>
              <Button variant="outline" onClick={() => downloadReviewQr(reviewTarget)}>
                <Download className="size-4" /> Download QR (PNG)
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={save} busy={busy}>
          Save contact details
        </Button>
        <ErrorBanner>{problem || (Object.keys(errors).length ? 'Please check the highlighted fields' : null)}</ErrorBanner>
      </div>
    </section>
  );
}
