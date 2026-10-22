import { useState } from 'react';
import { api } from './api';
import { Button, ErrorBanner, Toggle } from './ui';
import HomeContentEditor, { homeContentOf } from './HomeContentEditor';
import { HOME_SECTIONS, cleanHomeContent } from '../content/schema';

const fromSettings = (settings) => Object.fromEntries(HOME_SECTIONS.map(({ id, on }) => [id, typeof settings.home?.[id] === 'boolean' ? settings.home[id] : on]));

/** Switches the home page's sections on and off, and edits its banners, circles, cards and photos. */
export default function HomePanel({ settings, setSettings, notify }) {
  const [home, setHome] = useState(() => fromSettings(settings));
  const [content, setContent] = useState(() => homeContentOf(settings));
  const [errors, setErrors] = useState({});
  const [problem, setProblem] = useState(null);
  const [busy, setBusy] = useState(false);
  const changed =
    HOME_SECTIONS.some(({ id }) => home[id] !== fromSettings(settings)[id]) || JSON.stringify(content) !== JSON.stringify(homeContentOf(settings));

  const save = async () => {
    setProblem(null);
    const local = cleanHomeContent(content).errors;
    setErrors(local ?? {});
    if (local) {
      setProblem('Please check the highlighted fields');
      return;
    }
    setBusy(true);
    try {
      const saved = await api('settings', { method: 'PUT', body: { contact: settings.contact, rates: settings.rates, home, homeContent: content } });
      setSettings(saved);
      setHome(fromSettings(saved));
      setContent(homeContentOf(saved));
      notify('Home page saved');
    } catch (e) {
      setErrors(e.errors ?? {});
      setProblem(e.message);
    } finally {
      setBusy(false);
    }
  };

  const saveBar = (
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={save} busy={busy} disabled={!changed}>
        Save home page
      </Button>
      {changed && !busy && <span className="font-sans text-[12.5px] text-muted">Unsaved changes</span>}
      <ErrorBanner>{problem}</ErrorBanner>
    </div>
  );

  return (
    <section aria-labelledby="home-title" className="max-w-5xl space-y-5">
      <div>
        <h2 id="home-title" className="font-serif text-2xl text-heading">
          Home page
        </h2>
        <p className="font-sans text-[13px] text-muted">
          Choose which sections the website’s front page shows, and change its banners, categories and photos. Saved changes appear on the website within seconds.
        </p>
      </div>

      <ul className="divide-y divide-border rounded-xl border border-border bg-white">
        {HOME_SECTIONS.map(({ id, label, hint }) => (
          <li key={id} className="px-5 py-4">
            <Toggle checked={home[id]} onChange={(on) => setHome((h) => ({ ...h, [id]: on }))} label={label} description={hint} />
          </li>
        ))}
      </ul>

      {saveBar}

      <HomeContentEditor value={content} onChange={setContent} errors={errors} settings={settings} />

      <div className="sticky bottom-0 -mx-1 border-t border-border bg-cream/95 px-1 py-3 backdrop-blur">{saveBar}</div>
    </section>
  );
}
