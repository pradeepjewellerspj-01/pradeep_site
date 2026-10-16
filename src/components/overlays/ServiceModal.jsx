import { useState } from 'react';
import { CalendarDays, Clock, MapPin, Navigation, Phone } from 'lucide-react';
import Drawer from './Drawer';
import { useStore } from '../../context/StoreContext';
import { stores } from '../../data/experience';
import { contact, hours, phones } from '../../data/footer';
import { WhatsappIcon } from '../common/BrandIcons';
import { whatsAppUrl } from '../../services/whatsapp';
import { marketLabel, useMarketPrices } from '../../market/useMarketPrices';

const field = 'w-full rounded-full border border-border-strong px-5 py-3 font-sans text-sm outline-none focus:border-primary';
const pill =
  'inline-flex items-center gap-1.5 rounded-full border border-border-strong px-3.5 py-2 font-sans text-[12px] text-ink transition-colors hover:border-primary hover:text-primary';
const primaryBtn = 'w-full rounded-full bg-primary py-3 font-serif text-white transition-colors hover:bg-primary-dark';

function StoreLocator() {
  return (
    <ul className="space-y-3 p-6">
      {stores.map((s) => (
        <li key={s.name} className="overflow-hidden rounded-card border border-border">
          <div className="relative aspect-[16/10] bg-cream">
            <iframe
              src={s.mapsEmbedUrl}
              title={`Map: ${s.name}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0"
              allowFullScreen
            />
          </div>
          <div className="p-5">
            <p className="font-serif text-lg text-heading">{s.name}</p>
            <p className="mt-2 flex gap-2 font-sans text-sm leading-relaxed text-muted">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /> {s.address}
            </p>
            <p className="mt-2 flex gap-2 font-sans text-sm leading-relaxed text-muted">
              <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <span>
                {phones.map((ph, i) => (
                  <a key={ph.tel} href={`tel:${ph.tel}`} className="hover:text-primary">
                    {ph.display}
                    {i < phones.length - 1 && ', '}
                  </a>
                ))}
              </span>
            </p>
            {hours.length > 0 && (
              <p className="mt-2 flex gap-2 font-sans text-sm leading-relaxed text-muted">
                <Clock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  {hours.map((h) => (
                    <span key={`${h.days}${h.time}`} className="block">
                      {h.days}
                      {h.days && h.time && ': '}
                      {h.time}
                    </span>
                  ))}
                </span>
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={s.mapsUrl} target="_blank" rel="noopener noreferrer" className={pill}>
                <Navigation className="size-3.5" strokeWidth={1.6} aria-hidden="true" /> Directions
              </a>
              <a href={`tel:${s.tel}`} className={pill}>
                <Phone className="size-3.5" strokeWidth={1.6} aria-hidden="true" /> Call
              </a>
              <a href={contact.whatsappLink} target="_blank" rel="noopener noreferrer" className={pill}>
                <WhatsappIcon className="size-3.5" /> WhatsApp
              </a>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

const todayIso = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
const longDate = (iso) =>
  new Date(`${iso}T12:00:00+05:30`).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

// The site has no booking backend, so the request goes to the showroom on WhatsApp.
function Appointment({ onDone }) {
  const [sent, setSent] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const message = [
      'Hi Pradeep Jewellers,',
      '',
      'I would like to book an appointment.',
      '',
      `Name: ${f.get('name')}`,
      `Mobile: ${f.get('mobile')}`,
      `Preferred date: ${longDate(f.get('date'))}`,
      `Visit: ${f.get('mode')}`,
      ...(f.get('interest') ? [`Interested in: ${f.get('interest')}`] : []),
      '',
      'Please confirm a suitable time.',
      '',
      'Thank you.',
    ].join('\n');
    window.open(whatsAppUrl(message), '_blank', 'noopener');
    setSent(true);
  };
  if (sent)
    return (
      <div className="p-8 text-center">
        <WhatsappIcon className="mx-auto size-10 text-primary" />
        <p className="mt-4 font-serif text-2xl text-heading">Almost done</p>
        <p className="mt-2 font-sans text-sm text-muted">Your request is ready in WhatsApp. Press Send there, and our team will confirm your slot.</p>
        <button type="button" onClick={onDone} className={`${primaryBtn} mt-6`}>
          Done
        </button>
      </div>
    );
  return (
    <form onSubmit={submit} className="space-y-3 p-6">
      <input required name="name" autoComplete="name" placeholder="Full name" aria-label="Full name" className={field} />
      <input
        required
        name="mobile"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        pattern="\+?[0-9 ]{10,15}"
        title="10-digit mobile number"
        placeholder="Mobile number"
        aria-label="Mobile number"
        className={field}
      />
      <div className="grid grid-cols-2 gap-3">
        <input required name="date" type="date" min={todayIso()} aria-label="Preferred date" className={field} />
        <select name="mode" aria-label="Visit" className={field} defaultValue="In the showroom">
          <option>In the showroom</option>
          <option>Video call</option>
        </select>
      </div>
      <select name="interest" aria-label="Interested in" className={field} defaultValue="">
        <option value="">Interested in… (optional)</option>
        <option>Bridal jewellery</option>
        <option>Diamond jewellery</option>
        <option>Gold jewellery</option>
        <option>Silver jewellery</option>
        <option>Old gold exchange</option>
        <option>Gifting</option>
      </select>
      <button type="submit" className={`${primaryBtn} inline-flex items-center justify-center gap-2`}>
        <CalendarDays className="size-4" strokeWidth={1.5} aria-hidden="true" /> Request on WhatsApp
      </button>
      <p className="text-center font-sans text-[11.5px] text-muted">Opens WhatsApp with your details filled in. Nothing is sent until you press Send.</p>
    </form>
  );
}

// 24K rate per gram from the shared market feed, with its honest label.
function useGoldRate() {
  const market = useMarketPrices();
  const gold = market.get('gold24');
  // The feed's per-gram rate (displayed rates are per 10 gm).
  return {
    perGram: gold ? gold.pricePerGram : null,
    label: marketLabel(market).long.toLowerCase(),
  };
}

function RateUnavailable() {
  return <p className="rounded-card bg-cream p-4 font-sans text-sm text-muted">Market data is unavailable right now. Please ask us for today’s rate.</p>;
}

function OldGold() {
  const [grams, setGrams] = useState(20);
  const [karat, setKarat] = useState(22);
  const { perGram, label } = useGoldRate();
  if (!perGram) return <RateUnavailable />;
  const value = Math.round(grams * perGram * (karat / 24));
  return (
    <div className="space-y-4 p-6">
      <p className="font-sans text-sm text-muted">Estimate the exchange value of your old gold. Final value is assessed in store using our karatmeter.</p>
      <div className="grid grid-cols-2 gap-3">
        <label>
          <span className="mb-1.5 block font-sans text-xs uppercase tracking-wider text-muted">Weight (g)</span>
          <input type="number" min={1} value={grams} onChange={(e) => setGrams(Number(e.target.value))} className={field} />
        </label>
        <label>
          <span className="mb-1.5 block font-sans text-xs uppercase tracking-wider text-muted">Purity</span>
          <select value={karat} onChange={(e) => setKarat(Number(e.target.value))} className={field}>
            <option value={24}>24KT</option>
            <option value={22}>22KT</option>
            <option value={18}>18KT</option>
          </select>
        </label>
      </div>
      <p className="rounded-card bg-cream p-4 font-serif text-2xl text-heading">
        ₹{value.toLocaleString('en-IN')}
        <span className="block font-sans text-xs text-muted">Estimated value with 0% deduction ({label})</span>
      </p>
    </div>
  );
}

const views = {
  store: { title: 'Find a Store', Component: StoreLocator },
  appointment: { title: 'Book an Appointment', Component: Appointment },
  oldgold: { title: 'Old Gold Exchange', Component: OldGold },
};

export default function ServiceModal() {
  const { modal, closeModal } = useStore();
  const view = modal && views[modal.type];
  const Component = view?.Component;
  return (
    <Drawer open={Boolean(view)} onClose={closeModal} side="center" title={view?.title} labelledBy="service-title">
      {Component && <Component onDone={closeModal} />}
    </Drawer>
  );
}
