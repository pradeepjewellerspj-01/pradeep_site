import { randomBytes } from 'node:crypto';
import { getDb, isDbConfigured } from './db.mjs';
import { HttpError, readJson, send } from './http.mjs';
import { changePassword, isAuthConfigured, isSignedIn, login, logout, passwordInfo, requireAdmin } from './auth.mjs';
import { ratesConfig } from './ibja.mjs';
import { RATE_KEYS, cleanAd, cleanProduct, cleanPromotion, cleanSettings } from '../src/content/schema.js';

/**
 * The site's content API (data in Turso; see db.mjs).
 *
 *   GET    /api/content                 public: visible products, enabled offers, settings
 *   GET    /api/images/:id              public: an uploaded photo or video (byte ranges supported)
 *   POST   /api/admin/login             { password }
 *   POST   /api/admin/logout
 *   GET    /api/admin/session
 *   PUT    /api/admin/password          { current, next }  (signed in)
 *   GET    /api/admin/content           everything, including hidden products
 *   POST   /api/admin/import            { products, promotions, settings } — first-time setup
 *   POST   /api/admin/products          create      PUT/DELETE /api/admin/products/:id
 *   POST   /api/admin/promotions        create      PUT/DELETE /api/admin/promotions/:id
 *   POST   /api/admin/ads               create      PUT/DELETE /api/admin/ads/:id   (large-screen advertisements)
 *   PUT    /api/admin/ads-order         { ids } — play order
 *   PUT    /api/admin/settings
 *   POST   /api/admin/images            { dataUrl } → { url }   (images and short videos)
 */

// Uploads go through the request body (Vercel caps it at 4.5 MB, base64 adds a third),
// so files stay under 3 MB: photos are resized in the browser, videos must be short loops.
// Longer videos are linked by https URL instead (see README).
const MAX_MEDIA_BYTES = 3 * 1024 * 1024;
const MEDIA_TYPES = ['image/webp', 'image/jpeg', 'image/png', 'video/mp4', 'video/webm'];

const invalid = (errors) => {
  const e = new HttpError(422, 'Please check the highlighted fields');
  e.errors = errors;
  return e;
};

const now = () => new Date().toISOString();
const parse = (rows) => rows.map((r) => JSON.parse(r.data));

// Indexed columns kept beside each record's JSON.
const TABLES = {
  products: { columns: (d) => ({ position: d.position, hidden: d.hidden ? 1 : 0 }) },
  promotions: { columns: (d) => ({ priority: d.priority, enabled: d.enabled ? 1 : 0 }) },
  ads: { columns: (d) => ({ position: d.position, enabled: d.enabled ? 1 : 0 }) },
};

/** An INSERT … ON CONFLICT statement for one record. */
function upsert(table, doc) {
  const cols = TABLES[table].columns(doc);
  const names = ['id', ...Object.keys(cols), 'data'];
  return {
    sql: `INSERT INTO ${table} (${names.join(', ')}) VALUES (${names.map(() => '?').join(', ')})
          ON CONFLICT(id) DO UPDATE SET ${names
            .slice(1)
            .map((n) => `${n} = excluded.${n}`)
            .join(', ')}`,
    args: [doc.id, ...Object.values(cols), JSON.stringify(doc)],
  };
}

async function readSettings(db) {
  const { rows } = await db.execute("SELECT data, updated_at FROM settings WHERE id = 'site'");
  return rows[0] ? { ...JSON.parse(rows[0].data), updatedAt: rows[0].updated_at } : null;
}

async function readContent({ includeHidden }) {
  const db = await getDb();
  const settings = await readSettings(db);
  if (!settings) return { initialized: false };
  const [products, promotions, ads] = await db.batch(
    [
      `SELECT data FROM products ${includeHidden ? '' : 'WHERE hidden = 0'} ORDER BY position, id`,
      `SELECT data FROM promotions ${includeHidden ? '' : 'WHERE enabled = 1'} ORDER BY priority DESC, id`,
      `SELECT data FROM ads ${includeHidden ? '' : 'WHERE enabled = 1'} ORDER BY position, id`,
    ],
    'read',
  );
  const { contact, rates, screen, styling, categories, updatedAt } = settings;
  return {
    initialized: true,
    updatedAt,
    products: parse(products.rows),
    promotions: parse(promotions.rows),
    ads: parse(ads.rows),
    settings: { contact, rates, screen: screen ?? null, styling: styling ?? null, categories: categories ?? null },
  };
}

const touch = { sql: "UPDATE settings SET updated_at = ? WHERE id = 'site'", args: [] };
const touchNow = () => ({ ...touch, args: [now()] });

async function requireInitialized(db) {
  const { rows } = await db.execute("SELECT 1 FROM settings WHERE id = 'site'");
  if (!rows.length) throw new HttpError(409, 'Import the current site content first');
}

function cleanOrThrow(clean, input) {
  const { value, errors } = clean(input ?? {});
  if (errors) throw invalid(errors);
  return value;
}

/** Keeps the previous showroom rates so the site can show the day's change. */
function withRateHistory(next, prev) {
  const changed = RATE_KEYS.some((k) => next.rates.values[k] !== prev?.rates?.values?.[k]) || next.rates.mode !== prev?.rates?.mode;
  return {
    ...next,
    rates: {
      ...next.rates,
      previous: changed ? (prev?.rates?.values ?? null) : (prev?.rates?.previous ?? null),
      setAt: changed || !prev?.rates?.setAt ? now() : prev.rates.setAt,
    },
  };
}

// ---------- Records (products, promotions) ----------

function crud(table, clean) {
  return async (req, res, id) => {
    const db = await getDb();
    await requireInitialized(db);
    if (req.method === 'POST' && !id) {
      const doc = cleanOrThrow(clean, await readJson(req));
      const { rows } = await db.execute({ sql: `SELECT 1 FROM ${table} WHERE id = ?`, args: [doc.id] });
      if (rows.length) throw invalid({ id: 'This code is already used' });
      if (table === 'products') {
        const { rows: first } = await db.execute('SELECT MIN(position) AS p FROM products');
        doc.position = (first[0]?.p ?? 0) - 1; // new pieces appear first
      }
      if (table === 'ads') {
        const { rows: last } = await db.execute('SELECT MAX(position) AS p FROM ads');
        doc.position = (last[0]?.p ?? -1) + 1; // new advertisements join the end of the sequence
      }
      await db.batch([upsert(table, doc), touchNow()], 'write');
      return send(res, 201, doc);
    }
    if (req.method === 'PUT' && id) {
      const { rows } = await db.execute({ sql: `SELECT data FROM ${table} WHERE id = ?`, args: [id] });
      if (!rows.length) throw new HttpError(404, 'Not found');
      const current = JSON.parse(rows[0].data);
      const doc = cleanOrThrow(clean, { ...(await readJson(req)), id, ...(TABLES[table].columns(current).position !== undefined ? { position: current.position } : {}) });
      await db.batch([upsert(table, doc), touchNow()], 'write');
      return send(res, 200, doc);
    }
    if (req.method === 'DELETE' && id) {
      const [{ rowsAffected }] = await db.batch([{ sql: `DELETE FROM ${table} WHERE id = ?`, args: [id] }, touchNow()], 'write');
      if (!rowsAffected) throw new HttpError(404, 'Not found');
      return send(res, 200, { ok: true });
    }
    throw new HttpError(405, 'Method not allowed');
  };
}

const products = crud('products', cleanProduct);
const promotions = crud('promotions', cleanPromotion);
const ads = crud('ads', cleanAd);

/** PUT /api/admin/ads-order { ids } — the advertisements' play order. */
async function orderAds(req, res) {
  const db = await getDb();
  const { ids } = await readJson(req);
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'string')) throw new HttpError(400, 'Expected { ids: [...] }');
  const { rows } = await db.execute('SELECT id, data FROM ads');
  const byId = new Map(rows.map((r) => [r.id, JSON.parse(r.data)]));
  if (ids.length !== byId.size || ids.some((id) => !byId.has(id))) throw new HttpError(409, 'The list changed. Reload and try again.');
  await db.batch([...ids.map((id, position) => upsert('ads', { ...byId.get(id), position })), touchNow()], 'write');
  send(res, 200, { ok: true });
}

// ---------- Handlers ----------

async function importContent(req, res) {
  const body = await readJson(req);
  const db = await getDb();
  if ((await readSettings(db)) && !body.replace) throw new HttpError(409, 'Content has already been imported');
  const errors = {};
  const list = (items, clean, label) =>
    (Array.isArray(items) ? items : []).map((item, i) => {
      const { value, errors: e } = clean(item);
      if (e) errors[`${label}[${i}]`] = Object.values(e).join('; ');
      return value;
    });
  const prods = list(body.products, cleanProduct, 'products').map((p, i) => p && { ...p, position: i });
  const promos = list(body.promotions, cleanPromotion, 'promotions');
  const { value: settings, errors: se } = cleanSettings(body.settings);
  if (se) Object.assign(errors, se);
  if (Object.keys(errors).length) throw invalid(errors);

  // One transaction: the database is either fully imported or untouched.
  await db.batch(
    [
      'DELETE FROM products',
      'DELETE FROM promotions',
      ...prods.map((p) => upsert('products', p)),
      ...promos.map((p) => upsert('promotions', p)),
      {
        sql: "INSERT INTO settings (id, data, updated_at) VALUES ('site', ?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at",
        args: [JSON.stringify(withRateHistory(settings, null)), now()],
      },
    ],
    'write',
  );
  send(res, 201, await readContent({ includeHidden: true }));
}

async function saveSettings(req, res) {
  const db = await getDb();
  await requireInitialized(db);
  const next = cleanOrThrow(cleanSettings, await readJson(req));
  const prev = await readSettings(db);
  // Each panel saves its own part; keep the parts it does not send.
  const keep = (k) => next[k] ?? prev?.[k] ?? null;
  const doc = withRateHistory({ ...next, screen: keep('screen'), styling: keep('styling'), categories: keep('categories') }, prev);
  await db.execute({ sql: "UPDATE settings SET data = ?, updated_at = ? WHERE id = 'site'", args: [JSON.stringify(doc), now()] });
  send(res, 200, doc);
}

async function uploadImage(req, res) {
  const { dataUrl } = await readJson(req);
  const m = /^data:((?:image|video)\/[a-z0-9]+);base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl ?? ''));
  if (!m || !MEDIA_TYPES.includes(m[1])) throw new HttpError(415, 'Upload a WebP, JPEG or PNG image, or an MP4 or WebM video');
  const data = Buffer.from(m[2], 'base64');
  if (data.length > MAX_MEDIA_BYTES) throw new HttpError(413, 'The file is larger than 3 MB');
  const db = await getDb();
  const id = randomBytes(12).toString('hex');
  await db.execute({ sql: 'INSERT INTO images (id, content_type, size, data, created_at) VALUES (?, ?, ?, ?, ?)', args: [id, m[1], data.length, data, now()] });
  send(res, 201, { url: `/api/images/${id}` });
}

async function serveImage(req, res, id) {
  if (!/^[a-f0-9]{24}$/.test(id)) throw new HttpError(404, 'Not found');
  const db = await getDb();
  const { rows } = await db.execute({ sql: 'SELECT content_type, data FROM images WHERE id = ?', args: [id] });
  if (!rows.length) throw new HttpError(404, 'Not found');
  const body = Buffer.from(rows[0].data);
  res.setHeader('Content-Type', rows[0].content_type);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // uploads never change; a new file gets a new id
  res.setHeader('Accept-Ranges', 'bytes');
  // Byte ranges: browsers (Safari in particular) request videos in parts.
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? '');
  if (range && (range[1] || range[2])) {
    const start = range[1] ? Number(range[1]) : Math.max(0, body.length - Number(range[2]));
    const end = range[1] && range[2] ? Math.min(Number(range[2]), body.length - 1) : body.length - 1;
    if (start > end || start >= body.length) {
      res.statusCode = 416;
      res.setHeader('Content-Range', `bytes */${body.length}`);
      return res.end();
    }
    res.statusCode = 206;
    res.setHeader('Content-Range', `bytes ${start}-${end}/${body.length}`);
    res.setHeader('Content-Length', end - start + 1);
    return res.end(body.subarray(start, end + 1));
  }
  res.statusCode = 200;
  res.setHeader('Content-Length', body.length);
  res.end(body);
}

async function admin(req, res, path) {
  const [section, id] = path;
  if (section === 'login' && req.method === 'POST') {
    const { password } = await readJson(req);
    await login(req, res, password);
    return send(res, 200, { signedIn: true });
  }
  if (section === 'logout' && req.method === 'POST') {
    logout(req, res);
    return send(res, 200, { signedIn: false });
  }
  if (section === 'session') {
    const signedIn = await isSignedIn(req);
    return send(res, 200, {
      signedIn,
      configured: { database: isDbConfigured(), signIn: await isAuthConfigured() },
      rates: ratesConfig(),
      ...(signedIn ? { password: await passwordInfo() } : {}),
    });
  }

  await requireAdmin(req);
  if (section === 'password' && req.method === 'PUT') return send(res, 200, await changePassword(req, res, await readJson(req)));
  if (section === 'content' && req.method === 'GET') return send(res, 200, await readContent({ includeHidden: true }));
  if (section === 'import' && req.method === 'POST') return importContent(req, res);
  if (section === 'products') return products(req, res, id);
  if (section === 'promotions') return promotions(req, res, id);
  if (section === 'ads') return ads(req, res, id);
  if (section === 'ads-order' && req.method === 'PUT') return orderAds(req, res);
  if (section === 'settings' && req.method === 'PUT') return saveSettings(req, res);
  if (section === 'images' && req.method === 'POST') return uploadImage(req, res);
  throw new HttpError(404, 'Not found');
}

/** One entry point for /api/content, /api/images/* and /api/admin/*. */
export async function contentApiHandler(req, res) {
  // Vercel rewrites pass the original path in ?path=; under Vite req.originalUrl has it.
  const url = new URL(req.originalUrl ?? req.url, 'http://local');
  const pathname = url.searchParams.get('path') ?? url.pathname;
  const parts = pathname
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .map(decodeURIComponent); // ['api', 'admin', ...]
  try {
    if (parts[1] === 'content' && req.method === 'GET') {
      if (!isDbConfigured()) return send(res, 200, { initialized: false });
      // Pages check this every few seconds for admin changes (src/content/siteContent.js):
      // a 5-second shared cache, and an ETag so an unchanged answer is a tiny 304.
      const content = await readContent({ includeHidden: false });
      const etag = `"c-${content.updatedAt ?? 'none'}"`;
      const cache = 'public, max-age=0, s-maxage=5, stale-while-revalidate=30';
      if (req.headers['if-none-match'] === etag) {
        res.statusCode = 304;
        res.setHeader('ETag', etag);
        res.setHeader('Cache-Control', cache);
        return res.end();
      }
      return send(res, 200, content, { cache, headers: { ETag: etag } });
    }
    if (parts[1] === 'images' && req.method === 'GET') return await serveImage(req, res, parts[2] ?? '');
    if (parts[1] === 'admin') return await admin(req, res, parts.slice(2));
    throw new HttpError(404, 'Not found');
  } catch (error) {
    const status = error.status ?? 500;
    if (status === 500) console.error('[content api]', error);
    send(res, status, { error: status === 500 ? 'Something went wrong' : error.message, ...(error.errors ? { errors: error.errors } : {}) });
  }
}
