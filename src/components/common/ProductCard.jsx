import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import LikeButton from '../jewellery/LikeButton';
import ProductPhoto from './ProductPhoto';
import WhatsAppEnquiry from '../jewellery/WhatsAppEnquiry';
import { formatPrice, productCode, productPath, shownPrice, shownWeight } from '../../data/products';

export default function ProductCard({ product }) {
  return (
    <article className="group relative">
      <Link to={productPath(product)} className="block" aria-label={`View ${product.name}`}>
        {/* Square, the shape of the shop's product photos, so they fill the card without bands. */}
        <div className="relative aspect-square rounded-card">
          <ProductPhoto src={product.image} alt={product.name} loading="lazy" decoding="async" zoom className="absolute! inset-0 rounded-card" />
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-card ring-1 ring-inset ring-black/5" />
        </div>
      </Link>
      <LikeButton product={product} className="absolute right-2.5 top-2.5" />

      <div className="mt-3.5 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="line-clamp-1 font-serif text-[15px] leading-snug text-ink transition-colors group-hover:text-primary md:text-base">
            <Link to={productPath(product)}>{product.name}</Link>
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 font-sans text-[11px] uppercase tracking-[0.12em] text-muted">
            <span>{product.metal}</span>
            <span aria-hidden="true" className="h-2.5 w-px bg-border-strong" />
            <span className="tabular-nums text-subtle">{productCode(product)}</span>
            {shownWeight(product) && (
              <>
                <span aria-hidden="true" className="h-2.5 w-px bg-border-strong" />
                <span className="tabular-nums normal-case tracking-normal">{shownWeight(product)} g</span>
              </>
            )}
          </p>
          {shownPrice(product) && <p className="mt-1 font-sans text-[13.5px] tabular-nums text-ink">{formatPrice(shownPrice(product))}</p>}
        </div>
        <WhatsAppEnquiry products={product} variant="icon" className="-mr-1.5 -mt-1 shrink-0" />
      </div>

      <Link
        to={productPath(product)}
        tabIndex={-1}
        aria-hidden="true"
        className="mt-2.5 inline-flex items-center gap-1.5 border-b border-transparent pb-px font-sans text-[11px] uppercase tracking-[0.16em] text-ink transition-colors group-hover:border-primary/40 group-hover:text-primary"
      >
        View piece <ArrowRight className="size-3 transition-transform duration-500 group-hover:translate-x-0.5" strokeWidth={1.6} />
      </Link>
    </article>
  );
}
