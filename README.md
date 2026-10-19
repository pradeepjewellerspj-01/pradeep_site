# Pradeep Jewellers: Frontend

Frontend for Pradeep Jewellers, a digital showroom rather than a store. Visitors discover pieces, save them with ♡ to **My Selection**, and enquire on **WhatsApp**. There is no cart, checkout or payment.

It is built with Vite, React 19, Tailwind CSS v4, GSAP + ScrollTrigger, Swiper, Lucide and React Router, with a small Node API (Turso) for the admin panel and rates.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the build
```

Copy `.env.example` to `.env` to set the WhatsApp number and, optionally, a live market feed.

## Where things live

| What | Where |
| --- | --- |
| Design tokens (colours, fonts, type scale, breakpoints, showroom styles) | `src/styles/index.css` |
| All photography | `src/data/images.js` (one registry, files in `src/assets/images/`) |
| Logo | `src/components/common/Logo.jsx` (PJ monogram `src/assets/brand/pj-monogram.png` + प्रदीप JEWELLERS) |
| Page content (nav, categories, collections, stories, footer…) | `src/data/*.js` |
| Catalogue, product codes (`PJ-1001`), search | `src/data/products.js` |
| Selection (persisted to localStorage), overlays, toasts | `src/context/StoreContext.jsx` (`useJewellerySelection()`) |
| Business details: address, phones, WhatsApp, since 1981 | `src/data/footer.js` (`business`, `phones`, `contact`) |
| WhatsApp message builder (single and multiple pieces) | `src/services/whatsapp.js` |
| Market data: config, simulator, service, hook | `src/market/` |
| Market UI (board, rolling digits, graph, header chip, market→piece section) | `src/components/market/` |
| Showroom TV page (`/screen`) | `src/pages/ScreenPage.jsx`, `src/components/adstage/`, defaults in `src/data/ads.js` |
| Like button, selection drawer, WhatsApp button | `src/components/jewellery/` |
| Home page section order | `src/pages/Home.jsx` |

Routes: `/`, `/category/:slug`, `/search?q=`, `/product/:id`, `/gold-rate` (daily gold and silver rates), `/info/:slug`, `/admin` (see Admin panel), `/screen` (showroom TV), plus a 404 page.

## Market data

Every rate on the site comes from one service (`src/market/marketService.js`) and is shown everywhere as the showroom quotes it: gold and silver jewellery **per 10 gm**, silver 999 **per kg** (`perGrams` / `unitLabel` in `src/market/marketConfig.js`), with its source and publication time. *Silver jewellery* is the showroom’s own rate: it exists only in showroom mode (no market publishes it). Everything reads the same snapshot, so they always agree.

- **20K (833).** IBJA does not publish it. It is calculated from the IBJA 999 rate × 0.833, the way IBJA's own 916 and 750 rates relate to 999 (exactly × 0.916 and × 0.750), and every place it appears says so (`calculated` in `marketConfig.js`). In showroom mode, an empty 20K field is the showroom 24K × 0.833, also marked.

- **Live (default).** The site polls its own endpoint, `GET /api/rates`, every 5 minutes and again whenever the visitor returns to the tab. That endpoint reads the latest published session from the **India Bullion and Jewellers Association (IBJA)** at [ibjarates.com](https://ibjarates.com/) (`server/ibja.mjs`, AM and PM sessions, cached for 5 minutes), so the top bar's date, session and rates move on by themselves. IBJA's page cannot be read from the browser directly because it sends no CORS header. The label stays *Indicative · IBJA*, because bullion reference rates exclude GST and making charges.
- **Where `/api/rates` runs.** `npm run dev` and `npm run preview` serve it automatically (`vite.config.js`). On Vercel, `api/rates.js` is picked up as a serverless function. On other hosts, route `GET /api/rates` to `ratesHandler` from `server/ibja.mjs`, or set `VITE_MARKET_API_URL` to any endpoint returning the same JSON. IBJA asks commercial users to use its official API, which can sit behind the same endpoint.
- **Fallback.** Until the first response arrives, or if the endpoint cannot be reached, the site shows the bundled snapshot `src/market/ibjaReference.json` with its own date. Refresh it with `npm run rates:ibja`.
- **Demo mode.** `VITE_MARKET_MODE=demo` simulates movement for development, always labelled *Indicative · Demo data*.
- **Units.** Each source declares its unit, and `toPerGram()` in `marketConfig.js` converts it once. Components never divide prices themselves.
- **Rate source.** The "Rate source" disclosure in the hero and market section explains the source, what the rate excludes, and when it was published.


## Admin panel

`/admin` (not linked anywhere, `noindex`) lets the owner manage **products** (add, edit, hide, delete, upload photos), **offers** in the promo band, **rates** (IBJA automatically, or the showroom's own rates, entered as quoted: gold and silver jewellery per 10 gm, silver 999 per kg), **contact details and timings**, the **Styling 101 reels** and the **showroom TV**. Data lives in **Turso** (libSQL, hosted SQLite).

- **Setup.** Create a free database at turso.tech, then set `TURSO_DATABASE_URL` (`libsql://…`), `TURSO_AUTH_TOKEN`, and `ADMIN_PASSWORD` (at least 10 characters) in `.env` locally and in the host's environment variables. These are server-only and never reach the browser. On the first sign-in, *Copy current website content* copies the bundled catalogue, offers and contact details into the database.
- **Tables** (`products`, `promotions`, `settings`, `images`) are created automatically on first use (`server/db.mjs`). For local testing without Turso, `TURSO_DATABASE_URL=file:local.db` uses a local SQLite file.
- **Sign-in.** One admin, one password. A signed, HttpOnly, SameSite=Strict cookie lasts 12 hours; failed attempts are throttled. The first password is `ADMIN_PASSWORD`.
- **Changing the password.** *Password* in the admin header (current password, new one twice, at least 10 characters). The new password is stored in the database as a salted scrypt hash (table `admin_auth`, never sent to the site) and replaces `ADMIN_PASSWORD`; every other session is signed out (`server/auth.mjs`). Changing `ADMIN_SECRET` also signs everyone out.
- **Forgotten password.** On a computer with the database settings in `.env.local`, run `npm run admin:reset-password`. It removes the panel password, so `ADMIN_PASSWORD` signs in again; then set a new one in the panel.
- **How the site uses it.** Before the first render, `src/content/siteContent.js` fetches `GET /api/content` (2.5 s timeout) and applies it to the data modules (`applyProducts`, `applyPromotions`, `applyContactSettings`, `setShowroomRates`). If the API is unreachable, the browser's last copy is used, then the bundled content, so the site never breaks.
- **Live updates (no reload).** Open pages, the TV included, ask `/api/content` every 10 s (an unchanged answer is a small 304, with a 5 s CDN cache), apply what changed and re-render (`startLiveContent`, `useContentVersion`). Admin changes therefore show within about 15 s without reloading. A hidden tab does not ask; it checks as soon as it is shown again.
- **Styling 101 reels.** Paste public Instagram reel links (any share link; stored as `instagram.com/reel/<code>/`), with an optional title, cover photo and product. They replace the photo stories on the home page, in order, and play in Instagram's own embedded player, which loads only when a visitor opens a reel. Instagram gives no thumbnails to other sites, so a reel without a cover shows an Instagram-style card. With no reels, the bundled stories return.
- **Categories.** In the Products tab, the category chips filter the list, and *Edit categories* adds, renames, reorders and removes them (saved in settings; bundled default in `src/data/navigation.js`). They make up the website's *All Jewellery* menu, in order, and name the category pages. A category is a product tag: renaming keeps its slug, so its pieces stay in it, and it shows in the menu only once a piece on the website carries it. The product form has one button per category.
- **Validation.** `src/content/schema.js` is shared by the server and the admin forms.
- **Photos** are resized in the browser (WebP, longest side 1600 px) and stored in Turso, served from `/api/images/:id` with a one-year cache. Bundled photos are referenced as `builtin:<name>` (`src/data/images.js`).
- **Showroom rates.** When chosen, the site shows only the rates entered, labelled *Showroom rate* with the date they were set, and stops polling IBJA. Metals left empty are not shown.
- **API.** `server/content.mjs` (routes listed at the top). Vite serves it in dev and preview; on Vercel, `api/site.js` with the rewrites in `vercel.json`.

## Promotions

The strip under the header reads `src/data/promotions.js` (or the admin panel's offers, once set up). Each entry has `enabled`, `startDate`/`endDate` (India time, inclusive), `priority`, `tone` (`burgundy`, `espresso` or `ivory`), `label`, `occasion`, `title`, `cta`/`href`, and optional `discount` and `image`. Only enabled entries inside their dates appear, highest priority first. They rotate every 5.5 s, pause on hover or focus, and stay still for reduced motion. Templates exist for the major festivals and collections, switched off until their dates are set. Check festival dates each year.

## Showroom TV (/screen)

`/screen` is a separate page for the showroom TV: a full-screen jewellery commercial with nothing from the website around it (no header, menu, search or website buttons). The website itself is unchanged at every size and never loads this code.

- **On the TV.** Open `https://<your-domain>/screen` in the TV's browser and press **F** (or the full-screen button that appears when the mouse moves). It plays on its own, keeps the display awake where the browser allows (Screen Wake Lock), and picks up admin changes within about 15 seconds without reloading. Arrow keys (or a remote's) move between advertisements; space pauses.
- **What plays.** `src/components/adstage/` (`AdStage.jsx`, `GoldRateBoard.jsx`, `adStage.css`), page `src/pages/ScreenPage.jsx`. Types: brand card (logo, tagline, address and WhatsApp), image, video, gold-rate board, and offer campaign (an offer from the Offers tab, shown only while live). There are no links: a TV is not clicked, so the call to action reads as a sign-off. The sequence and branding are edited in the admin panel's **Showroom TV** tab (with a live preview), and the admin header has a **Showroom TV** button that opens /screen; until it has advertisements, the defaults in `src/data/ads.js` play.
- **Layout.** Advertisements play on the left; **today's price list is fixed on the right** at all times (आज का भाव: 24K, 22K, 18K and silver per gram, the source label, when published or set, and the WhatsApp number), like the rate board on a showroom wall. The PJ bug sits top left, a thin progress line along the bottom; controls and the cursor appear only while the mouse moves.
- **Behaviour.** Each advertisement shows for its duration, or a video until it ends. Crossfades, a slow zoom, one light sweep and a little gold dust; the next item's media preloads. Playback pauses while the tab is hidden. *Reduced motion* removes zoom, sweep and particles. Videos are muted; if a browser blocks playback the poster shows and the timer moves on.
- **Layout.** Sizes use container units, so it fills a 720p TV, 1080p, 4K and ultrawide alike, and the admin preview; portrait photos are framed instead of stretched.
- **Rates** come from the same feed as the rest of the site, in whole rupees, large and bold, under *आज का भाव · Today’s rate (Excluding making charges and taxes)* with the date and time: 24K, 22K, 20K, 18K per 10 gm, silver 999 per kg, silver jewellery per 10 gm. The showroom’s own rates need no footer; market rates keep a footer naming the source (*Indicative · IBJA · market reference*) and when they were published. A calculated 20K is marked with *.
- **Brand name font.** प्रदीप renders in **Kruti Dev 680** once the font file is placed at `src/assets/fonts/KrutiDev680.ttf` (or `.woff2`/`.woff`/`.otf`), or when it is installed on the device. Kruti Dev is a legacy (non-Unicode) font, so the name is typed as `iznhi` and shown that way only after the font has loaded; otherwise the Unicode name stays (`src/components/common/BrandNameHi.jsx`). Use a licensed copy of the font.
- **Media.** Uploads up to 3 MB (photos are resized in the browser; videos must be short loops), stored in Turso and served with byte ranges. For longer videos, paste an https link to an MP4 hosted elsewhere (for example Cloudinary or Bunny Stream).

## Installable apps (PWA) and Android TV

- **Web apps.** `/screen` (*PJ Showroom TV*, opens full screen, landscape) and `/admin` (*PJ Admin*) are installable from Chrome or Edge on computers, phones and tablets (browser menu → *Install*). Manifests: `public/screen.webmanifest`, `public/admin.webmanifest`, chosen in `index.html` by path; icons and TV banner in `public/pwa/`. The website itself is not an app.
- **Offline.** `public/sw.js` (registered from those two pages only, `src/pwa.js`) keeps the last copy of the TV page, its assets, photos and content, so a TV that restarts without internet keeps playing. Offline rates are served marked *stale*, so they show as *Delayed*, never as current. Admin API calls are never cached. Bump `VERSION` in `sw.js` to clear old caches.
- **Android TV.** Android TV has no Chrome, so there is no install button there. `android-tv/` is a small WebView app with **PJ Showroom TV** and **PJ Admin** on the TV home screen (remote-friendly, display kept awake). Build and install steps: `android-tv/README.md`.

## Placeholders to replace before launch

- **Catalogue and prices.** `src/data/products.js` is a mock catalogue (manage the real one in the admin panel). Prices are shown as *Indicative price* on product pages only.
- **Market rates.** Deploy `/api/rates` with the site (see Market data). Without it, visitors see the bundled snapshot and its date.
- **Promotion dates and offers.** Confirm campaign dates, and add `discount` text only for offers the store has approved.
- **Photography.** It is Unsplash stock (Unsplash License). Swap the files in `src/assets/images/`, keeping the same names.
- **App QR code.** The QR code in the footer is decorative.
- **Exchange film.** The exchange "film" is a captioned slideshow.
- **Appointments.** The appointment form opens WhatsApp with the request filled in; the customer presses Send.
