import { useMemo, useState } from 'react';
import { EyeOff, Pencil, Plus, Search } from 'lucide-react';
import { api, watermarkCopy } from './api';
import { Button, Dialog, ErrorBanner, Field, PhotoInput, Toggle, inputClass } from './ui';
import { METAL_OPTIONS, cleanProduct, slugify } from '../content/schema';
import { primaryNav } from '../data/navigation';
import { formatPrice } from '../data/products';
import { resolveImage } from '../data/images';
import CategoriesCard, { categoriesOf } from './CategoriesCard';

// Tags the site's menus link to, offered first so new pieces appear in the right places.
const MENU_TAGS = [...new Set(primaryNav.flatMap((n) => [n.slug, ...(n.menu ?? []).flatMap((g) => g.links.map((l) => l.slug))]))].filter(
  (t) => !['all-jewellery', 'under-50k'].includes(t),
);

const nextCode = (products) => {
  const n = Math.max(1000, ...products.map((p) => Number(/^pj-(\d+)$/.exec(p.id)?.[1] ?? 0)));
  return `pj-${n + 1}`;
};

/** Whether visitors see a field (price, weight) on the product page and cards. */
function ShowOnSite({ checked, onChange }) {
  return (
    <label className="mt-2 flex cursor-pointer items-center gap-2 font-sans text-[12.5px] text-ink">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-primary" />
      Show on website
    </label>
  );
}

/** One button per category: a piece can be in several (e.g. Earrings and Bridal). */
function CategoryPicker({ categories, value, onChange, error }) {
  const toggle = (slug) => onChange(value.includes(slug) ? value.filter((t) => t !== slug) : [...value, slug]);
  return (
    <fieldset>
      <legend className="mb-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Category</legend>
      <div className="flex flex-wrap gap-1.5" data-category-picker>
        {categories.map((c) => {
          const on = value.includes(c.slug);
          return (
            <button
              key={c.slug}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(c.slug)}
              className={`rounded-full border px-3 py-1.5 font-sans text-[13px] transition-colors ${
                on ? 'border-primary bg-primary text-white' : 'border-border-strong bg-white text-ink hover:border-primary hover:text-primary'
              }`}
            >
              {on ? '✓ ' : ''}
              {c.label}
            </button>
          );
        })}
      </div>
      <p className={`mt-1.5 font-sans text-[12px] ${error ? 'text-down' : 'text-subtle'}`}>
        {error || 'Where the piece appears in the “All Jewellery” menu. New categories: “Edit categories” on the Products page.'}
      </p>
    </fieldset>
  );
}

function TagsInput({ value, onChange, suggestions, error }) {
  const [draft, setDraft] = useState('');
  const add = (t) => {
    const tag = slugify(t);
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft('');
  };
  const rest = suggestions.filter((s) => !value.includes(s));
  return (
    <Field label="Other tags" error={error} hint="Optional: metal, occasion and style (gold, diamond, wedding, gifting…). Used by the menus, filters and search.">
      {({ id, ...aria }) => (
        <div>
          <div className={`flex flex-wrap gap-1.5 rounded-lg border bg-white p-2 ${error ? 'border-down' : 'border-border-strong'}`}>
            {value.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-full bg-blush px-2.5 py-1 font-sans text-[12.5px] text-ink">
                {t}
                <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Remove ${t}`} className="text-muted hover:text-down">
                  ×
                </button>
              </span>
            ))}
            <input
              id={id}
              {...aria}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  add(draft);
                } else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
              }}
              onBlur={() => draft && add(draft)}
              placeholder={value.length ? 'Add another…' : 'e.g. earrings, gold, wedding'}
              className="min-w-[140px] flex-1 px-1.5 py-1 font-sans text-[14px] outline-none"
            />
          </div>
          {rest.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {rest.slice(0, 24).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => add(s)}
                  className="rounded-full border border-border px-2.5 py-0.5 font-sans text-[12px] text-muted hover:border-primary hover:text-primary"
                >
                  + {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </Field>
  );
}

function ProductForm({ initial, isNew, allTags, categories, onSaved, onDeleted, onClose }) {
  const categorySlugs = categories.map((c) => c.slug);
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [problem, setProblem] = useState(null);
  const [busy, setBusy] = useState(null);
  const set = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v?.target ? v.target.value : v }));
    setErrors((e) => (e[k] ? { ...e, [k]: null } : e)); // a corrected field drops its message
  };

  const save = async () => {
    const { errors: local } = cleanProduct(form);
    setErrors(local ?? {});
    setProblem(null);
    if (local) return;
    setBusy('save');
    try {
      // An edit goes to the piece's current code; a changed code in the form renames it.
      const saved = await api(isNew ? 'products' : `products/${encodeURIComponent(initial.id)}`, { method: isNew ? 'POST' : 'PUT', body: form });
      onSaved(saved, isNew, initial.id);
    } catch (e) {
      setErrors(e.errors ?? {});
      setProblem(e.message);
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete “${form.name}” (${initial.id.toUpperCase()})? This cannot be undone. To take it off the site for now, use “Hide from the website” instead.`)) return;
    setBusy('delete');
    try {
      await api(`products/${encodeURIComponent(initial.id)}`, { method: 'DELETE' });
      onDeleted(initial.id);
    } catch (e) {
      setProblem(e.message);
      setBusy(null);
    }
  };

  return (
    <Dialog
      open
      title={isNew ? 'Add a piece' : `Edit ${initial.id.toUpperCase()}`}
      onClose={onClose}
      footer={
        <>
          <Button onClick={save} busy={busy === 'save'} disabled={Boolean(busy)}>
            {isNew ? 'Add to website' : 'Save changes'}
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={Boolean(busy)}>
            Cancel
          </Button>
          {!isNew && (
            <Button variant="danger" className="ml-auto" onClick={remove} busy={busy === 'delete'} disabled={Boolean(busy)}>
              Delete
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-5">
        <ErrorBanner>{problem}</ErrorBanner>
        <div className="grid gap-5 sm:grid-cols-[220px_1fr]">
          {/* Photos uploaded here are watermarked in the browser (api.js uploadPhoto). */}
          {/* The website shows product photos whole (components/common/ProductPhoto.jsx), so the watermark can use the full photo. */}
          <PhotoInput value={form.image} onChange={(v) => (set('image')(v), set('watermarked')(Boolean(v)))} error={errors.image} fit="contain" />
          <div className="space-y-4">
            <Field label="Name" error={errors.name}>
              {(p) => <input {...p} className={inputClass} value={form.name} onChange={set('name')} placeholder="e.g. Kundan Flower Studs" />}
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Tag no. / code"
                error={errors.id}
                hint={`Shown to customers as ${(form.id || 'pj-…').toUpperCase()}${!isNew && form.id !== initial.id ? `. Links shared with the old code keep working` : ''}`}
              >
                {(p) => <input {...p} className={inputClass} value={form.id} onChange={(e) => set('id')(e.target.value.toLowerCase().replace(/\s+/g, '-'))} />}
              </Field>
              <div>
                <Field label="Price (₹)" error={errors.price} hint={!errors.price ? 'Optional' : undefined}>
                  {(p) => <input {...p} className={inputClass} type="number" inputMode="numeric" min="0" value={form.price ?? ''} onChange={set('price')} />}
                </Field>
                <ShowOnSite checked={form.showPrice} onChange={set('showPrice')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Metal" error={errors.metal}>
                {(p) => (
                  <>
                    <input {...p} className={inputClass} list="pj-metals" value={form.metal} onChange={set('metal')} placeholder="Choose or type" />
                    <datalist id="pj-metals">
                      {METAL_OPTIONS.map((m) => (
                        <option key={m} value={m} />
                      ))}
                    </datalist>
                  </>
                )}
              </Field>
              <div>
                <Field label="Weight (g)" error={errors.weight} hint={!errors.weight ? 'Optional' : undefined}>
                  {(p) => <input {...p} className={inputClass} type="number" inputMode="decimal" min="0" step="0.001" value={form.weight ?? ''} onChange={set('weight')} />}
                </Field>
                <ShowOnSite checked={form.showWeight} onChange={set('showWeight')} />
              </div>
            </div>
          </div>
        </div>
        <CategoryPicker
          categories={categories}
          value={form.tags.filter((t) => categorySlugs.includes(t))}
          onChange={(picked) => set('tags')([...picked, ...form.tags.filter((t) => !categorySlugs.includes(t))])}
          error={errors.tags}
        />
        <TagsInput
          value={form.tags.filter((t) => !categorySlugs.includes(t))}
          onChange={(other) => set('tags')([...form.tags.filter((t) => categorySlugs.includes(t)), ...other])}
          suggestions={allTags.filter((t) => !categorySlugs.includes(t))}
        />
        <Field label="Description" error={errors.description} hint="Optional. Shown on the product page.">
          {(p) => <textarea {...p} rows={3} className={inputClass} value={form.description ?? ''} onChange={set('description')} />}
        </Field>
        <Toggle
          checked={form.hidden}
          onChange={set('hidden')}
          label="Hide from the website"
          description="For pieces that are sold or not on display. You can show them again any time."
        />
      </div>
    </Dialog>
  );
}

/** Stamps the watermark on photos added before watermarking existed, one piece at a time. */
function WatermarkOldPhotos({ products, setProducts, notify }) {
  const pending = products.filter((p) => !p.watermarked && p.image);
  const [progress, setProgress] = useState(null); // { done, total, failed }
  if (!pending.length && !progress) return null;

  const run = async () => {
    if (!window.confirm(`Add the watermark to ${pending.length} older photos? A watermarked copy replaces each photo on the website.`)) return;
    let failed = 0;
    for (const [i, p] of pending.entries()) {
      setProgress({ done: i, total: pending.length, failed });
      try {
        const image = await watermarkCopy(resolveImage(p.image));
        const saved = await api(`products/${encodeURIComponent(p.id)}`, { method: 'PUT', body: { ...p, image, watermarked: true } });
        setProducts((list) => list.map((x) => (x.id === p.id ? saved : x)));
      } catch {
        failed += 1;
      }
    }
    setProgress(null);
    notify(failed ? `${pending.length - failed} photos watermarked, ${failed} could not be` : 'All photos are watermarked', failed ? 'error' : 'ok');
  };

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-champagne bg-cream px-4 py-3">
      <p className="font-sans text-[13px] text-ink">
        {progress ? `Watermarking photo ${progress.done + 1} of ${progress.total}… keep this page open.` : `${pending.length} older ${pending.length === 1 ? 'photo has' : 'photos have'} no watermark yet.`}
      </p>
      <Button variant="outline" busy={Boolean(progress)} onClick={run}>
        Watermark them now
      </Button>
    </div>
  );
}

export default function ProductsPanel({ products, setProducts, settings, setSettings, notify }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [category, setCategory] = useState('all'); // 'all' | a category slug | 'none'
  const categories = categoriesOf(settings);
  const labelOf = (slug) => categories.find((c) => c.slug === slug)?.label;
  const [editing, setEditing] = useState(null); // { product, isNew }
  const [busyId, setBusyId] = useState(null);

  const allTags = useMemo(() => [...new Set([...MENU_TAGS, ...products.flatMap((p) => p.tags)])], [products]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const inCategory = (p) =>
      category === 'all' || (category === 'none' ? !categories.some((c) => p.tags.includes(c.slug)) : p.tags.includes(category));
    return products.filter(
      (p) =>
        (filter === 'all' || (filter === 'hidden' ? p.hidden : !p.hidden)) &&
        inCategory(p) &&
        (!q || p.name.toLowerCase().includes(q) || p.id.includes(q) || p.metal.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q))),
    );
  }, [products, query, filter, category, categories]);

  const toggleHidden = async (p) => {
    setBusyId(p.id);
    try {
      const saved = await api(`products/${encodeURIComponent(p.id)}`, { method: 'PUT', body: { ...p, hidden: !p.hidden } });
      setProducts((list) => list.map((x) => (x.id === p.id ? saved : x)));
      notify(saved.hidden ? 'Hidden from the website' : 'Shown on the website');
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const hiddenCount = products.filter((p) => p.hidden).length;

  return (
    <section aria-labelledby="products-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="products-title" className="font-serif text-2xl text-heading">
            Products
          </h2>
          <p className="font-sans text-[13px] text-muted">
            {products.length} pieces · {products.length - hiddenCount} on the website{hiddenCount ? ` · ${hiddenCount} hidden` : ''}
          </p>
        </div>
        <Button
          onClick={() =>
            setEditing({
              isNew: true,
              product: {
                id: nextCode(products),
                name: '',
                price: '',
                metal: '22KT Yellow Gold',
                weight: '',
                image: '',
                tags: category !== 'all' && category !== 'none' ? [category] : [],
                description: '',
                hidden: false,
                showPrice: false,
                showWeight: false,
              },
            })
          }
        >
          <Plus className="size-4" /> Add a piece
        </Button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <label className="relative min-w-[220px] flex-1">
          <span className="sr-only">Search products</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, code, metal or tag" className={`${inputClass} pl-9`} />
        </label>
        <div role="group" aria-label="Show" className="flex rounded-lg border border-border-strong bg-white p-0.5">
          {[
            ['all', 'All'],
            ['visible', 'On website'],
            ['hidden', 'Hidden'],
          ].map(([v, l]) => (
            <button
              key={v}
              type="button"
              aria-pressed={filter === v}
              onClick={() => setFilter(v)}
              className={`rounded-md px-3 py-1.5 font-sans text-[12.5px] ${filter === v ? 'bg-ink text-white' : 'text-muted hover:text-ink'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <WatermarkOldPhotos products={products} setProducts={setProducts} notify={notify} />

      <CategoriesCard settings={settings} setSettings={setSettings} products={products} filter={category} setFilter={setCategory} notify={notify} />

      <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-white">
        {shown.map((p) => (
          <li key={p.id} className={`flex items-center gap-3 px-3 py-2.5 sm:gap-4 sm:px-4 ${p.hidden ? 'bg-surface' : ''}`}>
            <img src={resolveImage(p.image)} alt="" loading="lazy" className={`size-14 shrink-0 rounded-md object-cover ${p.hidden ? 'opacity-50 grayscale' : ''}`} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-sans text-[14px] text-ink">
                {p.name}
                {p.hidden && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-border px-2 py-0.5 align-middle text-[10.5px] uppercase tracking-wider text-muted">
                    <EyeOff className="size-3" aria-hidden="true" /> Hidden
                  </span>
                )}
              </p>
              <p className="truncate font-sans text-[12px] text-muted">
                {p.id.toUpperCase()} · {p.metal}
                {p.weight ? ` · ${p.weight} g${p.showWeight === true ? '' : ' (hidden)'}` : ''}
                {(() => {
                  const names = p.tags.map(labelOf).filter(Boolean);
                  return names.length ? <span className="text-primary"> · {names.join(', ')}</span> : <span className="text-subtle"> · No category</span>;
                })()}
              </p>
            </div>
            <p className="hidden shrink-0 text-right font-sans text-[13.5px] tabular-nums text-ink sm:block">
              {p.price != null ? formatPrice(p.price) : <span className="text-subtle">No price</span>}
              {p.price != null && <span className={`block text-[11px] ${p.showPrice ? 'text-up' : 'text-subtle'}`}>{p.showPrice ? 'Shown on website' : 'Hidden'}</span>}
            </p>
            <Button variant="ghost" className="px-3!" busy={busyId === p.id} onClick={() => toggleHidden(p)}>
              {p.hidden ? 'Show' : 'Hide'}
            </Button>
            <Button
              variant="outline"
              className="px-3!"
              onClick={() =>
                setEditing({
                  isNew: false,
                  product: { ...p, price: p.price ?? '', weight: p.weight ?? '', description: p.description ?? '', showPrice: Boolean(p.showPrice), showWeight: p.showWeight === true },
                })
              }
              aria-label={`Edit ${p.name}`}
            >
              <Pencil className="size-3.5" /> <span className="max-sm:hidden">Edit</span>
            </Button>
          </li>
        ))}
        {!shown.length && <li className="px-4 py-10 text-center font-sans text-[13px] text-muted">No pieces match.</li>}
      </ul>

      {editing && (
        <ProductForm
          key={editing.product.id}
          initial={editing.product}
          isNew={editing.isNew}
          allTags={allTags}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={(saved, isNew, previousId) => {
            setProducts((list) => (isNew ? [saved, ...list] : list.map((x) => (x.id === previousId ? saved : x))));
            // The server moved reels linked to a renamed piece; keep this copy in step.
            if (!isNew && saved.id !== previousId && settings.styling?.some((r) => r.productId === previousId)) {
              setSettings({ ...settings, styling: settings.styling.map((r) => (r.productId === previousId ? { ...r, productId: saved.id } : r)) });
            }
            setEditing(null);
            notify(isNew ? 'Added to the website' : saved.id !== previousId ? `Saved as ${saved.id.toUpperCase()}` : 'Saved');
          }}
          onDeleted={(id) => {
            setProducts((list) => list.filter((x) => x.id !== id));
            setEditing(null);
            notify('Deleted');
          }}
        />
      )}
    </section>
  );
}
