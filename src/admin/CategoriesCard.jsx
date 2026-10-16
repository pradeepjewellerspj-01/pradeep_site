import { useState } from 'react';
import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from './api';
import { Button, ErrorBanner, inputClass } from './ui';
import { MAX_CATEGORIES, cleanSettings, slugify } from '../content/schema';
import { BUNDLED_CATEGORIES } from '../data/navigation';

const chip = (on) =>
  `inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-sans text-[12.5px] transition-colors ${
    on ? 'border-ink bg-ink text-white' : 'border-border-strong bg-white text-muted hover:border-ink hover:text-ink'
  }`;

/** The saved categories, or the ones bundled with the site. */
export const categoriesOf = (settings) => settings?.categories ?? BUNDLED_CATEGORIES;

/**
 * Categories: the "All Jewellery" menu and category pages. The chips filter
 * the product list; "Edit categories" adds, renames, reorders and removes them.
 * A category's link (its slug) never changes on rename, so its pieces stay in it.
 */
export default function CategoriesCard({ settings, setSettings, products, filter, setFilter, notify }) {
  const saved = categoriesOf(settings);
  const [editing, setEditing] = useState(false);
  const [list, setList] = useState(saved);
  const [draft, setDraft] = useState('');
  const [errors, setErrors] = useState({});
  const [problem, setProblem] = useState(null);
  const [busy, setBusy] = useState(false);

  const count = (slug) => products.filter((p) => p.tags.includes(slug)).length;
  const uncategorised = products.filter((p) => !saved.some((c) => p.tags.includes(c.slug))).length;
  const dirty = JSON.stringify(list) !== JSON.stringify(saved);

  const open = () => {
    setList(saved);
    setErrors({});
    setProblem(null);
    setEditing(true);
  };
  const add = () => {
    const label = draft.trim();
    if (!label) return;
    const slug = slugify(label);
    if (list.some((c) => c.slug === slug)) {
      setErrors({ draft: 'This category is already in the list' });
      return;
    }
    setList((l) => [...l, { label, slug }]);
    setDraft('');
    setErrors({});
  };
  const rename = (i, label) => setList((l) => l.map((c, j) => (j === i ? { ...c, label } : c)));
  const move = (i, step) =>
    setList((l) => {
      const next = [...l];
      [next[i], next[i + step]] = [next[i + step], next[i]];
      return next;
    });
  const remove = (i) => {
    const c = list[i];
    const n = count(c.slug);
    if (n && !window.confirm(`Remove “${c.label}”? Its ${n} piece${n > 1 ? 's stay' : ' stays'} on the website, but the category leaves the menu.`)) return;
    setList((l) => l.filter((_, j) => j !== i));
  };

  const save = async () => {
    const body = { contact: settings.contact, rates: settings.rates, categories: list };
    const { errors: local } = cleanSettings(body);
    setErrors(local ?? {});
    setProblem(null);
    if (local) return;
    setBusy(true);
    try {
      const next = await api('settings', { method: 'PUT', body });
      setSettings(next);
      setEditing(false);
      if (filter !== 'all' && filter !== 'none' && !next.categories.some((c) => c.slug === filter)) setFilter('all');
      notify('Categories saved');
    } catch (e) {
      setErrors(e.errors ?? {});
      setProblem(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!editing) {
    return (
      <div className="mt-5 rounded-xl border border-border bg-white p-4" data-categories>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-sans text-[11px] uppercase tracking-[0.2em] text-muted">Categories</h3>
          <button type="button" onClick={open} className="inline-flex items-center gap-1.5 font-sans text-[13px] text-primary hover:underline">
            <Pencil className="size-3.5" /> Edit categories
          </button>
        </div>
        <div role="group" aria-label="Filter by category" className="mt-3 flex flex-wrap gap-1.5">
          <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')} className={chip(filter === 'all')}>
            All <span className="opacity-60">{products.length}</span>
          </button>
          {saved.map((c) => (
            <button key={c.slug} type="button" aria-pressed={filter === c.slug} onClick={() => setFilter(c.slug)} className={chip(filter === c.slug)}>
              {c.label} <span className="opacity-60">{count(c.slug)}</span>
            </button>
          ))}
          {uncategorised > 0 && (
            <button type="button" aria-pressed={filter === 'none'} onClick={() => setFilter('none')} className={chip(filter === 'none')}>
              No category <span className="opacity-60">{uncategorised}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-xl border border-primary/40 bg-white p-5 ring-1 ring-primary/15" data-categories-editor>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-serif text-lg text-heading">Edit categories</h3>
        <p className="font-sans text-[12px] text-muted">
          {list.length} of {MAX_CATEGORIES}
        </p>
      </div>
      <p className="mt-1 font-sans text-[12.5px] text-muted">
        Shown in the website’s “All Jewellery” menu in this order. A category appears there once a piece on the website is in it. Renaming keeps its pieces.
      </p>
      <ErrorBanner>{errors.categories}</ErrorBanner>

      <ol className="mt-4 space-y-2">
        {list.map((c, i) => {
          const n = count(c.slug);
          const error = errors[`categories.${i}.label`];
          return (
            <li key={c.slug} data-category-row className="flex items-center gap-2">
              <span className="w-6 shrink-0 text-right font-sans text-[12px] tabular-nums text-subtle">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <input
                  aria-label={`Name of category ${i + 1}`}
                  aria-invalid={Boolean(error)}
                  className={`${inputClass} ${error ? 'border-down' : ''}`}
                  value={c.label}
                  maxLength={40}
                  onChange={(e) => rename(i, e.target.value)}
                />
                {error && <p className="mt-1 font-sans text-[12px] text-down">{error}</p>}
              </div>
              <span className={`hidden w-28 shrink-0 font-sans text-[12px] sm:block ${n ? 'text-muted' : 'text-subtle'}`} title={`/category/${c.slug}`}>
                {n ? `${n} piece${n > 1 ? 's' : ''}` : 'No pieces yet'}
              </span>
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move ${c.label} up`} className="rounded-full p-2 text-muted hover:bg-cream disabled:opacity-30">
                <ArrowUp className="size-4" />
              </button>
              <button
                type="button"
                disabled={i === list.length - 1}
                onClick={() => move(i, 1)}
                aria-label={`Move ${c.label} down`}
                className="rounded-full p-2 text-muted hover:bg-cream disabled:opacity-30"
              >
                <ArrowDown className="size-4" />
              </button>
              <button type="button" onClick={() => remove(i)} aria-label={`Remove ${c.label}`} className="rounded-full p-2 text-muted hover:bg-blush hover:text-down">
                <Trash2 className="size-4" />
              </button>
            </li>
          );
        })}
      </ol>

      <form
        className="mt-4 flex flex-wrap items-start gap-2 border-t border-border pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <div className="min-w-[200px] flex-1">
          <input
            aria-label="New category"
            className={inputClass}
            value={draft}
            maxLength={40}
            onChange={(e) => {
              setDraft(e.target.value);
              if (errors.draft) setErrors((x) => ({ ...x, draft: null }));
            }}
            placeholder="New category, e.g. Mangalsutra"
            disabled={list.length >= MAX_CATEGORIES}
          />
          {errors.draft && <p className="mt-1 font-sans text-[12px] text-down">{errors.draft}</p>}
        </div>
        <Button type="submit" variant="outline" disabled={!draft.trim() || list.length >= MAX_CATEGORIES}>
          <Plus className="size-4" /> Add
        </Button>
      </form>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button onClick={save} busy={busy} disabled={!dirty}>
          <Check className="size-4" /> Save categories
        </Button>
        <Button variant="ghost" onClick={() => setEditing(false)} disabled={busy}>
          Cancel
        </Button>
        <ErrorBanner>{problem || (Object.keys(errors).some((k) => k.startsWith('categories.')) ? 'Please check the highlighted names' : null)}</ErrorBanner>
      </div>
    </div>
  );
}
