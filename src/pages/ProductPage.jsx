import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { BadgeCheck, ChevronRight, RefreshCcw } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import ProductPhoto from '../components/common/ProductPhoto';
import LikeButton from '../components/jewellery/LikeButton';
import WhatsAppEnquiry from '../components/jewellery/WhatsAppEnquiry';
import { GoogleIcon } from '../components/common/BrandIcons';
import { formatPrice, getProduct, productCode, productPath, products, shownPrice, shownWeight } from '../data/products';
import { googleReviewUrl } from '../data/footer';
import { useJewellerySelection } from '../context/StoreContext';
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

export default function ProductPage() {
  const { id } = useParams();
  const product = getProduct(id);
  const { products: selected, isSelected } = useJewellerySelection();
  useDocumentTitle(product?.name);
  useMetaDescription(product ? `${product.name} in ${product.metal} (${productCode(product)}) from Pradeep Jewellers. Save it to your selection or enquire on WhatsApp.` : null);

  if (!product) return <NotFound />;
  // An old tag number: show the piece at its current address.
  if (product.id !== id) return <Navigate to={productPath(product)} replace />;
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
          <ProductPhoto src={product.image} alt={product.name} fetchPriority="high" className="h-full w-full" />
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
          {product.description && <p className="mt-4 max-w-prose font-sans text-[14.5px] leading-relaxed text-text">{product.description}</p>}

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-y border-border py-4 font-sans sm:grid-cols-3">
            {[
              ['Tag no.', productCode(product)],
              ['Metal', product.metal],
              ...(shownWeight(product) ? [['Weight', `approx. ${shownWeight(product)} g`]] : []),
              ...(shownPrice(product) ? [['Price', formatPrice(shownPrice(product))]] : []),
            ].map(([term, value]) => (
              <div key={term}>
                <dt className="text-[10.5px] uppercase tracking-[0.2em] text-muted">{term}</dt>
                <dd className="mt-0.5 text-[14px] tabular-nums text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 font-sans text-xs text-muted">
            {shownPrice(product)
              ? 'The final price follows the day’s metal rate and is confirmed by our team on WhatsApp.'
              : 'For price and availability, message us on WhatsApp.'}
          </p>

          <div className="mt-6 flex gap-3">
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

          <a
            href={googleReviewUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 font-sans text-[13px] text-muted transition-colors hover:text-primary"
          >
            <GoogleIcon className="size-4" />
            <span>
              Visited us? <span className="underline underline-offset-4">Rate us on Google</span>
            </span>
          </a>
          <Link to="/reviews" className="ml-4 mt-4 inline-flex font-sans text-[13px] text-muted underline underline-offset-4 transition-colors hover:text-primary">
            Read customer reviews
          </Link>

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
