// Small helpers shared by the site's API handlers. They work with plain Node
// request/response objects, so the same handlers run under Vite (dev/preview)
// and as Vercel functions.

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function send(res, status, body, { cache = 'no-store', headers = {} } = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', cache);
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(body));
}

const MAX_BODY = 6 * 1024 * 1024; // images arrive base64-encoded, already resized in the browser

/** JSON body: Vercel pre-parses it; under Vite we read the stream ourselves. */
export async function readJson(req) {
  if (req.body !== undefined && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw new HttpError(413, 'Request is too large');
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw new HttpError(400, 'Invalid JSON');
  }
}

export const clientIp = (req) =>
  String(req.headers['x-forwarded-for'] ?? '')
    .split(',')[0]
    .trim() ||
  req.socket?.remoteAddress ||
  'unknown';

export function parseCookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie ?? '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export const isHttps = (req) => req.headers['x-forwarded-proto'] === 'https' || Boolean(req.socket?.encrypted);
