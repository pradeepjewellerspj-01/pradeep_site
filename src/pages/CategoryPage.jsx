import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import { products, productsForSlug, searchProducts } from '../data/products';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useContentVersion } from '../content/useContentVersion';
import { categoryLabel } from '../data/navigation';

const titleFromSlug = (slug) =>
  categoryLabel(slug) ??
  slug
    .split('-')
    .map((w) => (/^\d+k$/.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');

// Material filters, offered only when the current list contains them.
const MATERIALS = [
  { tag: 'gold', label: 'Gold' },
  { tag: 'diamond', label: 'Diamond' },
  { tag: 'gemstone', label: 'Gemstone' },
  { tag: 'silver', label: 'Silver' },
];

export default function CategoryPage({ mode = 'category' }) {
  const { slug = 'all-jewellery' } = useParams();
  const [params] = useSearchParams();
  const query = params.get('q') ?? '';
  // The material filter belongs to one page: opening another category starts at "All".
  const page = mode === 'search' ? `q:${query}` : slug;
  const [picked, setPicked] = useState({ page, tag: 'all' });
  const material = picked.page === page ? picked.tag : 'all';
  const setMaterial = (tag) => setPicked({ page, tag });

  const title = mode === 'search' ? `Results for “${query}”` : titleFromSlug(slug);
  useDocumentTitle(mode === 'search' ? `Search: ${query}` : titleFromSlug(slug));

  const version = useContentVersion(); // products edited in the admin panel arrive live
  const matched = useMemo(() => (mode === 'search' ? searchProducts(query) : productsForSlug(slug)), [mode, query, slug, version]);
  const base = matched.length ? matched : products;
  const filters = MATERIALS.filter((m) => m.tag !== slug && base.some((p) => p.tags.includes(m.tag)) && !base.every((p) => p.tags.includes(m.tag)));
  const active = filters.some((f) => f.tag === material) ? material : 'all';
  const list = active === 'all' ? base : base.filter((p) => p.tags.includes(active));

  return (
    <div className="container-x pb-20 pt-6 md:pt-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 font-sans text-xs text-muted">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="size-3" aria-hidden="true" />
        <span className="text-ink">{mode === 'search' ? 'Search' : titleFromSlug(slug)}</span>
      </nav>

      <header className="mt-6 flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="t-section text-heading">{title}</h1>
          <p className="t-subtitle mt-1">
            {matched.length ? `${matched.length} designs` : 'No exact matches. Showing all designs instead'}
          </p>
        </div>
        {filters.length > 1 && (
          <div role="group" aria-label="Filter by material" className="flex flex-wrap gap-2">
            {[{ tag: 'all', label: 'All' }, ...filters].map((f) => (
              <button
                key={f.tag}
                type="button"
                aria-pressed={active === f.tag}
                onClick={() => setMaterial(f.tag)}
                className={`rounded-full border px-4 py-1.5 font-sans text-[11px] uppercase tracking-[0.16em] transition-colors ${
                  active === f.tag ? 'border-ink bg-ink text-white' : 'border-border-strong text-muted hover:border-ink hover:text-ink'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
