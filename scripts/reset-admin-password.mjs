/**
 * Forgotten admin password: removes the password set in the admin panel, so
 * the ADMIN_PASSWORD environment variable signs in again (and every session
 * ends). Run on a computer with the database settings:
 *
 *   npm run admin:reset-password
 *
 * Reads TURSO_DATABASE_URL and TURSO_AUTH_TOKEN from the environment or from
 * .env / .env.local, like the site. Prints no secrets.
 */
import { loadEnv } from 'vite';

const env = { ...loadEnv('production', process.cwd(), ''), ...process.env };
for (const k of ['TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN', 'ADMIN_PASSWORD']) if (env[k] != null) process.env[k] = env[k];

if (!process.env.TURSO_DATABASE_URL) {
  console.error('TURSO_DATABASE_URL is not set (in the environment or .env.local).');
  process.exit(1);
}

const { getDb } = await import('../server/db.mjs');
const db = await getDb();
const { rowsAffected } = await db.execute({ sql: 'DELETE FROM admin_auth WHERE id = ?', args: ['admin'] });

if (!rowsAffected) console.log('No password was set in the admin panel: ADMIN_PASSWORD already applies.');
else console.log('Done. The password set in the admin panel was removed; sign in with ADMIN_PASSWORD.');
if ((process.env.ADMIN_PASSWORD ?? '').length < 10) console.warn('Note: ADMIN_PASSWORD is missing or shorter than 10 characters here; make sure it is set where the site runs.');
