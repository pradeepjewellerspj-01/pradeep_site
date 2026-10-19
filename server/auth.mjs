import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { HttpError, clientIp, isHttps, parseCookies } from './http.mjs';
import { getDb, isDbConfigured } from './db.mjs';

/**
 * Single-admin sign-in.
 *
 * The first password is the ADMIN_PASSWORD environment variable. Once the
 * admin changes it in the panel, a salted scrypt hash is stored in the
 * database (table admin_auth) and replaces it; the password itself is never
 * stored. ADMIN_PASSWORD works again only after `npm run admin:reset-password`
 * removes the stored hash (for a forgotten password).
 *
 * A successful sign-in sets a signed, HttpOnly session cookie. The signing key
 * includes the current password (or its hash), so changing the password, or
 * ADMIN_SECRET, signs every other session out.
 */

const COOKIE = 'pj_admin';
const SESSION_HOURS = 12;
export const MIN_PASSWORD = 10;
const MAX_PASSWORD = 200;
const AUTH_ID = 'admin';

const scryptAsync = promisify(scrypt);
const SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const KEY_LEN = 64;

const envPassword = () => process.env.ADMIN_PASSWORD ?? '';

/** The password set in the panel ({ salt, hash, changedAt }), or null while ADMIN_PASSWORD applies. */
async function storedPassword() {
  if (!isDbConfigured()) return null;
  const db = await getDb();
  const { rows } = await db.execute({ sql: 'SELECT data FROM admin_auth WHERE id = ?', args: [AUTH_ID] });
  return rows[0] ? JSON.parse(rows[0].data) : null;
}

const hashPassword = async (password, salt) => (await scryptAsync(password, Buffer.from(salt, 'base64'), KEY_LEN, SCRYPT)).toString('base64');

const safeEqual = (a, b) => {
  const x = createHash('sha256').update(String(a)).digest();
  const y = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(x, y);
};

/** Whether `password` is the current admin password. */
async function verify(password, stored) {
  if (typeof password !== 'string' || !password) return false;
  if (stored) return safeEqual(await hashPassword(password, stored.salt), stored.hash);
  return envPassword().length >= MIN_PASSWORD && safeEqual(password, envPassword());
}

// The session signing key: changes whenever the password does.
const secret = (stored) =>
  createHash('sha256')
    .update(`pj-admin|${process.env.ADMIN_SECRET ?? ''}|${stored ? `db:${stored.hash}` : `env:${envPassword()}`}`)
    .digest();

const sign = (payload, stored) => createHmac('sha256', secret(stored)).update(payload).digest('base64url');

export async function isAuthConfigured() {
  if (envPassword().length >= MIN_PASSWORD) return true;
  try {
    return Boolean(await storedPassword());
  } catch {
    return false;
  }
}

function cookie(req, value, maxAge) {
  return [`${COOKIE}=${value}`, 'Path=/api', 'HttpOnly', 'SameSite=Strict', `Max-Age=${maxAge}`, ...(isHttps(req) ? ['Secure'] : [])].join('; ');
}

function startSession(req, res, stored) {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_HOURS * 3600_000 })).toString('base64url');
  res.setHeader('Set-Cookie', cookie(req, `${payload}.${sign(payload, stored)}`, SESSION_HOURS * 3600));
}

// Best-effort throttle: 5 failed attempts per IP per 15 minutes (per server instance).
const failures = new Map();
const WINDOW_MS = 15 * 60_000;
const MAX_FAILURES = 5;

function throttle(ip) {
  const now = Date.now();
  const f = failures.get(ip);
  if (f && now - f.first < WINDOW_MS && f.count >= MAX_FAILURES) throw new HttpError(429, 'Too many attempts. Try again in 15 minutes.');
  if (f && now - f.first >= WINDOW_MS) failures.delete(ip);
}

async function refuse(ip, message, status = 401, errors) {
  const f = failures.get(ip) ?? { first: Date.now(), count: 0 };
  f.count += 1;
  failures.set(ip, f);
  await new Promise((r) => setTimeout(r, 600));
  throw Object.assign(new HttpError(status, message), errors ? { errors } : {});
}

export async function login(req, res, password) {
  if (!(await isAuthConfigured())) throw new HttpError(503, `Admin sign-in is not configured (set ADMIN_PASSWORD, at least ${MIN_PASSWORD} characters)`);
  const ip = clientIp(req);
  throttle(ip);
  const stored = await storedPassword();
  if (!(await verify(password, stored))) await refuse(ip, 'Incorrect password');
  failures.delete(ip);
  startSession(req, res, stored);
}

export function logout(req, res) {
  res.setHeader('Set-Cookie', cookie(req, '', 0));
}

export async function isSignedIn(req) {
  const token = parseCookies(req)[COOKIE];
  if (!token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const stored = await storedPassword();
  if (!stored && envPassword().length < MIN_PASSWORD) return false;
  if (!safeEqual(sig, sign(payload, stored))) return false;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now();
  } catch {
    return false;
  }
}

/** When the password was last changed in the panel (null: still ADMIN_PASSWORD). */
export async function passwordInfo() {
  const stored = await storedPassword().catch(() => null);
  return { changedAt: stored?.changedAt ?? null, canChange: isDbConfigured() };
}

/**
 * Changes the password (signed in, with the current password). Every other
 * session ends; this one gets a fresh cookie and stays signed in.
 */
export async function changePassword(req, res, { current, next } = {}) {
  if (!isDbConfigured()) throw new HttpError(503, 'Changing the password needs the database (TURSO_DATABASE_URL).');
  const ip = clientIp(req);
  throttle(ip);
  const stored = await storedPassword();
  // 400, not 401: a mistyped current password must not sign the admin out.
  if (!(await verify(current, stored))) await refuse(ip, 'Please check the highlighted fields', 400, { current: 'The current password is not correct' });
  failures.delete(ip);

  const errors = {};
  if (typeof next !== 'string' || next.length < MIN_PASSWORD) errors.next = `Use at least ${MIN_PASSWORD} characters`;
  else if (next.length > MAX_PASSWORD) errors.next = `Use at most ${MAX_PASSWORD} characters`;
  else if (next.trim() !== next) errors.next = 'Do not start or end with a space';
  else if (next === current) errors.next = 'Choose a password different from the current one';
  else if (new Set(next).size < 4) errors.next = 'Too easy to guess: use more different characters';
  if (Object.keys(errors).length) throw Object.assign(new HttpError(400, 'Please choose another password'), { errors });

  const salt = randomBytes(16).toString('base64');
  const record = { salt, hash: await hashPassword(next, salt), changedAt: new Date().toISOString() };
  const db = await getDb();
  await db.execute({
    sql: 'INSERT INTO admin_auth (id, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at',
    args: [AUTH_ID, JSON.stringify(record), record.changedAt],
  });
  startSession(req, res, record);
  return { changedAt: record.changedAt };
}

/**
 * Guards every admin request. Writes also need the custom header, which a
 * cross-site form cannot send (with SameSite=Strict, a second CSRF guard).
 */
export async function requireAdmin(req) {
  if (!(await isSignedIn(req))) throw new HttpError(401, 'Please sign in');
  if (req.method !== 'GET' && req.headers['x-pj-admin'] !== '1') throw new HttpError(403, 'Missing admin header');
}
