import { HttpError } from './http.mjs';

/**
 * Turso (libSQL) database for admin-managed content.
 *
 *   TURSO_DATABASE_URL  libsql://<db>-<org>.turso.io  (or file:local.db for local testing)
 *   TURSO_AUTH_TOKEN    database token (not needed for file: URLs)
 *
 * Remote databases use the HTTP client (no native module, safe on serverless);
 * file: URLs use the Node client. Tables are created on first use.
 */

const SCHEMA = [
  // Each record is stored whole as JSON; the extra columns are for filtering and sorting.
  'CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, position REAL NOT NULL DEFAULT 0, hidden INTEGER NOT NULL DEFAULT 0, data TEXT NOT NULL)',
  'CREATE TABLE IF NOT EXISTS promotions (id TEXT PRIMARY KEY, priority INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 0, data TEXT NOT NULL)',
  'CREATE TABLE IF NOT EXISTS ads (id TEXT PRIMARY KEY, position REAL NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, data TEXT NOT NULL)',
  'CREATE TABLE IF NOT EXISTS settings (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at TEXT NOT NULL)',
  'CREATE TABLE IF NOT EXISTS images (id TEXT PRIMARY KEY, content_type TEXT NOT NULL, size INTEGER NOT NULL, data BLOB NOT NULL, created_at TEXT NOT NULL)',
  // The admin password once changed in the panel (a salted scrypt hash; see server/auth.mjs). Never sent to the site.
  'CREATE TABLE IF NOT EXISTS admin_auth (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at TEXT NOT NULL)',
];

let ready = null;

export const isDbConfigured = () => Boolean(process.env.TURSO_DATABASE_URL);

/** The shared client, with tables ensured. Reused across requests and warm serverless invocations. */
export function getDb() {
  if (!isDbConfigured()) return Promise.reject(new HttpError(503, 'Database is not configured (set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN)'));
  if (!ready) {
    const url = process.env.TURSO_DATABASE_URL;
    ready = (url.startsWith('file:') ? import('@libsql/client') : import('@libsql/client/web'))
      .then(async ({ createClient }) => {
        const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN || undefined });
        await client.batch(SCHEMA, 'write');
        return client;
      })
      .catch((error) => {
        ready = null;
        throw error;
      });
  }
  return ready;
}
