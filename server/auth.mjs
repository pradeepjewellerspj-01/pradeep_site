import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { HttpError, clientIp, isHttps, parseCookies } from './http.mjs';

/**
 * Single-admin sign-in. The password lives only in the ADMIN_PASSWORD
 * environment variable; a successful sign-in sets a signed, HttpOnly session
 * cookie. Changing ADMIN_PASSWORD (or ADMIN_SECRET) signs every session out.
 */

const COOKIE = 'pj_admin';
const SESSION_HOURS = 12;
const MIN_PASSWORD = 10;

const secret = () => {
  const pw = process.env.ADMIN_PASSWORD ?? '';
  return createHash('sha256')
    .update(`pj-admin|${process.env.ADMIN_SECRET ?? ''}|${pw}`)
    .digest();
};

export const isAuthConfigured = () => (process.env.ADMIN_PASSWORD ?? '').length >= MIN_PASSWORD;

const sign = (payload) => createHmac('sha256', secret()).update(payload).digest('base64url');

const safeEqual = (a, b) => {
  const x = createHash('sha256').update(String(a)).digest();
  const y = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(x, y);
};

function cookie(req, value, maxAge) {
  return [`${COOKIE}=${value}`, 'Path=/api', 'HttpOnly', 'SameSite=Strict', `Max-Age=${maxAge}`, ...(isHttps(req) ? ['Secure'] : [])].join('; ');
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

function recordFailure(ip) {
  const f = failures.get(ip) ?? { first: Date.now(), count: 0 };
  f.count += 1;
  failures.set(ip, f);
}

export async function login(req, res, password) {
  if (!isAuthConfigured()) throw new HttpError(503, `Admin sign-in is not configured (set ADMIN_PASSWORD, at least ${MIN_PASSWORD} characters)`);
  const ip = clientIp(req);
  throttle(ip);
  if (typeof password !== 'string' || !safeEqual(password, process.env.ADMIN_PASSWORD)) {
    recordFailure(ip);
    await new Promise((r) => setTimeout(r, 600));
    throw new HttpError(401, 'Incorrect password');
  }
  failures.delete(ip);
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_HOURS * 3600_000 })).toString('base64url');
  res.setHeader('Set-Cookie', cookie(req, `${payload}.${sign(payload)}`, SESSION_HOURS * 3600));
}

export function logout(req, res) {
  res.setHeader('Set-Cookie', cookie(req, '', 0));
}

export function isSignedIn(req) {
  if (!isAuthConfigured()) return false;
  const token = parseCookies(req)[COOKIE];
  if (!token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return false;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now();
  } catch {
    return false;
  }
}

/**
 * Guards every admin request. Writes also need the custom header, which a
 * cross-site form cannot send (with SameSite=Strict, a second CSRF guard).
 */
export function requireAdmin(req) {
  if (!isSignedIn(req)) throw new HttpError(401, 'Please sign in');
  if (req.method !== 'GET' && req.headers['x-pj-admin'] !== '1') throw new HttpError(403, 'Missing admin header');
}
