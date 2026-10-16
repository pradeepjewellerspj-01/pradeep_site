import { useCallback, useEffect, useState } from 'react';
import { BadgeIndianRupee, ExternalLink, Gem, Loader2, LogOut, Megaphone, Monitor, Sparkles, Store } from 'lucide-react';
import Logo from '../components/common/Logo';
import { api, setSignedOutHandler } from './api';
import { Button, ErrorBanner, Field, inputClass, useNotice } from './ui';
import ProductsPanel from './ProductsPanel';
import OffersPanel from './OffersPanel';
import RatesPanel from './RatesPanel';
import ContactPanel from './ContactPanel';
import AdsPanel from './AdsPanel';
import StylingPanel from './StylingPanel';
import { bundledProducts } from '../data/products';
import { bundledPromotions } from '../data/promotions';
import { contactSettings } from '../data/footer';
import { imageRef } from '../data/images';

const TABS = [
  { id: 'products', label: 'Products', icon: Gem },
  { id: 'offers', label: 'Offers', icon: Megaphone },
  { id: 'rates', label: 'Rates', icon: BadgeIndianRupee },
  { id: 'contact', label: 'Contact & timings', icon: Store },
  { id: 'styling', label: 'Styling 101 reels', icon: Sparkles },
  { id: 'screen', label: 'Showroom TV', icon: Monitor },
];

function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    const title = document.title;
    document.title = 'Admin | Pradeep Jewellers';
    return () => {
      meta.remove();
      document.title = title;
    };
  }, []);
}

function PoweredBy({ className = '' }) {
  return (
    <p className={`font-sans text-[12px] text-subtle ${className}`}>
      Powered by{' '}
      <a href="https://googlixlabs.com" target="_blank" rel="noopener" className="text-muted underline underline-offset-4 hover:text-primary">
        googlixlabs.com
      </a>
    </p>
  );
}

function Centered({ children }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-cream px-4 py-10">
      {children}
      <PoweredBy />
    </div>
  );
}

function NotConfigured({ configured }) {
  return (
    <Centered>
      <div className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-sm">
        <Logo size="sm" />
        <h1 className="mt-6 font-serif text-2xl text-heading">Admin panel is not set up yet</h1>
        <p className="mt-2 font-sans text-[14px] text-muted">Add these settings to the hosting environment (or the local .env file), then reload:</p>
        <ul className="mt-4 space-y-2 font-sans text-[13.5px]">
          <li className={configured.database ? 'text-up' : 'text-down'}>
            {configured.database ? '✓' : '✗'} <code>TURSO_DATABASE_URL</code> and <code>TURSO_AUTH_TOKEN</code> — your Turso database URL and token
          </li>
          <li className={configured.signIn ? 'text-up' : 'text-down'}>
            {configured.signIn ? '✓' : '✗'} <code>ADMIN_PASSWORD</code> — the admin password, at least 10 characters
          </li>
        </ul>
      </div>
    </Centered>
  );
}

function SignIn({ onSignedIn }) {
  const [password, setPassword] = useState('');
  const [problem, setProblem] = useState(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setProblem(null);
    try {
      await api('login', { method: 'POST', body: { password } });
      onSignedIn();
    } catch (err) {
      setProblem(err.message);
      setBusy(false);
    }
  };
  return (
    <Centered>
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-sm">
        <Logo size="sm" />
        <h1 className="mt-6 font-serif text-2xl text-heading">Admin sign in</h1>
        <div className="mt-5 space-y-4">
          <ErrorBanner>{problem}</ErrorBanner>
          <Field label="Password">
            {(p) => (
              <input
                {...p}
                type="password"
                autoComplete="current-password"
                required
                autoFocus
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}
          </Field>
          <Button type="submit" busy={busy} className="w-full">
            Sign in
          </Button>
        </div>
      </form>
    </Centered>
  );
}

/** First visit: copy the content currently built into the website into the database. */
function Setup({ onDone }) {
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);
  const start = async () => {
    setBusy(true);
    setProblem(null);
    try {
      const content = await api('import', {
        method: 'POST',
        body: {
          products: bundledProducts.map((p) => ({ ...p, image: imageRef(p.image) })),
          promotions: bundledPromotions.map((p) => ({ ...p, image: p.image ? imageRef(p.image) : null })),
          settings: { contact: contactSettings(), rates: { mode: 'ibja', values: {}, note: '' } },
        },
      });
      onDone(content);
    } catch (e) {
      setProblem(
        e.errors
          ? `${e.message}: ${Object.entries(e.errors)
              .map(([k, v]) => `${k} ${v}`)
              .join('; ')}`
          : e.message,
      );
      setBusy(false);
    }
  };
  return (
    <div className="mx-auto max-w-xl rounded-2xl bg-white p-7 shadow-sm">
      <h2 className="font-serif text-2xl text-heading">Welcome</h2>
      <p className="mt-2 font-sans text-[14px] leading-relaxed text-muted">
        The database is empty. Start by copying the website’s current products ({bundledProducts.length}), offers ({bundledPromotions.length}) and contact details into it. After
        that, everything is edited here and the website follows.
      </p>
      <div className="mt-5 space-y-3">
        <ErrorBanner>{problem}</ErrorBanner>
        <Button onClick={start} busy={busy}>
          Copy current website content
        </Button>
      </div>
    </div>
  );
}

export default function AdminApp() {
  useNoIndex();
  const [session, setSession] = useState(null); // { signedIn, configured }
  const [content, setContent] = useState(null);
  const [problem, setProblem] = useState(null);
  const [tab, setTab] = useState(() => (TABS.some((t) => `#${t.id}` === window.location.hash) ? window.location.hash.slice(1) : 'products'));
  const { notify, view: noticeView } = useNotice();

  const checkSession = useCallback(async () => {
    try {
      setSession(await api('session'));
    } catch (e) {
      setProblem(e.message);
    }
  }, []);

  useEffect(() => {
    setSignedOutHandler(() => setSession((s) => (s ? { ...s, signedIn: false } : s)));
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (!session?.signedIn) return;
    setContent(null);
    api('content')
      .then(setContent)
      .catch((e) => setProblem(e.message));
  }, [session?.signedIn]);

  useEffect(() => {
    window.history.replaceState(null, '', `#${tab}`);
  }, [tab]);

  const signOut = async () => {
    await api('logout', { method: 'POST' }).catch(() => {});
    setContent(null);
    setSession((s) => ({ ...s, signedIn: false }));
  };

  if (problem && !session)
    return (
      <Centered>
        <ErrorBanner>{problem}</ErrorBanner>
      </Centered>
    );
  if (!session)
    return (
      <Centered>
        <Loader2 className="size-7 animate-spin text-primary" aria-label="Loading" />
      </Centered>
    );
  if (!session.configured.database || !session.configured.signIn) return <NotConfigured configured={session.configured} />;
  if (!session.signedIn) return <SignIn onSignedIn={checkSession} />;

  const setList = (key) => (update) => setContent((c) => ({ ...c, [key]: typeof update === 'function' ? update(c[key]) : update }));
  const setSettings = (settings) => setContent((c) => ({ ...c, settings }));

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Logo size="sm" />
          <span className="rounded-full bg-ink px-2.5 py-0.5 font-sans text-[10.5px] uppercase tracking-[0.18em] text-white">Admin</span>
          <div className="ml-auto flex items-center gap-1">
            {/* A full page load, so the website applies the latest saved content. */}
            <a
              href="/"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 font-sans text-[13px] text-muted hover:bg-blush hover:text-ink"
            >
              <ExternalLink className="size-4" /> <span className="max-sm:hidden">View website</span>
            </a>
            <a
              href="/screen"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 rounded-full bg-stage px-3 py-2 font-sans text-[13px] text-champagne-soft hover:bg-ink"
            >
              <Monitor className="size-4" /> <span className="max-sm:hidden">Showroom TV</span>
            </a>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 font-sans text-[13px] text-muted hover:bg-blush hover:text-ink"
            >
              <LogOut className="size-4" /> <span className="max-sm:hidden">Sign out</span>
            </button>
          </div>
        </div>
        {content?.initialized && (
          <nav aria-label="Admin sections" className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 [scrollbar-width:none]">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-current={tab === id ? 'page' : undefined}
                onClick={() => setTab(id)}
                className={`-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 font-sans text-[13.5px] transition-colors ${
                  tab === id ? 'border-primary text-ink' : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                <Icon className="size-4" strokeWidth={1.6} aria-hidden="true" /> {label}
              </button>
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-7 md:py-9">
        {problem && <ErrorBanner>{problem}</ErrorBanner>}
        {!content && !problem && <Loader2 className="mx-auto mt-16 size-7 animate-spin text-primary" aria-label="Loading" />}
        {content && !content.initialized && <Setup onDone={setContent} />}
        {content?.initialized && (
          <>
            {tab === 'products' && (
              <ProductsPanel products={content.products} setProducts={setList('products')} settings={content.settings} setSettings={setSettings} notify={notify} />
            )}
            {tab === 'offers' && <OffersPanel promotions={content.promotions} setPromotions={setList('promotions')} notify={notify} />}
            {tab === 'rates' && <RatesPanel settings={content.settings} setSettings={setSettings} notify={notify} source={session.rates} />}
            {tab === 'contact' && <ContactPanel settings={content.settings} setSettings={setSettings} notify={notify} />}
            {tab === 'styling' && <StylingPanel settings={content.settings} setSettings={setSettings} products={content.products} notify={notify} />}
            {tab === 'screen' && (
              <AdsPanel ads={content.ads ?? []} setAds={setList('ads')} promotions={content.promotions} settings={content.settings} setSettings={setSettings} notify={notify} />
            )}
            <p className="mt-10 font-sans text-[12px] text-subtle">Changes appear on the website and the showroom TV by themselves within about 15 seconds. No need to reload the page.</p>
          </>
        )}
        <PoweredBy className="mt-12 border-t border-border pt-5 text-center" />
      </main>
      {noticeView}
    </div>
  );
}
