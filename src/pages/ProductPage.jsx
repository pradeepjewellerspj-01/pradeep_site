import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BadgeCheck, ChevronRight, RefreshCcw } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import LikeButton from '../components/jewellery/LikeButton';
import WhatsAppEnquiry from '../components/jewellery/WhatsAppEnquiry';
import RollingNumber from '../components/market/RollingNumber';
import { MarketStatus, PriceChange } from '../components/market/MarketBits';
import { formatPrice, getProduct, marketKeyForMetal, productCode, products } from '../data/products';
import { useJewellerySelection } from '../context/StoreContext';
import { formatRate, useMarketPrices } from '../market/useMarketPrices';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import NotFound from './NotFound';

const promises = [
  { icon: BadgeCheck, text: 'BIS hallmarked & certified' },
  { icon: RefreshCcw, text: 'Lifetime exchange' },
];

const titleCase = (slug) => slug.replace(/-/g, ' ');

function useMetaDescription(text) {
  useEffect(() => {
    const tag = document.querySelector('meta[name="description"]');
    if (!tag || !text) return undefined;
    const previous = tag.getAttribute('content');
    tag.setAttribute('content', text);
    return () => tag.setAttribute('content', previous);
  }, [text]);
}

/** Today's reference rate for the piece's metal: the market → jewellery link. */
function MetalRate({ metal }) {
  const market = useMarketPrices();
  const key = marketKeyForMetal(metal);
  const rate = (key === 'silver' && market.get('silverJewellery')) || market.get(key);
  if (!rate) return null;
  return (
    <div className="mt-6 rounded-card border border-champagne/70 bg-cream px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-sans text-[10.5px] uppercase tracking-[0.2em] text-muted">Today’s {rate.label} rate</p>
        <MarketStatus market={market} long={false} className="text-subtle" />
      </div>
      <p className="mt-1.5 flex items-baseline gap-3">
        <RollingNumber value={rate.price} format={(v) => formatRate(v)} className="font-sans text-xl font-light text-ink" />
        <span className="font-sans text-xs text-muted">/ {rate.unitLabel}</span>
        <PriceChange pct={rate.changePct} className="text-[11px]" />
      </p>
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const product = getProduct(id);
  const { products: selected, isSelected } = useJewellerySelection();
  useDocumentTitle(product?.name);
  useMetaDescription(product ? `${product.name} in ${product.metal} (${productCode(product)}) from Pradeep Jewellers. Save it to your selection or enquire on WhatsApp.` : null);

  if (!product) return <NotFound />;
  const related = products.filter((p) => p.id !== product.id && p.tags.some((t) => product.tags.includes(t))).slice(0, 4);
  // With other pieces saved, offer to enquire about the whole selection together.
  const withSelection = isSelected(product.id) ? selected : [...selected, product];

  return (
    <div className="container-x pb-20 pt-6 md:pt-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 font-sans text-xs text-muted">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="size-3" aria-hidden="true" />
        <Link to={`/category/${product.tags[0]}`} className="capitalize hover:text-primary">
          {titleCase(product.tags[0])}
        </Link>
        <ChevronRight className="size-3" aria-hidden="true" />
        <span className="line-clamp-1 text-ink">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 md:grid-cols-[1.15fr_1fr] md:gap-12 lg:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-surface md:sticky md:top-32 md:self-start">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" fetchPriority="high" />
        </div>

        <div className="md:pt-6">
          <p className="flex flex-wrap items-center gap-x-3 font-sans text-[11px] uppercase tracking-[0.2em] text-muted">
            <Link to={`/category/${product.tags[0]}`} className="hover:text-primary">
              {titleCase(product.tags[0])}
            </Link>
            <span aria-hidden="true" className="h-3 w-px bg-border-strong" />
            <span className="tabular-nums">{productCode(product)}</span>
          </p>
          <h1 className="mt-3 font-serif text-3xl font-light leading-tight text-heading md:text-[42px]">{product.name}</h1>
          <p className="mt-2 t-eyebrow text-primary">
            {product.metal}
            {product.weight ? <span className="text-muted"> · approx. {product.weight} g</span> : null}
          </p>
          {product.description && <p className="mt-4 max-w-prose font-sans text-[14.5px] leading-relaxed text-text">{product.description}</p>}

          <p className="mt-6 font-sans text-[11px] uppercase tracking-[0.2em] text-muted">Indicative price</p>
          <p className="mt-1 font-sans text-2xl font-light text-ink">{formatPrice(product.price)}</p>
          <p className="mt-1 font-sans text-xs text-muted">The final price follows the day’s metal rate and is confirmed by our team when you enquire.</p>

          <MetalRate metal={product.metal} />

          <div className="mt-8 flex gap-3">
            <WhatsAppEnquiry products={product} className="flex-1" label="Ask about this piece on WhatsApp" />
            <LikeButton product={product} variant="outline" />
          </div>
          {selected.length > 0 && withSelection.length > 1 && (
            <WhatsAppEnquiry
              products={withSelection}
              variant="outline"
              className="mt-3 w-full"
              label={`Enquire with my selection (${withSelection.length})`}
              ariaLabel={`Enquire about this piece together with your selection, ${withSelection.length} pieces, on WhatsApp`}
            />
          )}

          <ul className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-6">
            {promises.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2 font-sans text-[13px] text-text">
                <Icon className="size-4 shrink-0 text-gold" strokeWidth={1.5} aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20" aria-labelledby="related-title">
          <p className="t-eyebrow text-center text-gold-deep">Complete the selection</p>
          <h2 id="related-title" className="t-section mt-2 text-center text-heading">
            You may also like
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
