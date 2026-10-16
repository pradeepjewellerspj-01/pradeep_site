import { useEffect, useState } from 'react';
import { api } from './api';
import { Button, ErrorBanner, Field, inputClass } from './ui';
import { RATE_KEYS, cleanSettings } from '../content/schema';
import { metalByKey, toPerGram } from '../market/marketConfig';
import { formatRupees } from '../market/useMarketPrices';

const round2 = (v) => Math.round(v * 100) / 100;
// Entered as quoted (gold and silver jewellery per 10 gm, silver 999 per kg), stored per gram.
const gramsOf = (k) => metalByKey[k].perGrams;
const toStored = (v, k) => Math.round((v / gramsOf(k)) * 1e6) / 1e6;

/** Today's IBJA rates per gram, for reference while setting showroom rates. */
function useIbjaPerGram() {
  const [ibja, setIbja] = useState(null);
  useEffect(() => {
    let alive = true;
    fetch('/api/rates')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d?.current) return;
        const out = {};
        for (const k of RATE_KEYS) if (d.current[k] != null) out[k] = Math.round(toPerGram(d.current[k], k === 'silver' ? d.units.silver : d.units.gold) * 100) / 100;
        // 20K is not published by IBJA: 999 × 0.833, as on the website.
        if (out.gold20 == null && d.current.gold24 != null) out.gold20 = Math.round(d.current.gold24 * metalByKey.gold20.purity) / 10;
        setIbja({ values: out, label: `${d.published.date} · ${d.published.session}` });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return ibja;
}

const when = (iso) => (iso ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '');

export default function RatesPanel({ settings, setSettings, notify, source }) {
  // Rates are entered as the showroom quotes them and stored per gram.
  const [rates, setRates] = useState(() => ({
    mode: settings.rates?.mode ?? 'ibja',
    note: settings.rates?.note ?? '',
    values: Object.fromEntries(RATE_KEYS.map((k) => [k, settings.rates?.values?.[k] > 0 ? String(round2(settings.rates.values[k] * gramsOf(k))) : ''])),
  }));
  const [errors, setErrors] = useState({});
  const [problem, setProblem] = useState(null);
  const [busy, setBusy] = useState(false);
  const ibja = useIbjaPerGram();
  const showroom = rates.mode === 'showroom';

  const setValue = (k, v) => setRates((r) => ({ ...r, values: { ...r.values, [k]: v } }));

  const save = async () => {
    const perGram = Object.fromEntries(RATE_KEYS.map((k) => [k, rates.values[k] === '' || rates.values[k] == null ? null : toStored(Number(rates.values[k]), k)]));
    const body = { contact: settings.contact, rates: { ...rates, values: perGram } };
    const { errors: local } = cleanSettings(body);
    setErrors(local ?? {});
    setProblem(null);
    if (local) return;
    setBusy(true);
    try {
      const saved = await api('settings', { method: 'PUT', body });
      setSettings(saved);
      notify(showroom ? 'Showroom rates are now on the website' : 'The website now shows IBJA rates');
    } catch (e) {
      setErrors(e.errors ?? {});
      setProblem(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="rates-title" className="max-w-3xl">
      <h2 id="rates-title" className="font-serif text-2xl text-heading">
        Gold &amp; silver rates
      </h2>
      <p className="font-sans text-[13px] text-muted">
        The rates in the top band, the showroom TV (/screen), the gold rate page and product pages. Gold and silver jewellery are entered and shown per 10 gm, silver 999 per kg.
      </p>

      <fieldset className="mt-5 grid gap-3 sm:grid-cols-2">
        <legend className="sr-only">Which rates to show</legend>
        {[
          [
            'ibja',
            'Market rates (automatic)',
            `From ${source?.host ?? 'ibjarates.com'}, fetched by the server at most every ${Math.round((source?.cacheSeconds ?? 300) / 60)} min and labelled “Indicative”. The source and interval are set in the hosting environment (RATES_API_URL, RATES_CACHE_SECONDS).`,
          ],
          ['showroom', 'Our showroom rates', 'The rates you enter below, labelled “Showroom rate” with the date you set them.'],
        ].map(([v, title, text]) => (
          <label
            key={v}
            className={`cursor-pointer rounded-xl border bg-white p-4 transition-colors ${rates.mode === v ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-border-strong'}`}
          >
            <span className="flex items-center gap-2.5">
              <input
                type="radio"
                name="rate-mode"
                value={v}
                checked={rates.mode === v}
                onChange={() => setRates((r) => ({ ...r, mode: v }))}
                className="accent-[var(--color-primary)]"
              />
              <span className="font-sans text-[14px] font-medium text-ink">{title}</span>
            </span>
            <span className="mt-1.5 block pl-6 font-sans text-[12.5px] text-muted">{text}</span>
          </label>
        ))}
      </fieldset>

      <div className={`mt-6 rounded-xl border border-border bg-white p-5 transition-opacity ${showroom ? '' : 'opacity-60'}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-serif text-lg text-heading">Showroom rates</h3>
          {settings.rates?.setAt && settings.rates.mode === 'showroom' && <p className="font-sans text-[12px] text-muted">Last set {when(settings.rates.setAt)}</p>}
        </div>
        <ErrorBanner>{errors['rates.values']}</ErrorBanner>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {RATE_KEYS.map((k) => (
            <Field
              key={k}
              label={`${metalByKey[k].label}${metalByKey[k].fineness ? ` · ${metalByKey[k].fineness}` : ''} · per ${metalByKey[k].unitLabel}`}
              hint={(() => {
                const entered = Number(rates.values[k]);
                const ref = ibja?.values[k] != null ? round2(ibja.values[k] * gramsOf(k)) : null;
                // A rate far from the market is usually a unit slip (per gram, or silver per kg).
                const far = ref && entered > 0 && Math.abs(entered - ref) / ref > 0.25;
                return (
                  <>
                    {ref != null && (
                      <>
                        IBJA today {formatRupees(ref, 0)} / {metalByKey[k].unitLabel}{metalByKey[k].calculated ? ' (999 × 0.833)' : ''}{' '}
                        <button type="button" className="text-primary underline underline-offset-2" onClick={() => setValue(k, String(Math.round(ref)))}>
                          use
                        </button>
                      </>
                    )}
                    {entered > 0 && <span> · {formatRupees(entered / gramsOf(k), 2)} per gram</span>}
                    {!(entered > 0) && (k === 'gold20' ? ' · Empty: 24K × 0.833' : ref == null ? 'Leave empty to not show this metal' : '')}
                    {far && <span className="block font-medium text-down">This is far from the market rate. Is it per {metalByKey[k].unitLabel}?</span>}
                  </>
                );
              })()}
            >
              {(p) => (
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-sans text-[14px] text-muted">₹</span>
                  <input
                    {...p}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    className={`${inputClass} pl-7`}
                    value={rates.values[k] ?? ''}
                    onChange={(e) => setValue(k, e.target.value === '' ? null : e.target.value)}
                    disabled={!showroom}
                  />
                </div>
              )}
            </Field>
          ))}
        </div>
        <Field label="Note shown with the rates" className="mt-4" error={errors['rates.note']} hint="Optional. Default: “Rates exclude GST and making charges.”">
          {(p) => <input {...p} className={inputClass} value={rates.note} onChange={(e) => setRates((r) => ({ ...r, note: e.target.value }))} disabled={!showroom} />}
        </Field>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button onClick={save} busy={busy}>
          Save rates
        </Button>
        <ErrorBanner>{problem}</ErrorBanner>
      </div>
    </section>
  );
}
