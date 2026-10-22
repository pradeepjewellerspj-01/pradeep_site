import { useState } from 'react';
import { api } from './api';
import { Button, ErrorBanner, Toggle } from './ui';
import { HOME_SECTIONS } from '../content/schema';

const fromSettings = (settings) => Object.fromEntries(HOME_SECTIONS.map(({ id, on }) => [id, typeof settings.home?.[id] === 'boolean' ? settings.home[id] : on]));

/** Switches the home page's sections on and off. */
export default function HomePanel({ settings, setSettings, notify }) {
  const [home, setHome] = useState(() => fromSettings(settings));
  const [problem, setProblem] = useState(null);
  const [busy, setBusy] = useState(false);
  const changed = HOME_SECTIONS.some(({ id }) => home[id] !== fromSettings(settings)[id]);

  const save = async () => {
    setBusy(true);
    setProblem(null);
    try {
      const saved = await api('settings', { method: 'PUT', body: { contact: settings.contact, rates: settings.rates, home } });
      setSettings(saved);
      setHome(fromSettings(saved));
      notify('Home page saved');
    } catch (e) {
      setProblem(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="home-title" className="max-w-3xl space-y-5">
      <div>
        <h2 id="home-title" className="font-serif text-2xl text-heading">
          Home page
        </h2>
        <p className="font-sans text-[13px] text-muted">Choose which sections the website’s front page shows, from top to bottom. Switched-off sections are only hidden, never deleted.</p>
      </div>

      <ul className="divide-y divide-border rounded-xl border border-border bg-white">
        {HOME_SECTIONS.map(({ id, label, hint }) => (
          <li key={id} className="px-5 py-4">
            <Toggle checked={home[id]} onChange={(on) => setHome((h) => ({ ...h, [id]: on }))} label={label} description={hint} />
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={save} busy={busy} disabled={!changed}>
          Save home page
        </Button>
        <ErrorBanner>{problem}</ErrorBanner>
      </div>
    </section>
  );
}
