import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useContentVersion } from '../../content/useContentVersion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp } from 'lucide-react';
import { searchPlaceholder, searchSuggestions, toSlug } from '../../data/navigation';
import { productCode, searchProducts } from '../../data/products';

/**
 * Search pill + results. `variant="inline"` is the desktop header pill with a
 * dropdown; `variant="sheet"` is the full-width mobile search screen.
 */
export default function SearchBox({ variant = 'inline', autoFocus = false, onDone }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapper = useRef(null);
  const input = useRef(null);
  const listId = useId();
  const navigate = useNavigate();

  const version = useContentVersion();
  const results = useMemo(() => searchProducts(query).slice(0, 6), [query, version]); // eslint-disable-line react-hooks/exhaustive-deps
  const showPanel = variant === 'sheet' || open;

  useEffect(() => {
    if (autoFocus) input.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (variant !== 'inline') return undefined;
    const close = (e) => {
      if (!wrapper.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [variant]);

  const finish = () => {
    setOpen(false);
    setQuery('');
    input.current?.blur();
    onDone?.();
  };

  const submit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    finish();
  };

  const pill = variant === 'inline' ? 'h-11 search-field' : 'h-12 search-field';

  return (
    <div ref={wrapper} className="relative w-full">
      <form role="search" onSubmit={submit} className={`flex items-center gap-3 px-5 ${pill}`}>
        <Search aria-hidden="true" className="size-[15px] shrink-0 text-ink/55" strokeWidth={1.5} />
        <label htmlFor={`${listId}-input`} className="sr-only">
          Search Pradeep Jewellers
        </label>
        <input
          id={`${listId}-input`}
          ref={input}
          type="search"
          value={query}
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => e.key === 'Escape' && finish()}
          placeholder={searchPlaceholder}
          aria-controls={`${listId}-panel`}
          aria-expanded={showPanel}
          className="h-full min-w-0 flex-1 bg-transparent font-sans text-[13.5px] text-ink outline-none placeholder:text-subtle [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="rounded-full p-1 text-subtle hover:text-ink">
            <X className="size-3.5" />
          </button>
        )}
      </form>

      {showPanel && (
        <div
          id={`${listId}-panel`}
          className={
            variant === 'inline'
              ? 'absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-card border border-border bg-white p-5 shadow-[0_18px_50px_rgba(45,7,8,0.12)]'
              : 'mt-6'
          }
        >
          {!query && (
            <>
              <p className="t-eyebrow mb-3 flex items-center gap-2 text-muted">
                <TrendingUp className="size-3.5" aria-hidden="true" /> Popular searches
              </p>
              <ul className="flex flex-wrap gap-2">
                {searchSuggestions.map((s) => (
                  <li key={s}>
                    <Link
                      to={`/category/${toSlug(s)}`}
                      onClick={finish}
                      className="inline-block rounded-full border border-border px-3.5 py-1.5 font-sans text-[13px] text-ink transition-colors hover:border-primary hover:text-primary"
                    >
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          {query && results.length > 0 && (
            <>
              <p className="t-eyebrow mb-2 text-muted">Products</p>
              <ul className="divide-y divide-border">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link to={`/product/${p.id}`} onClick={finish} className="flex items-center gap-3 py-2.5 hover:text-primary">
                      <img src={p.image} alt="" className="size-12 rounded-md object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-serif text-[15px] text-ink">{p.name}</span>
                        <span className="block font-sans text-xs text-muted">{p.metal}</span>
                      </span>
                      <span className="font-sans text-[11px] tabular-nums tracking-[0.1em] text-subtle">{productCode(p)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={submit} className="mt-3 font-sans text-[13px] font-medium text-primary underline-offset-4 hover:underline">
                See all results for “{query}”
              </button>
            </>
          )}

          {query && results.length === 0 && (
            <p className="font-sans text-sm text-muted">
              No matches for “{query}”. Try <span className="text-ink">gold</span>, <span className="text-ink">diamond</span> or{' '}
              <span className="text-ink">earrings</span>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
