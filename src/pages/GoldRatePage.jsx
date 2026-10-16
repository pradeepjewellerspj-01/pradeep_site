import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Phone } from 'lucide-react';
import RollingNumber from '../components/market/RollingNumber';
import MarketGraph from '../components/market/MarketGraph';
import { MarketStatus, PriceChange, RateSource } from '../components/market/MarketBits';
import WhatsAppEnquiry from '../components/jewellery/WhatsAppEnquiry';
import { contact } from '../data/footer';
import { formatAsOf, formatChangePct, formatRate, useMarketPrices } from '../market/useMarketPrices';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const DAYS_SHOWN = 15;
const day = (iso) => new Date(`${iso}T12:00:00+05:30`).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
const signed = (v) => `${v >= 0 ? '+' : '−'}${formatRate(Math.abs(v)).replace('₹', '₹')}`;

function useMetaDescription(text) {
  useEffect(() => {
    const tag = document.querySelector('meta[name="description"]');
    if (!tag) return undefined;
    const previous = tag.getAttribute('content');
    tag.setAttribute('content', text);
    return () => tag.setAttribute('content', previous);
  }, [text]);
}

/** Daily gold and silver rates per 10 gm, from the same live IBJA feed as the rest of the site. */
export default function GoldRatePage() {
  useDocumentTitle('Gold Rate Today');
  useMetaDescription('Today’s gold rate per 10 gm and silver rate per kg: 24K, 22K, 20K, 18K and silver 999, IBJA indicative rates with daily history. Pradeep Jewellers, Bhilai.');
  const market = useMarketPrices();
  const [key, setKey] = useState('gold24');
  // Showroom rates (set in the admin panel) have no published daily history.
  const showroomRates = market.mode === 'showroom';
  const charted = showroomRates ? [] : market.rows.filter((r) => r.history.length > 1);
  const selected = showroomRates ? null : (market.get(key) ?? charted[0]);

  // Newest first: date, rate and change from the previous session in the series.
  const daily = selected
    ? selected.history
        .map((v, i) => ({ date: selected.historyDates?.[i], value: v, change: i ? v - selected.history[i - 1] : null }))
        .filter((r) => r.date)
        .slice(-DAYS_SHOWN)
        .reverse()
    : [];
  const todayIso = market.asOf ? new Date(market.asOf.date).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) : null;
  const sessions = market.rows.filter((r) => r.sessions);

  return (
    <div className="container-x pb-20 pt-6 md:pt-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 font-sans text-xs text-muted">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="size-3" aria-hidden="true" />
        <span className="text-ink">Gold Rate Today</span>
      </nav>

      <header className="mt-6 flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-gold-deep">Daily rates · gold per 10 gm · silver per kg</p>
          <h1 className="t-section mt-2 text-heading">Today’s Gold &amp; Silver Rate</h1>
          <p className="t-subtitle mt-1">
            {showroomRates
              ? `Pradeep Jewellers showroom rates · set ${formatAsOf(market.asOf)}`
              : market.asOf
                ? `IBJA indicative rates · ${formatAsOf(market.asOf, true)}`
                : 'IBJA indicative rates'}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <MarketStatus market={market} className="text-muted" />
          <RateSource tone="light" placement="bottom" align="right" />
        </div>
      </header>

      {market.status === 'unavailable' || !market.rows.length ? (
        <p className="mt-10 font-sans text-sm text-muted">Today’s rates are unavailable right now. Please call the showroom on {contact.phone}.</p>
      ) : (
        <>
          {/* Today */}
          <section aria-labelledby="rates-today" className="mt-8">
            <h2 id="rates-today" className="sr-only">
              Today’s rates
            </h2>
            <ul className={`grid grid-cols-2 gap-3 md:gap-5 ${market.rows.length > 5 ? 'md:grid-cols-3' : market.rows.length > 4 ? 'md:grid-cols-3 xl:grid-cols-5' : 'lg:grid-cols-4'}`}>
              {market.rows.map((r) => (
                <li key={r.key} className="rounded-card border border-border bg-white p-4 md:p-6">
                  <p className="font-sans text-[10.5px] uppercase tracking-[0.2em] text-muted">
                    {r.label} {r.fineness && <span className="text-subtle">· {r.fineness}</span>}
                  </p>
                  <p className="mt-3 flex items-baseline gap-1.5 whitespace-nowrap">
                    <RollingNumber
                      value={r.price}
                      format={formatRate}
                      className={`font-sans ${market.rows.length > 4 ? 'text-[clamp(20px,1.75vw,25px)]' : 'text-[clamp(22px,2.4vw,32px)]'} font-light leading-none text-ink`}
                    />
                    <span className="font-sans text-xs text-muted">/ {r.unitLabel}</span>
                  </p>
                  {r.calculated && (
                    <p className="mt-1 font-sans text-[11px] text-subtle">
                      Calculated: {showroomRates ? '24K' : 'IBJA 999'} × {r.purity}
                      {showroomRates ? '' : ' (not published by IBJA)'}
                    </p>
                  )}
                  {r.change != null && (
                    <>
                      <p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-[12px]">
                        <PriceChange pct={r.changePct} />
                        <span className={r.change >= 0 ? 'text-up' : 'text-down'}>{signed(r.change)}</span>
                      </p>
                      <p className="mt-1 font-sans text-[11px] text-subtle">
                        {showroomRates ? 'Previous rate' : 'Prev. close'} {formatRate(r.prevClose)}
                      </p>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {/* Today's sessions */}
          {sessions.length > 0 && (
            <section aria-labelledby="sessions-title" className="mt-10">
              <h2 id="sessions-title" className="font-serif text-xl font-light text-heading">
                Today’s sessions
              </h2>
              <p className="mt-1 font-sans text-[13px] text-muted">IBJA publishes two rates on business days: an AM and a PM session.</p>
              <div className="mt-4 overflow-x-auto rounded-card border border-border">
                <table className="w-full min-w-[420px] font-sans text-[13.5px]">
                  <thead>
                    <tr className="bg-surface text-left text-[10.5px] uppercase tracking-[0.18em] text-muted">
                      <th scope="col" className="px-4 py-3 font-medium">
                        Metal
                      </th>
                      <th scope="col" className="px-4 py-3 text-right font-medium">
                        AM session
                      </th>
                      <th scope="col" className="px-4 py-3 text-right font-medium">
                        PM session
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((r) => (
                      <tr key={r.key} className="border-t border-border">
                        <th scope="row" className="px-4 py-3 text-left font-normal text-ink">
                          {r.label} <span className="text-subtle">· {r.fineness} · per {r.unitLabel}</span>
                          {r.calculated && <span className="text-subtle"> · calculated (999 × {r.purity})</span>}
                        </th>
                        <td className="px-4 py-3 text-right tabular-nums text-ink">{r.sessions.am != null ? formatRate(r.sessions.am) : '—'}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-ink">
                          {r.sessions.pm != null ? formatRate(r.sessions.pm) : <span className="text-subtle">Awaited</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Daily history */}
          {selected && (
            <section aria-labelledby="daily-title" className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
              <div>
                <h2 id="daily-title" className="font-serif text-xl font-light text-heading">
                  Daily rates
                </h2>
                <div role="tablist" aria-label="Choose a metal" className="mt-4 flex gap-6 border-b border-border">
                  {charted.map((r) => (
                    <button
                      key={r.key}
                      type="button"
                      role="tab"
                      aria-selected={selected.key === r.key}
                      onClick={() => setKey(r.key)}
                      className={`-mb-px border-b pb-3 font-sans text-[11px] uppercase tracking-[0.2em] transition-colors ${
                        selected.key === r.key ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                <p className="mt-5 font-sans text-[10.5px] uppercase tracking-[0.18em] text-subtle">{selected.historyLabel}</p>
                <MarketGraph
                  values={selected.history}
                  reference={selected.prevClose}
                  tone="light"
                  height={170}
                  className="mt-3"
                  label={`${selected.label} per ${selected.unitLabel}, ${selected.historyLabel}: from ${formatRate(selected.history[0])} to ${formatRate(selected.price)}`}
                />
                <dl className="mt-5 grid grid-cols-3 gap-3 border-y border-border py-4">
                  {selected.stats.map(({ label, value }) => (
                    <div key={label}>
                      <dt className="font-sans text-[10px] uppercase tracking-[0.18em] text-subtle">{label}</dt>
                      <dd className="mt-1 font-sans text-[13px] tabular-nums text-ink">{formatRate(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="overflow-hidden rounded-card border border-border" role="tabpanel" aria-label={`${selected.label} daily rates`}>
                <table className="w-full font-sans text-[13.5px]">
                  <caption className="bg-surface px-4 py-3 text-left text-[10.5px] uppercase tracking-[0.18em] text-muted">
                    {selected.label} · last {daily.length} sessions · per {selected.unitLabel}
                  </caption>
                  <thead className="sr-only">
                    <tr>
                      <th scope="col">Date</th>
                      <th scope="col">Rate per {selected.unitLabel}</th>
                      <th scope="col">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daily.map((d) => (
                      <tr key={d.date} className={`border-t border-border ${d.date === todayIso ? 'bg-cream' : ''}`}>
                        <th scope="row" className="px-4 py-2.5 text-left font-normal text-text">
                          {day(d.date)}
                          {d.date === todayIso && <span className="ml-2 font-sans text-[10px] uppercase tracking-[0.18em] text-gold-deep">Today</span>}
                        </th>
                        <td className="px-4 py-2.5 text-right tabular-nums text-ink">{formatRate(d.value)}</td>
                        <td className={`w-[96px] px-4 py-2.5 text-right tabular-nums text-[12px] ${d.change == null ? 'text-subtle' : d.change >= 0 ? 'text-up' : 'text-down'}`}>
                          {d.change == null ? '—' : formatChangePct((d.change / (d.value - d.change)) * 100)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}

      {/* Notes and next step */}
      <section className="mt-12 grid gap-6 rounded-card bg-cream p-6 md:grid-cols-[1.4fr_1fr] md:items-center md:p-8">
        <div className="font-sans text-[13px] leading-relaxed text-muted">
          <p className="font-serif text-lg text-heading">About these rates</p>
          <p className="mt-2">
            {showroomRates
              ? `These are our showroom’s selling rates (gold and silver jewellery per 10 gm, silver 999 per kg), as set by our team. ${market.source?.note ?? ''} The price of a finished piece is confirmed by our team in the showroom or on WhatsApp.`
              : 'These are the indicative retail selling rates published by the India Bullion and Jewellers Association (IBJA), shown per 10 gm for gold and per kg for silver. They exclude 3% GST and making charges, so the price of a finished piece is confirmed by our team in the showroom or on WhatsApp.'}
          </p>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <WhatsAppEnquiry products={[]} label="Ask today’s price on WhatsApp" className="w-full md:w-auto" ariaLabel="Ask today’s price on WhatsApp" />
          <a href={`tel:${contact.phoneTel}`} className="inline-flex items-center gap-2 font-sans text-[12px] uppercase tracking-[0.14em] text-muted hover:text-primary">
            <Phone className="size-3.5" strokeWidth={1.6} aria-hidden="true" /> Call the showroom · {contact.phone}
          </a>
        </div>
      </section>
    </div>
  );
}
