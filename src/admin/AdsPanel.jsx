import { lazy, Suspense, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, Film, ImagePlus, Loader2, Monitor, Pencil, Plus, X } from 'lucide-react';
import { api, uploadPhoto, uploadVideo } from './api';
import { Button, Dialog, ErrorBanner, Field, PhotoInput, Toggle, inputClass } from './ui';
import { AD_TYPES, cleanAd, cleanSettings, slugify } from '../content/schema';
import { applyAds, bundledAds, playableAds } from '../data/ads';
import { indiaToday } from '../data/promotions';
import { primaryNav } from '../data/navigation';
import { resolveImage } from '../data/images';

// The same component the showroom TV plays (/screen), for previews.
const AdStage = lazy(() => import('../components/adstage/AdStage'));

const TYPE_LABEL = { brand: 'Brand intro', image: 'Image', video: 'Video', rates: 'Gold rates', campaign: 'Offer campaign' };
const TYPE_HINT = {
  brand: 'Your logo and tagline on a dark stage. A background is optional.',
  image: 'A photograph with a headline. Landscape photos fill the screen; portrait photos are framed.',
  video: 'A muted video loop. Upload up to 3 MB, or paste an https link to a longer MP4.',
  rates: 'A large rate board as its own advertisement. Today’s price list is always shown beside every advertisement anyway.',
  campaign: 'Shows an offer from the Offers tab, only while that offer is live.',
};
const LINKS = [
  ['', 'No button'],
  ['/category/all-jewellery', 'All jewellery'],
  ...primaryNav.filter((n) => n.slug !== 'all-jewellery').map((n) => [`/category/${n.slug}`, n.label]),
  ['/category/gifting', 'Gifting'],
  ['/gold-rate', 'Gold rate today'],
];
const isVideo = (src) => /\.(mp4|webm)(\?|$)/i.test(src ?? '');

const fmt = (d) => (d ? new Date(`${d}T12:00:00+05:30`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
function status(ad, today) {
  if (!ad.enabled) return { label: 'Off', cls: 'bg-border text-muted' };
  if (ad.startDate && today < ad.startDate) return { label: `Starts ${fmt(ad.startDate)}`, cls: 'bg-gold-soft/40 text-gold-deep' };
  if (ad.endDate && today > ad.endDate) return { label: 'Ended', cls: 'bg-border text-muted' };
  return { label: 'Playing', cls: 'bg-up/15 text-up' };
}

/** Image or video for an advertisement: upload, or paste an https link. */
function MediaInput({ value, onChange, error, kind }) {
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);
  const input = useRef(null);
  const src = value ? resolveImage(value) : null;
  const video = kind === 'video' || isVideo(src);

  const pick = async (file) => {
    if (!file) return;
    setBusy(true);
    setProblem(null);
    try {
      onChange(file.type.startsWith('video/') ? await uploadVideo(file) : await uploadPhoto(file, { maxEdge: 3200 }));
    } catch (e) {
      setProblem(e.message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <Field
      label={kind === 'video' ? 'Video' : 'Background image'}
      error={problem || error}
      hint={kind === 'video' ? 'MP4 or WebM, muted. Up to 3 MB here; paste a link for longer videos.' : 'Landscape, at least 2400 px wide, looks best on large screens.'}
    >
      {({ id }) => (
        <div className="space-y-2">
          <div className={`relative aspect-video w-full max-w-[420px] overflow-hidden rounded-lg border border-dashed ${error ? 'border-down' : 'border-border-strong'} bg-stage`}>
            {src &&
              (video ? (
                <video src={src} muted playsInline loop autoPlay className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ))}
            <label
              htmlFor={id}
              className={`absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-1.5 font-sans text-[12.5px] transition-colors ${src ? 'text-transparent hover:bg-black/50 hover:text-white' : 'text-ivory/70 hover:text-white'}`}
            >
              {busy ? (
                <Loader2 className="size-6 animate-spin text-champagne" />
              ) : kind === 'video' ? (
                <Film className="size-6" strokeWidth={1.4} />
              ) : (
                <ImagePlus className="size-6" strokeWidth={1.4} />
              )}
              {busy ? 'Uploading…' : src ? 'Replace' : kind === 'video' ? 'Upload a video' : 'Upload an image'}
              <input
                ref={input}
                id={id}
                type="file"
                accept={kind === 'video' ? 'video/mp4,video/webm' : 'image/jpeg,image/png,image/webp'}
                className="sr-only"
                disabled={busy}
                onChange={(e) => pick(e.target.files?.[0])}
              />
            </label>
            {src && !busy && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 text-muted shadow hover:text-down"
                aria-label="Remove"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <input
            aria-label="Or paste an https link"
            className={`${inputClass} max-w-[420px]`}
            placeholder="…or paste an https:// link"
            value={value?.startsWith('https://') ? value : ''}
            onChange={(e) => onChange(e.target.value.trim() || null)}
          />
        </div>
      )}
    </Field>
  );
}

function Preview({ items, onClose }) {
  return (
    <Dialog open title="Preview" onClose={onClose} wide>
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-stage">
        {items.length ? (
          <Suspense fallback={<Loader2 className="m-auto mt-20 size-7 animate-spin text-champagne" />}>
            <AdStage items={items} preview />
          </Suspense>
        ) : (
          <p className="flex h-full items-center justify-center font-sans text-[14px] text-ivory/70">
            Nothing would play: check that it is switched on, inside its dates, and (for a campaign) that its offer is live.
          </p>
        )}
      </div>
      <p className="mt-3 font-sans text-[12px] text-muted">This is how it plays on the showroom TV at /screen. The website itself never shows it.</p>
    </Dialog>
  );
}

function AdForm({ initial, isNew, promotions, onSaved, onDeleted, onClose, onPreview }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [problem, setProblem] = useState(null);
  const [busy, setBusy] = useState(null);
  const set = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v?.target ? (v.target.type === 'checkbox' ? v.target.checked : v.target.value) : v }));
    setErrors((e) => (e[k] ? { ...e, [k]: null } : e));
  };
  const body = () => ({ ...form, id: isNew ? slugify(form.id || `${form.type}-${form.title || form.eyebrow || Date.now().toString(36)}`).slice(0, 50) : form.id });

  const save = async () => {
    const draft = body();
    const { errors: local } = cleanAd(draft);
    setErrors(local ?? {});
    setProblem(null);
    if (local) return;
    setBusy('save');
    try {
      const saved = await api(isNew ? 'ads' : `ads/${encodeURIComponent(form.id)}`, { method: isNew ? 'POST' : 'PUT', body: draft });
      onSaved(saved, isNew);
    } catch (e) {
      setErrors(e.errors ?? {});
      setProblem(e.errors?.id ? 'An advertisement with this name exists. Change the headline.' : e.message);
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this advertisement? To pause it instead, switch it off.')) return;
    setBusy('delete');
    try {
      await api(`ads/${encodeURIComponent(form.id)}`, { method: 'DELETE' });
      onDeleted(form.id);
    } catch (e) {
      setProblem(e.message);
      setBusy(null);
    }
  };

  const t = form.type;
  return (
    <Dialog
      open
      title={isNew ? 'New advertisement' : 'Edit advertisement'}
      onClose={onClose}
      footer={
        <>
          <Button onClick={save} busy={busy === 'save'} disabled={Boolean(busy)}>
            {isNew ? 'Add to the screen' : 'Save changes'}
          </Button>
          <Button variant="outline" onClick={() => onPreview(body())} disabled={Boolean(busy)}>
            <Eye className="size-4" /> Preview
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
        <fieldset>
          <legend className="mb-1.5 font-sans text-[11.5px] font-medium uppercase tracking-[0.12em] text-muted">Type</legend>
          <div className="flex flex-wrap gap-2">
            {AD_TYPES.map((type) => (
              <label
                key={type}
                className={`cursor-pointer rounded-full border px-3 py-1.5 font-sans text-[13px] ${t === type ? 'border-primary bg-blush text-ink' : 'border-border text-muted hover:text-ink'}`}
              >
                <input type="radio" name="ad-type" className="sr-only" checked={t === type} onChange={() => set('type')(type)} />
                {TYPE_LABEL[type]}
              </label>
            ))}
          </div>
          <p className="mt-2 font-sans text-[12.5px] text-muted">{TYPE_HINT[t]}</p>
        </fieldset>

        {t === 'campaign' && (
          <Field label="Offer" error={errors.promotionId}>
            {(p) => (
              <select {...p} className={inputClass} value={form.promotionId ?? ''} onChange={set('promotionId')}>
                <option value="">Choose…</option>
                <option value="auto">Whichever offer is live (highest priority)</option>
                {promotions.map((pr) => (
                  <option key={pr.id} value={pr.id}>
                    {pr.occasion} — {pr.title}
                    {pr.enabled ? '' : ' (off)'}
                  </option>
                ))}
              </select>
            )}
          </Field>
        )}

        {t !== 'brand' && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Small heading" error={errors.eyebrow} hint={t === 'campaign' ? 'Empty: from the offer' : 'e.g. The bridal edit'}>
                {(p) => <input {...p} className={inputClass} value={form.eyebrow} onChange={set('eyebrow')} />}
              </Field>
              <Field label="Headline" error={errors.title} hint={t === 'campaign' ? 'Empty: from the offer' : undefined}>
                {(p) => <input {...p} className={inputClass} value={form.title} onChange={set('title')} />}
              </Field>
            </div>
            <Field label="Description" error={errors.description} hint="Optional. One line. Only state what the showroom offers.">
              {(p) => <textarea {...p} rows={2} className={inputClass} value={form.description} onChange={set('description')} />}
            </Field>
          </>
        )}
        {t === 'brand' && (
          <Field label="Line under the logo" error={errors.description} hint="e.g. Gold, silver and diamond jewellery">
            {(p) => <input {...p} className={inputClass} value={form.description} onChange={set('description')} />}
          </Field>
        )}

        <MediaInput kind={t === 'video' ? 'video' : 'image'} value={form.media} onChange={set('media')} error={errors.media} />
        {t === 'video' && (
          <PhotoInput
            label="Poster image (shown until the video plays)"
            value={form.poster ?? ''}
            onChange={(v) => set('poster')(v || null)}
            error={errors.poster}
            aspect="aspect-video"
          />
        )}

        {t !== 'brand' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Button text" error={errors.cta} hint="Optional">
              {(p) => <input {...p} className={inputClass} value={form.cta} onChange={set('cta')} placeholder="e.g. Explore gold" />}
            </Field>
            <Field label="Button opens" error={errors.href}>
              {(p) => (
                <select {...p} className={inputClass} value={LINKS.some(([h]) => h === form.href) ? form.href : form.href ? form.href : ''} onChange={set('href')}>
                  {LINKS.map(([href, label]) => (
                    <option key={href || 'none'} value={href}>
                      {label}
                    </option>
                  ))}
                  {form.href && !LINKS.some(([h]) => h === form.href) && <option value={form.href}>{form.href}</option>}
                </select>
              )}
            </Field>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="On screen (seconds)" error={errors.duration} hint={t === 'video' && form.advanceOnEnd ? 'Used if the video cannot play' : '3 to 120'}>
            {(p) => <input {...p} type="number" min="3" max="120" className={inputClass} value={form.duration} onChange={set('duration')} />}
          </Field>
          <Field label="Starts" error={errors.startDate} hint="Empty: now">
            {(p) => <input {...p} type="date" className={inputClass} value={form.startDate ?? ''} onChange={set('startDate')} />}
          </Field>
          <Field label="Ends (last day)" error={errors.endDate} hint="Empty: no end">
            {(p) => <input {...p} type="date" className={inputClass} value={form.endDate ?? ''} onChange={set('endDate')} />}
          </Field>
        </div>

        <div className="space-y-3">
          {t === 'video' && (
            <Toggle checked={form.advanceOnEnd} onChange={set('advanceOnEnd')} label="Move on when the video ends" description="Off: the video loops for the seconds above." />
          )}
          <Toggle checked={form.enabled} onChange={set('enabled')} label="Play on the screen" />
        </div>
      </div>
    </Dialog>
  );
}

/** Logo, tagline and silver on the showroom TV. */
function ScreenBranding({ settings, setSettings, notify }) {
  const [sc, setSc] = useState(() => ({ tagline: '', logo: null, showSilver: true, ...settings.screen }));
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const save = async () => {
    const body = { contact: settings.contact, rates: settings.rates, screen: sc };
    const { errors: local } = cleanSettings(body);
    setErrors(local ?? {});
    if (local) return;
    setBusy(true);
    try {
      setSettings(await api('settings', { method: 'PUT', body }));
      notify('Screen branding saved');
    } catch (e) {
      setErrors(e.errors ?? { general: e.message });
    } finally {
      setBusy(false);
    }
  };
  return (
    <details className="group rounded-xl border border-border bg-white">
      <summary className="cursor-pointer list-none px-5 py-4 font-serif text-lg text-heading">
        Screen branding <span className="font-sans text-[12.5px] text-muted">· logo, tagline, silver rate</span>
      </summary>
      <div className="grid gap-5 border-t border-border px-5 py-5 sm:grid-cols-[220px_1fr]">
        <PhotoInput
          label="Logo (optional)"
          watermark={false}
          value={sc.logo ?? ''}
          onChange={(v) => setSc((s) => ({ ...s, logo: v || null }))}
          error={errors['screen.logo']}
          aspect="aspect-square"
        />
        <div className="space-y-4">
          <p className="font-sans text-[12.5px] text-muted">
            Without an uploaded logo, the screen uses the PJ monogram with प्रदीप JEWELLERS, as on the website. A logo with a transparent background (PNG) looks best on the dark
            screen.
          </p>
          <Field label="Tagline" error={errors['screen.tagline']} hint="Shown under the logo. Empty: आज से, सदा के लिए">
            {(p) => <input {...p} className={inputClass} value={sc.tagline} onChange={(e) => setSc((s) => ({ ...s, tagline: e.target.value }))} />}
          </Field>
          <Toggle checked={sc.showSilver} onChange={(v) => setSc((s) => ({ ...s, showSilver: v }))} label="Show the silver rate" />
          <ErrorBanner>{errors.general}</ErrorBanner>
          <Button onClick={save} busy={busy}>
            Save branding
          </Button>
        </div>
      </div>
    </details>
  );
}

export default function AdsPanel({ ads, setAds, promotions, settings, setSettings, notify }) {
  const [editing, setEditing] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(null);
  const today = indiaToday();
  const sorted = useMemo(() => [...ads].sort((a, b) => a.position - b.position), [ads]);
  const usingDefaults = !ads.length;
  const listed = usingDefaults ? bundledAds : sorted;

  // Previews use the saved branding (logo, tagline, silver).
  applyAds([], settings.screen);
  const live = useMemo(() => playableAds(listed, new Date(), promotions), [listed, promotions]);

  const showPreview = (list) => setPreview(playableAds(list, new Date(), promotions));

  const copyDefaults = async () => {
    setBusy('copy');
    try {
      const created = [];
      for (const ad of bundledAds) created.push(await api('ads', { method: 'POST', body: ad }));
      setAds(created);
      notify('Default sequence copied. Edit it freely.');
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setBusy(null);
    }
  };

  const move = async (i, dir) => {
    const next = [...sorted];
    const [item] = next.splice(i, 1);
    next.splice(i + dir, 0, item);
    setBusy(item.id);
    try {
      await api('ads-order', { method: 'PUT', body: { ids: next.map((a) => a.id) } });
      setAds(next.map((a, position) => ({ ...a, position })));
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setBusy(null);
    }
  };

  const toggle = async (ad) => {
    setBusy(ad.id);
    try {
      const saved = await api(`ads/${encodeURIComponent(ad.id)}`, { method: 'PUT', body: { ...ad, enabled: !ad.enabled } });
      setAds((list) => list.map((x) => (x.id === ad.id ? saved : x)));
      notify(saved.enabled ? 'Playing on the screen' : 'Switched off');
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setBusy(null);
    }
  };

  const blank = {
    id: '',
    type: 'image',
    eyebrow: '',
    title: '',
    description: '',
    media: null,
    poster: null,
    cta: '',
    href: '',
    duration: 8,
    advanceOnEnd: true,
    showRates: false,
    promotionId: null,
    enabled: true,
    startDate: null,
    endDate: null,
  };

  return (
    <section aria-labelledby="ads-title" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="ads-title" className="font-serif text-2xl text-heading">
            Showroom TV advertisements
          </h2>
          <p className="max-w-2xl font-sans text-[13px] text-muted">
            Open <strong className="font-medium text-ink">{window.location.origin}/screen</strong> on the showroom TV and press F for full screen. It plays these in order, on its
            own, and picks up changes within about 10 minutes. The website itself is not affected.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/screen"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-white px-4 py-2.5 font-sans text-[13px] font-medium text-ink hover:border-primary hover:text-primary"
          >
            <Monitor className="size-4" /> Open TV screen
          </a>
          <Button variant="outline" onClick={() => showPreview(listed)}>
            <Eye className="size-4" /> Preview sequence
          </Button>
          {!usingDefaults && (
            <Button onClick={() => setEditing({ isNew: true, ad: blank })}>
              <Plus className="size-4" /> New advertisement
            </Button>
          )}
        </div>
      </div>

      {/* What the TV is playing now (paused while a dialog is open). */}
      <div className="overflow-hidden rounded-xl border border-border bg-stage">
        <div className="aspect-video w-full">
          {!editing && !preview && live.length > 0 && (
            <Suspense fallback={null}>
              <AdStage key={live.map((a) => a.id + a.position).join()} items={live} preview />
            </Suspense>
          )}
        </div>
        <p className="flex items-center justify-between gap-3 bg-white px-4 py-2.5 font-sans text-[12px] text-muted">
          <span>Live preview of the TV: advertisements on the left, today’s price list always on the right.</span>
          <span className="shrink-0">{live.length} playing</span>
        </p>
      </div>

      {usingDefaults && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold-soft/50 bg-cream px-5 py-4">
          <p className="font-sans text-[13.5px] text-text">
            The screen is playing the default sequence below. Copy it to start editing, reordering and adding your own photos and videos.
          </p>
          <Button onClick={copyDefaults} busy={busy === 'copy'}>
            Copy default sequence
          </Button>
        </div>
      )}

      <ol className="space-y-2.5">
        {listed.map((ad, i) => {
          const s = status(ad, today);
          const src = ad.media ? resolveImage(ad.media) : null;
          return (
            <li key={ad.id} className={`flex flex-wrap items-center gap-3 rounded-xl border border-border bg-white p-3 sm:flex-nowrap ${ad.enabled ? '' : 'opacity-70'}`}>
              <span className="w-6 shrink-0 text-center font-sans text-[12px] tabular-nums text-subtle">{i + 1}</span>
              <span className="relative block aspect-video w-24 shrink-0 overflow-hidden rounded-md bg-stage">
                {src &&
                  (isVideo(src) || ad.type === 'video' ? (
                    <video src={src} muted preload="metadata" className="h-full w-full object-cover" />
                  ) : (
                    <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ))}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blush px-2 py-0.5 font-sans text-[10.5px] uppercase tracking-wider text-muted">{TYPE_LABEL[ad.type]}</span>
                  <span className={`rounded-full px-2 py-0.5 font-sans text-[10.5px] uppercase tracking-wider ${s.cls}`}>{s.label}</span>
                </div>
                <p className="mt-1 truncate font-sans text-[14px] text-ink">{ad.title || ad.eyebrow || (ad.type === 'campaign' ? 'From the live offer' : TYPE_LABEL[ad.type])}</p>
                <p className="font-sans text-[12px] text-muted">
                  {ad.type === 'video' && ad.advanceOnEnd ? 'Until the video ends' : `${ad.duration} s`}
                  {ad.startDate || ad.endDate ? ` · ${ad.startDate ? fmt(ad.startDate) : 'now'} – ${ad.endDate ? fmt(ad.endDate) : 'no end'}` : ''}
                </p>
              </div>
              {!usingDefaults && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={i === 0 || Boolean(busy)}
                    onClick={() => move(i, -1)}
                    aria-label={`Move ${i + 1} up`}
                    className="rounded-full p-2 text-muted hover:bg-blush disabled:opacity-30"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={i === listed.length - 1 || Boolean(busy)}
                    onClick={() => move(i, 1)}
                    aria-label={`Move ${i + 1} down`}
                    className="rounded-full p-2 text-muted hover:bg-blush disabled:opacity-30"
                  >
                    <ArrowDown className="size-4" />
                  </button>
                </div>
              )}
              <Button variant="ghost" className="px-3!" onClick={() => showPreview([ad])} aria-label={`Preview advertisement ${i + 1}`}>
                <Eye className="size-4" />
              </Button>
              {!usingDefaults && (
                <>
                  <Button variant="ghost" className="px-3!" busy={busy === ad.id} onClick={() => toggle(ad)}>
                    {ad.enabled ? 'Switch off' : 'Switch on'}
                  </Button>
                  <Button variant="outline" className="px-3!" onClick={() => setEditing({ isNew: false, ad })} aria-label={`Edit advertisement ${i + 1}`}>
                    <Pencil className="size-3.5" /> Edit
                  </Button>
                </>
              )}
            </li>
          );
        })}
      </ol>

      <ScreenBranding settings={settings} setSettings={setSettings} notify={notify} />

      {editing && (
        <AdForm
          key={editing.ad.id || 'new'}
          initial={editing.ad}
          isNew={editing.isNew}
          promotions={promotions}
          onClose={() => setEditing(null)}
          onPreview={(draft) => showPreview([{ ...draft, enabled: true, startDate: null, endDate: null }])}
          onSaved={(saved, isNew) => {
            setAds((list) => (isNew ? [...list, saved] : list.map((x) => (x.id === saved.id ? saved : x))));
            setEditing(null);
            notify(isNew ? 'Added to the screen' : 'Saved');
          }}
          onDeleted={(id) => {
            setAds((list) => list.filter((x) => x.id !== id));
            setEditing(null);
            notify('Deleted');
          }}
        />
      )}
      {preview && <Preview items={preview} onClose={() => setPreview(null)} />}
    </section>
  );
}
