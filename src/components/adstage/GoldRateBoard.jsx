import RollingNumber from '../market/RollingNumber';
import { PriceChange } from '../market/MarketBits';
import { contact } from '../../data/footer';
import { metalByKey } from '../../market/marketConfig';
import { formatAsOf, formatRate, formatTime, marketLabel, useMarketPrices } from '../../market/useMarketPrices';

const ROWS = [
  { key: 'gold24', name: '24K Gold', fine: '999' },
  { key: 'gold22', name: '22K Gold', fine: '916' },
  { key: 'gold20', name: '20K Gold', fine: '833' },
  { key: 'gold18', name: '18K Gold', fine: '750' },
  { key: 'silver', name: 'Silver', fine: '999' },
  { key: 'silverJewellery', name: 'Silver jewellery', fine: '' },
];

// Whole rupees, as on a showroom rate board: gold and silver jewellery per 10 gm,
// silver 999 per kg (scaled from the per-gram feed by displayRate in useMarketPrices.js).
const unit = (rate) => `/ ${rate.unitLabel}`;

/** When the shown rates were published or set, and when this page last received them. */
function asOfLine(market) {
  const { mode, status, asOf, updatedAt } = market;
  if (mode === 'showroom') return `Set ${formatAsOf(asOf)} · ${formatTime(asOf?.date)}`;
  if (mode === 'demo') return 'Simulated for demonstration';
  const published = asOf ? `Published ${formatAsOf(asOf, true)}` : '';
  if (status === 'stale') return `${published} · last received ${formatTime(updatedAt)}`;
  return mode === 'live' && updatedAt ? `${published} · checked ${formatTime(updatedAt)}` : published;
}

/** "* 20K = 24K × 0.833" when a shown rate was calculated, not published or entered. */
function calculatedNote(rows, market) {
  const calc = rows.map((r) => market.get(r.key)).filter((rate) => rate?.calculated);
  const from = market.mode === 'showroom' ? '24K' : 'IBJA 999';
  return calc.length ? `* ${calc.map((r) => `${r.short} = ${from} × ${metalByKey[r.key].purity}`).join('; ')}` : null;
}

/**
 * Today's rates per 10 gm for the showroom screen (/screen), from the site's one
 * market feed (IBJA or the showroom's own rates; see marketService.js).
 *   variant 'list'  — the permanent price list beside the advertisements
 *   variant 'board' — the large rate presentation (a "Gold rates" advertisement)
 * Loading, unavailable and delayed states are always labelled, never shown as current.
 */
export default function GoldRateBoard({ variant = 'board', showSilver = true, className = '' }) {
  const market = useMarketPrices();
  const label = marketLabel(market);
  const showroom = market.mode === 'showroom';
  const rows = ROWS.filter((r) => (showSilver || metalByKey[r.key].metal !== 'silver') && market.get(r.key));
  const loading = market.status === 'loading';
  const unavailable = market.status === 'unavailable' || (!loading && !rows.length);
  const note = calculatedNote(rows, market);
  const fine = (r) => `${r.fine}${market.get(r.key)?.calculated ? '*' : ''}`;

  if (variant === 'list') {
    return (
      <section className={`ad-pl ${className}`} aria-label="Today’s gold and silver rates">
        {loading && <p className="ad-pl-note">Loading today’s rates…</p>}
        {unavailable && (
          <p className="ad-pl-note">
            Today’s rates are unavailable right now.
            <br />
            Please ask us on {contact.phone}.
          </p>
        )}
        {!loading && !unavailable && (
          <>
            <ul className="ad-pl-rows">
              {rows.map((r) => {
                const rate = market.get(r.key);
                const moved = rate.prevClose && Math.abs(rate.price - rate.prevClose) > 0.004;
                return (
                  <li key={r.key} className="ad-pl-row">
                    <span className="ad-pl-name">
                      {r.name}
                      <span className="ad-pl-fine">{fine(r)}</span>
                      {moved && <PriceChange pct={rate.changePct} className="ad-pl-change" />}
                    </span>
                    <span className="ad-pl-price">
                      <RollingNumber value={rate.price} format={formatRate} className="ad-pl-value" />
                      <span className="ad-pl-unit">{unit(rate)}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
            {/* The showroom's own rates need no footer; market rates always say where they come from. */}
            {(!showroom || note) && (
              <footer className="ad-pl-foot">
                {!showroom && (
                  <>
                    <span className={`ad-rates-tag ad-rates-tag--${label.tone}`}>{label.short} · market reference</span>
                    <span>{asOfLine(market)}</span>
                  </>
                )}
                {note && <span>{note}</span>}
              </footer>
            )}
          </>
        )}
      </section>
    );
  }

  return (
    <section className={`ad-rates ad-rates--${variant} ${className}`} aria-label="Today’s gold and silver rates" data-ad-in>
      <header className="ad-rates-head">
        <span className={`ad-rates-tag ad-rates-tag--${label.tone}`}>{showroom ? 'Today’s rate' : label.short}</span>
        <span className="ad-rates-unit">{rows.some((r) => r.key === 'silver') ? 'Gold per 10 gm · Silver per kg' : 'per 10 gm'}</span>
      </header>

      {loading && (
        <ul className="ad-rates-list" aria-busy="true">
          {ROWS.slice(0, 3).map((r) => (
            <li key={r.key} className="ad-rates-row">
              <span className="ad-rates-name">{r.name}</span>
              <span className="ad-rates-skel" aria-hidden="true" />
            </li>
          ))}
          <li className="sr-only">Loading today’s rates…</li>
        </ul>
      )}

      {unavailable && (
        <p className="ad-rates-empty">
          Today’s rates are unavailable right now.
          <span>Please ask us on {contact.phone}.</span>
        </p>
      )}

      {!loading && !unavailable && (
        <ul className="ad-rates-list">
          {rows.map((r) => {
            const rate = market.get(r.key);
            const moved = rate.prevClose && Math.abs(rate.price - rate.prevClose) > 0.004;
            return (
              <li key={r.key} className="ad-rates-row">
                <span className="ad-rates-name">
                  {r.name} <span className="ad-rates-fine">{fine(r)}</span>
                  {r.key === 'silverJewellery' && <span className="ad-rates-fine"> / 10 gm</span>}
                </span>
                <span className="ad-rates-value">
                  <RollingNumber value={rate.price} format={formatRate} />
                  {moved && <PriceChange pct={rate.changePct} className="ad-rates-change" />}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {!loading && !unavailable && (
        <footer className="ad-rates-foot">
          <span>{asOfLine(market)}</span>
          <span>
            {showroom ? 'Excluding making charges and taxes.' : `Market reference rate. ${market.source?.note ?? 'Rates exclude GST and making charges.'}`} Final price confirmed in the showroom.
          </span>
          {note && <span>{note}</span>}
        </footer>
      )}
    </section>
  );
}
