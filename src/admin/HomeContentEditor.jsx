import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Button, Field, PhotoInput, inputClass } from './ui';
import { categoriesOf } from './CategoriesCard';
import { MAX_HERO_SLIDES, MAX_HOME_CATEGORIES, MAX_HOME_COLLECTIONS } from '../content/schema';
import { bundledHomeContent, newArrivals } from '../data/collections';
import { imageRef } from '../data/images';

/** The home page content as saved, each list falling back to the site's defaults. */
export function homeContentOf(settings) {
  const bundled = bundledHomeContent(imageRef);
  const saved = settings.homeContent ?? {};
  // `key`: keeps each card's photo upload with its card while the list is reordered (never saved).
  const keyed = (list) => list.map((item, i) => ({ ...item, key: `${i}-${item.label}` }));
  return {
    hero: saved.hero?.length ? saved.hero : bundled.hero,
    categories: keyed(saved.categories?.length ? saved.categories : bundled.categories),
    collections: keyed(saved.collections?.length ? saved.collections : bundled.collections),
    // Each card's saved name, link and photo over the defaults (an older save holds just the photo).
    arrivals: bundled.arrivals.map((card, i) => {
      const s = saved.arrivals?.[i];
      const custom = typeof s === 'string' ? { image: s } : (s ?? {});
      return { title: custom.title || card.title, href: custom.href || card.href, image: custom.image || card.image };
    }),
  };
}

// Pages a banner, circle or card can open.
function linkOptions(settings) {
  return [
    ['/category/all-jewellery', 'All Jewellery'],
    ['/category/gold', 'Gold'],
    ['/category/silver', 'Silver'],
    ['/category/diamond', 'Diamond'],
    ['/category/gemstone', 'Gemstones'],
    ['/category/wedding', 'Bridal / Wedding'],
    ...categoriesOf(settings).map((c) => [`/category/${c.slug}`, c.label]),
    ['/gold-rate', 'Gold rate today'],
  ].filter(([href], i, all) => all.findIndex(([h]) => h === href) === i);
}

const OTHER = '__other';

/** A page of the site: chosen from the list, or typed ("Other page…"). */
function LinkPicker({ value, onChange, options, error }) {
  const listed = options.some(([href]) => href === value);
  return (
    <Field label="Opens" error={error}>
      {(p) => (
        <div className="space-y-2">
          <select {...p} className={inputClass} value={listed ? value : OTHER} onChange={(e) => onChange(e.target.value === OTHER ? '' : e.target.value)}>
            {options.map(([href, label]) => (
              <option key={href} value={href}>
                {label}
              </option>
            ))}
            <option value={OTHER}>Other page…</option>
          </select>
          {!listed && <input className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} placeholder="/category/…" />}
        </div>
      )}
    </Field>
  );
}

function TextField({ label, value, onChange, error, placeholder, hint }) {
  return (
    <Field label={label} error={error} hint={hint}>
      {(p) => <input {...p} className={inputClass} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />}
    </Field>
  );
}

/** One editable list: each item in a card with move up, move down and remove; "Add" at the end. */
function ListEditor({ title, hint, items, onChange, max, blank, addLabel, renderItem }) {
  const move = (i, step) => {
    const next = [...items];
    [next[i], next[i + step]] = [next[i + step], next[i]];
    onChange(next);
  };
  return (
    <section className="rounded-xl border border-border bg-white">
      <div className="border-b border-border px-5 py-4">
        <h3 className="font-serif text-lg text-heading">{title}</h3>
        <p className="font-sans text-[12.5px] text-muted">{hint}</p>
      </div>
      <ol className="divide-y divide-border">
        {items.map((item, i) => (
          <li key={item.key ?? item.id ?? i} className="px-5 py-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="font-sans text-[11.5px] font-medium uppercase tracking-[0.12em] text-subtle">{String(i + 1).padStart(2, '0')}</span>
              <span className="flex gap-1">
                <Button variant="ghost" className="px-2.5! py-1.5!" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">
                  <ArrowUp className="size-4" />
                </Button>
                <Button variant="ghost" className="px-2.5! py-1.5!" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Move down">
                  <ArrowDown className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  className="px-2.5! py-1.5! hover:text-down"
                  disabled={items.length === 1}
                  onClick={() => onChange(items.filter((_, j) => j !== i))}
                  aria-label="Remove"
                >
                  <Trash2 className="size-4" />
                </Button>
              </span>
            </div>
            {renderItem(item, (patch) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x))), i)}
          </li>
        ))}
      </ol>
      {items.length < max && (
        <div className="border-t border-border px-5 py-3">
          <Button variant="outline" onClick={() => onChange([...items, blank()])}>
            <Plus className="size-4" /> {addLabel}
          </Button>
        </div>
      )}
    </section>
  );
}

const FOCUS = [
  ['20% 50%', 'Left side of the photo'],
  ['50% 50%', 'Centre of the photo'],
  ['80% 50%', 'Right side of the photo'],
];

const newKey = () => Math.random().toString(36).slice(2, 10);

/**
 * The home page's banners, "Shop by Category" circles, "Explore Our World"
 * cards and New Arrivals photos. `value` is { hero, categories, collections,
 * arrivals }; `errors` uses the API's keys ("hero.0.title").
 */
export default function HomeContentEditor({ value, onChange, errors, settings }) {
  const links = linkOptions(settings);
  const set = (key) => (list) => onChange({ ...value, [key]: list });
  const err = (key, i, field) => errors[`${key}.${i}.${field}`];

  return (
    <div className="space-y-6">
      <ListEditor
        title="Top banners"
        hint="The large sliding banners at the top of the home page, in this order. Wide photos look best (about 2.5 : 1); the text sits on the right."
        items={value.hero}
        onChange={set('hero')}
        max={MAX_HERO_SLIDES}
        addLabel="Add a banner"
        blank={() => ({ id: `slide-${newKey()}`, image: '', eyebrow: '', title: '', script: '', subtitle: '', cta: 'Explore Now', href: '/category/all-jewellery', tone: 'dark', position: '50% 50%' })}
        renderItem={(s, patch, i) => (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-3">
              <PhotoInput
                label="Banner photo"
                value={s.image}
                onChange={(image) => patch({ image })}
                error={err('hero', i, 'image')}
                aspect="aspect-[2.5/1]"
                className="max-w-full"
                watermark={false}
                maxEdge={2400}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Text colour">
                  {(p) => (
                    <select {...p} className={inputClass} value={s.tone} onChange={(e) => patch({ tone: e.target.value })}>
                      <option value="dark">White text (dark photo)</option>
                      <option value="light">Dark text (light photo)</option>
                    </select>
                  )}
                </Field>
                <Field label="Keep in view" hint="Phones show a narrower part of the banner">
                  {(p) => (
                    <select {...p} className={inputClass} value={s.position} onChange={(e) => patch({ position: e.target.value })}>
                      {!FOCUS.some(([v]) => v === s.position) && <option value={s.position}>As set before</option>}
                      {FOCUS.map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 self-start">
              <TextField label="Small heading" value={s.eyebrow} onChange={(eyebrow) => patch({ eyebrow })} error={err('hero', i, 'eyebrow')} placeholder="e.g. Wedding" />
              <TextField label="Heading" value={s.title} onChange={(title) => patch({ title })} error={err('hero', i, 'title')} placeholder="e.g. Forever," />
              <TextField label="Script word" value={s.script} onChange={(script) => patch({ script })} error={err('hero', i, 'script')} placeholder="e.g. together" hint="In the large handwriting font" />
              <TextField label="Line below" value={s.subtitle} onChange={(subtitle) => patch({ subtitle })} error={err('hero', i, 'subtitle')} placeholder="e.g. Engagement rings & couple bands" />
              <TextField label="Button text" value={s.cta} onChange={(cta) => patch({ cta })} error={err('hero', i, 'cta')} />
              <LinkPicker value={s.href} onChange={(href) => patch({ href })} options={links} error={err('hero', i, 'href')} />
            </div>
          </div>
        )}
      />

      <ListEditor
        title="Shop by Category"
        hint="The round photos under the banners. Four show in a row; more start a new row. New categories are added in Products → Categories, then chosen here."
        items={value.categories}
        onChange={set('categories')}
        max={MAX_HOME_CATEGORIES}
        addLabel="Add a category"
        blank={() => ({ key: newKey(), label: '', href: '/category/all-jewellery', image: '' })}
        renderItem={(c, patch, i) => (
          <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
            <PhotoInput label="Photo" value={c.image} onChange={(image) => patch({ image })} error={err('categories', i, 'image')} className="max-w-[160px]" watermark={false} maxEdge={800} />
            <div className="grid gap-3 self-start sm:grid-cols-2">
              <TextField label="Name" value={c.label} onChange={(label) => patch({ label })} error={err('categories', i, 'label')} placeholder="e.g. Rings" />
              <LinkPicker value={c.href} onChange={(href) => patch({ href })} options={links} error={err('categories', i, 'href')} />
            </div>
          </div>
        )}
      />

      <ListEditor
        title="Explore Our World"
        hint="The photo cards below the circles (Gold, Diamond, Bridal, Silver…). Two in a row on phones, four on computers."
        items={value.collections}
        onChange={set('collections')}
        max={MAX_HOME_COLLECTIONS}
        addLabel="Add a card"
        blank={() => ({ key: newKey(), label: '', subtitle: '', href: '/category/all-jewellery', image: '' })}
        renderItem={(c, patch, i) => (
          <div className="grid gap-4 sm:grid-cols-[200px_minmax(0,1fr)]">
            <PhotoInput label="Photo" value={c.image} onChange={(image) => patch({ image })} error={err('collections', i, 'image')} aspect="aspect-[4/3]" className="max-w-[200px]" watermark={false} maxEdge={1400} />
            <div className="grid gap-3 self-start sm:grid-cols-2">
              <TextField label="Name" value={c.label} onChange={(label) => patch({ label })} error={err('collections', i, 'label')} placeholder="e.g. Gold" />
              <TextField label="Small line" value={c.subtitle} onChange={(subtitle) => patch({ subtitle })} error={err('collections', i, 'subtitle')} placeholder="e.g. Timeless classics" />
              <LinkPicker value={c.href} onChange={(href) => patch({ href })} options={links} error={err('collections', i, 'href')} />
            </div>
          </div>
        )}
      />

      <section className="rounded-xl border border-border bg-white">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-serif text-lg text-heading">New Arrivals</h3>
          <p className="font-sans text-[12.5px] text-muted">The two cards in the New Arrivals band: name, the page each opens, and photo.</p>
        </div>
        <div className="grid gap-6 px-5 py-4 sm:grid-cols-2">
          {value.arrivals.map((card, i) => {
            const patch = (p) => set('arrivals')(value.arrivals.map((x, j) => (j === i ? { ...x, ...p } : x)));
            return (
              <div key={i} className="space-y-3">
                <p className="font-sans text-[11.5px] font-medium uppercase tracking-[0.12em] text-subtle">Card {i + 1}</p>
                <TextField label="Name" value={card.title} onChange={(title) => patch({ title })} error={errors[`arrivals.${i}.title`]} placeholder={newArrivals.cards[i]?.title} />
                <LinkPicker value={card.href} onChange={(href) => patch({ href })} options={links} error={errors[`arrivals.${i}.href`]} />
                <PhotoInput
                  label="Photo"
                  value={card.image}
                  onChange={(image) => patch({ image })}
                  error={errors[`arrivals.${i}.image`]}
                  aspect="aspect-[4/3]"
                  className="max-w-[260px]"
                  watermark={false}
                  maxEdge={1400}
                />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
