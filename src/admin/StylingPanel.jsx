import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, CheckCircle2, ChevronDown, ExternalLink, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { api } from './api';
import { Button, ErrorBanner, Field, PhotoInput, inputClass } from './ui';
import { MAX_REELS, cleanSettings, reelCode } from '../content/schema';
import { InstagramIcon } from '../components/common/BrandIcons';
import { categoriesOf } from './CategoriesCard';
import { resolveImage } from '../data/images';

const card = 'rounded-xl border border-border bg-white';
const plain = (list) => (list ?? []).map((r) => ({ url: r.url, title: r.title ?? '', cover: r.cover ?? '', productId: r.productId ?? '' }));
// Each row keeps one key while its link is edited (a key from the link would remount it on every keystroke).
let seq = 0;
const withKeys = (list) => list.map((r) => ({ ...r, key: ++seq }));
const strip = (list) => list.map(({ key, ...r }) => r);
const embedUrl = (code) => `https://www.instagram.com/reel/${code}/embed/`;

/** Products for the picker, grouped by category (a piece in several shows under the first). */
function productGroups(products, categories) {
  const listed = products.filter((p) => !p.hidden).sort((a, b) => a.name.localeCompare(b.name));
  const groups = categories.map((c) => ({ label: c.label, items: [] }));
  const other = { label: 'Other pieces', items: [] };
  for (const p of listed) {
    const i = categories.findIndex((c) => p.tags.includes(c.slug));
    (i >= 0 ? groups[i] : other).items.push(p);
  }
  return [...groups, other].filter((g) => g.items.length);
}

/** The card as it will look on the home page: cover, or the Instagram-style card. */
function CardThumb({ reel }) {
  const src = reel.cover ? resolveImage(reel.cover) : null;
  return (
    <div className="relative aspect-[9/16] w-[72px] shrink-0 overflow-hidden rounded-md bg-[linear-gradient(160deg,#3a1f2b,#1a1013_55%,#2b1a0f)]">
      {src ? <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <InstagramIcon className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-white/80" aria-hidden="true" />}
    </div>
  );
}

function ReelRow({ reel, index, total, errors, groups, onChange, onMove, onRemove, open, onToggle }) {
  const [preview, setPreview] = useState(false);
  const code = reelCode(reel.url);
  const urlError = errors[`styling.${index}.url`] || (reel.url.trim() && !code ? 'This is not an Instagram reel link' : null);
  const title = reel.title || (code ? 'Untitled reel' : 'New reel');

  return (
    <li data-reel-row className={`${card} ${urlError ? 'border-down/50' : ''}`}>
      {/* Summary: always visible, click to open */}
      <div className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
        <CardThumb reel={reel} />
        <button type="button" onClick={onToggle} aria-expanded={open} className="min-w-0 flex-1 text-left">
          <span className="block font-sans text-[11px] uppercase tracking-[0.18em] text-subtle">Reel {index + 1}</span>
          <span className="mt-0.5 block truncate font-serif text-[17px] text-heading">{title}</span>
          <span className={`mt-0.5 flex items-center gap-1 truncate font-sans text-[12px] ${urlError ? 'text-down' : code ? 'text-up' : 'text-subtle'}`}>
            {urlError ? urlError : code ? <><CheckCircle2 className="size-3.5 shrink-0" /> instagram.com/reel/{code}</> : 'Paste a reel link'}
          </span>
        </button>
        <div className="flex shrink-0 items-center">
          <button type="button" disabled={index === 0} onClick={() => onMove(-1)} aria-label={`Move reel ${index + 1} up`} className="rounded-full p-2 text-muted hover:bg-cream disabled:opacity-30">
            <ArrowUp className="size-4" />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => onMove(1)}
            aria-label={`Move reel ${index + 1} down`}
            className="rounded-full p-2 text-muted hover:bg-cream disabled:opacity-30"
          >
            <ArrowDown className="size-4" />
          </button>
          <button type="button" onClick={onRemove} aria-label={`Remove reel ${index + 1}`} className="rounded-full p-2 text-muted hover:bg-blush hover:text-down">
            <Trash2 className="size-4" />
          </button>
          <button type="button" onClick={onToggle} aria-label={open ? `Close reel ${index + 1}` : `Edit reel ${index + 1}`} className="rounded-full p-2 text-muted hover:bg-cream">
            <ChevronDown className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {open && (
        <div className="grid gap-5 border-t border-border p-4 sm:p-5 md:grid-cols-[1fr_auto]">
          <div className="grid content-start gap-3">
            <Field label="Instagram reel link" error={urlError}>
              {(p) => (
                <input
                  {...p}
                  type="url"
                  className={inputClass}
                  value={reel.url}
                  onChange={(e) => onChange('url', e.target.value)}
                  // Tidy a pasted share link (…/reel/CODE/?igsh=…) into its plain form.
                  onBlur={() => code && onChange('url', `https://www.instagram.com/reel/${code}/`)}
                  placeholder="https://www.instagram.com/reel/…"
                />
              )}
            </Field>
            <Field label="Title" error={errors[`styling.${index}.title`]} hint={`${reel.title.length}/90 · shown on the card and under it, e.g. “Statement diamonds for the reception”`}>
              {(p) => <input {...p} maxLength={90} className={inputClass} value={reel.title} onChange={(e) => onChange('title', e.target.value)} placeholder="What the reel shows" />}
            </Field>
            <Field label="Piece shown with the reel (optional)" error={errors[`styling.${index}.productId`]} hint="A tap on it opens the piece.">
              {(p) => (
                <select {...p} className={inputClass} value={reel.productId} onChange={(e) => onChange('productId', e.target.value)}>
                  <option value="">None</option>
                  {groups.map((g) => (
                    <optgroup key={g.label} label={g.label}>
                      {g.items.map((pr) => (
                        <option key={pr.id} value={pr.id}>
                          {pr.name} · {pr.id.toUpperCase()}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              )}
            </Field>

            {code && (
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" onClick={() => setPreview((v) => !v)} aria-expanded={preview}>
                  {preview ? <EyeOff className="size-4" /> : <Eye className="size-4" />} {preview ? 'Hide preview' : 'Preview the reel'}
                </Button>
                <a href={`https://www.instagram.com/reel/${code}/`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-sans text-[12.5px] text-primary hover:underline">
                  Open on Instagram <ExternalLink className="size-3" />
                </a>
              </div>
            )}
            {code && preview && (
              <div className="w-full max-w-[400px] overflow-hidden rounded-lg border border-border bg-white">
                <iframe data-reel-preview key={code} src={embedUrl(code)} title={`Preview: ${title}`} loading="lazy" className="block h-[620px] w-full border-0" allow="autoplay; encrypted-media; picture-in-picture" />
                <p className="border-t border-border px-3 py-2 font-sans text-[11.5px] text-muted">
                  If Instagram shows “link may be broken”, the reel is private, removed, or the link is wrong.
                </p>
              </div>
            )}
          </div>

          <div className="w-[150px] max-md:w-[130px]">
            <PhotoInput label="Card cover (optional)" aspect="aspect-[9/16]" value={reel.cover} error={errors[`styling.${index}.cover`]} onChange={(v) => onChange('cover', v)} />
            <p className="mt-1 font-sans text-[11.5px] leading-snug text-subtle">A screenshot of the reel works well.</p>
          </div>
        </div>
      )}
    </li>
  );
}

/**
 * "Styling 101 With Diamonds" on the home page: paste the links of Instagram
 * reels; they replace the photo stories, in this order, and play in
 * Instagram's own player. With no reels, the bundled photo stories show.
 */
export default function StylingPanel({ settings, setSettings, products, notify }) {
  const saved = plain(settings.styling);
  const [reels, setReels] = useState(() => withKeys(saved));
  const [open, setOpen] = useState(null); // index of the reel being edited
  const [draft, setDraft] = useState('');
  const [draftError, setDraftError] = useState(null);
  const [errors, setErrors] = useState({});
  const [problem, setProblem] = useState(null);
  const [busy, setBusy] = useState(false);
  const dirty = JSON.stringify(strip(reels)) !== JSON.stringify(saved);
  const groups = productGroups(products, categoriesOf(settings));

  // Leaving with unsaved reels asks first.
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const setReel = (i, k, v) => setReels((list) => list.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const move = (i, step) => {
    setReels((list) => {
      const next = [...list];
      [next[i], next[i + step]] = [next[i + step], next[i]];
      return next;
    });
    if (open === i) setOpen(i + step);
    else if (open === i + step) setOpen(i);
  };
  const remove = (i) => {
    setReels((list) => list.filter((_, j) => j !== i));
    setErrors({});
    setOpen((o) => (o === i ? null : o > i ? o - 1 : o));
  };

  // Quick add: paste a link, press Add; the new reel opens for its title.
  const add = () => {
    const code = reelCode(draft);
    if (!code) return setDraftError('Paste the link of an Instagram reel (instagram.com/reel/…)');
    if (reels.some((r) => reelCode(r.url) === code)) return setDraftError('This reel is already in the list');
    setReels((list) => [...list, ...withKeys([{ url: `https://www.instagram.com/reel/${code}/`, title: '', cover: '', productId: '' }])]);
    setOpen(reels.length);
    setDraft('');
    setDraftError(null);
  };

  const save = async () => {
    const body = { contact: settings.contact, rates: settings.rates, styling: strip(reels) };
    const { errors: local } = cleanSettings(body);
    setErrors(local ?? {});
    setProblem(null);
    if (local) {
      const first = Object.keys(local).map((k) => /^styling\.(\d+)\./.exec(k)?.[1]).find((x) => x != null);
      if (first != null) setOpen(Number(first));
      return;
    }
    setBusy(true);
    try {
      const next = await api('settings', { method: 'PUT', body });
      setSettings(next);
      setReels(withKeys(plain(next.styling)));
      notify(reels.length ? 'Reels saved' : 'Reels removed. The photo stories show again.');
    } catch (e) {
      setErrors(e.errors ?? {});
      setProblem(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="styling-title" className="max-w-3xl space-y-5">
      <div>
        <h2 id="styling-title" className="font-serif text-2xl text-heading">
          Styling 101 reels
        </h2>
        <p className="font-sans text-[13px] text-muted">
          Reels show on the home page in “Styling 101 With Diamonds”, in this order, and play when a visitor opens them. With no reels, the photo stories show.
        </p>
      </div>

      {/* Quick add. noValidate: a link without https:// is fine, reelCode() checks it. */}
      <form
        noValidate
        className={`${card} p-4 sm:p-5`}
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <label htmlFor="reel-quick-add" className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          Add a reel
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            id="reel-quick-add"
            type="url"
            className={`${inputClass} min-w-[220px] flex-1`}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setDraftError(null);
            }}
            placeholder="Paste the reel link here"
            disabled={reels.length >= MAX_REELS}
          />
          <Button type="submit" disabled={!draft.trim() || reels.length >= MAX_REELS}>
            <Plus className="size-4" /> Add reel
          </Button>
        </div>
        <p className={`mt-2 font-sans text-[12px] ${draftError ? 'text-down' : 'text-subtle'}`}>
          {draftError || `Instagram app → the reel → Share → Copy link. The reel must be public. ${reels.length} of ${MAX_REELS}.`}
        </p>
      </form>

      <ErrorBanner>{errors.styling}</ErrorBanner>
      {!reels.length && (
        <p className={`${card} flex items-center gap-3 p-5 font-sans text-[13.5px] text-muted`}>
          <InstagramIcon className="size-5 shrink-0 text-subtle" aria-hidden="true" /> No reels yet. The home page shows the photo stories.
        </p>
      )}

      <ol className="space-y-3">
        {reels.map((r, i) => (
          <ReelRow
            key={r.key}
            reel={r}
            index={i}
            total={reels.length}
            errors={errors}
            groups={groups}
            open={open === i}
            onToggle={() => setOpen((o) => (o === i ? null : i))}
            onChange={(k, v) => setReel(i, k, v)}
            onMove={(step) => move(i, step)}
            onRemove={() => remove(i)}
          />
        ))}
      </ol>

      <p className="font-sans text-[12px] text-subtle">
        Tip: add a cover. Instagram does not share reel thumbnails with other websites, so without one the card shows the Instagram logo and the title.
      </p>

      {/* Save bar: stays in view while there are unsaved changes */}
      <div className={`sticky bottom-3 z-10 flex flex-wrap items-center gap-3 rounded-xl p-3 transition-colors ${dirty ? 'border border-primary/30 bg-white shadow-lg' : ''}`}>
        <Button onClick={save} busy={busy} disabled={!dirty && !Object.keys(errors).length}>
          Save reels
        </Button>
        {dirty && <span className="font-sans text-[12.5px] text-primary">Unsaved changes</span>}
        <ErrorBanner>{problem || (Object.keys(errors).some((k) => k.startsWith('styling.')) ? 'Please check the highlighted reel' : null)}</ErrorBanner>
      </div>
    </section>
  );
}
