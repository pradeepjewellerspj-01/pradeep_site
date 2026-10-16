import { Link } from 'react-router-dom';
import { Heart, Phone } from 'lucide-react';
import Drawer from '../overlays/Drawer';
import WhatsAppEnquiry from './WhatsAppEnquiry';
import RollingNumber from '../market/RollingNumber';
import { MarketStatus, PriceChange } from '../market/MarketBits';
import { useJewellerySelection, useStore } from '../../context/StoreContext';
import { formatRate, useMarketPrices } from '../../market/useMarketPrices';
import { contact } from '../../data/footer';
import { productCode, productPath } from '../../data/products';

function MarketLine() {
  const market = useMarketPrices();
  const gold = market.get('gold24');
  if (!gold) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/70 px-6 py-3">
      <span className="flex items-center gap-2.5 font-sans text-[11px] uppercase tracking-[0.18em] text-muted">
        Gold 24K
        <RollingNumber value={gold.price} format={(v) => formatRate(v)} className="text-[12.5px] tracking-normal text-ink normal-case" />
        <span className="tracking-normal normal-case text-subtle">/ 10 gm</span>
        <PriceChange pct={gold.changePct} className="text-[10.5px] tracking-normal" />
      </span>
      <MarketStatus market={market} long={false} className="text-subtle" />
    </div>
  );
}

export default function SelectionDrawer() {
  const { panel, closePanel } = useStore();
  const { products, count, removeFromSelection, clearSelection } = useJewellerySelection();
  const open = panel === 'selection';

  return (
    <Drawer
      open={open}
      onClose={closePanel}
      title="My Selection"
      labelledBy="selection-title"
      widthClass="w-[min(440px,100vw)]"
      panelClass="bg-cream"
      footer={
        count > 0 && (
          <div>
            <p className="mb-3 font-sans text-[12px] leading-relaxed text-muted">
              We’ll reply on WhatsApp with price, availability and details. Nothing is sent until you press Send.
            </p>
            <WhatsAppEnquiry
              products={products}
              className="w-full"
              label={count === 1 ? 'Enquire about this piece' : `Enquire about these ${count} pieces`}
              ariaLabel={`Enquire about ${count} selected ${count === 1 ? 'piece' : 'pieces'} on WhatsApp`}
            />
            <div className="mt-3 flex items-center justify-between font-sans text-[12px] text-muted">
              <a href={`tel:${contact.phoneTel}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                <Phone className="size-3.5" strokeWidth={1.5} aria-hidden="true" /> Prefer to call? {contact.phone}
              </a>
              <button type="button" onClick={clearSelection} className="underline-offset-4 hover:text-primary hover:underline">
                Clear selection
              </button>
            </div>
          </div>
        )
      }
    >
      <MarketLine />
      <p className="px-6 pt-5 font-sans text-[11px] uppercase tracking-[0.24em] text-muted" aria-live="polite">
        {count} {count === 1 ? 'piece' : 'pieces'}
      </p>

      {count === 0 ? (
        <div className="flex flex-col items-center px-8 pb-16 pt-12 text-center">
          <span className="inline-flex size-14 items-center justify-center rounded-full border border-champagne text-gold">
            <Heart className="size-6" strokeWidth={1.2} aria-hidden="true" />
          </span>
          <p className="mt-5 font-serif text-xl text-heading">Your selection is empty</p>
          <p className="mt-2 max-w-[30ch] font-sans text-sm text-muted">Tap the ♡ on any piece to keep it here, then enquire about everything at once.</p>
          <Link
            to="/category/all-jewellery"
            onClick={closePanel}
            className="mt-7 rounded-full border border-ink/25 px-6 py-2.5 font-sans text-[12px] uppercase tracking-[0.16em] text-ink transition-colors hover:border-primary hover:text-primary"
          >
            Explore jewellery
          </Link>
        </div>
      ) : (
        <ol className="px-6 pb-4">
          {products.map((p, i) => (
            <li key={p.id} className="flex gap-4 border-b border-border/70 py-4 last:border-0">
              <span className="w-5 pt-1 font-sans text-[11px] tabular-nums text-subtle">{String(i + 1).padStart(2, '0')}</span>
              <Link to={productPath(p)} onClick={closePanel} className="shrink-0">
                <img src={p.image} alt="" className="h-[92px] w-[74px] rounded-[4px] bg-white object-cover" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={productPath(p)} onClick={closePanel} className="block font-serif text-[16px] leading-snug text-ink hover:text-primary">
                  {p.name}
                </Link>
                <p className="mt-1 font-sans text-[11px] uppercase tracking-[0.12em] text-muted">{p.metal}</p>
                <p className="mt-0.5 font-sans text-[11px] tabular-nums tracking-[0.12em] text-subtle">{productCode(p)}</p>
                <div className="mt-2 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => removeFromSelection(p.id)}
                    aria-label={`Remove ${p.name} from your selection`}
                    className="font-sans text-[11px] uppercase tracking-[0.14em] text-muted underline-offset-4 hover:text-primary hover:underline"
                  >
                    Remove
                  </button>
                  <WhatsAppEnquiry products={p} variant="link" label="Ask about this" ariaLabel={`Enquire about ${p.name} on WhatsApp`} />
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Drawer>
  );
}
