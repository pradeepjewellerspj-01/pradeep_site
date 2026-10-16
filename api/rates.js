// GET /api/rates on serverless hosts that map files in /api to functions (e.g. Vercel).
// Returns IBJA's latest published rates; see server/ibja.mjs.
import { ratesHandler } from '../server/ibja.mjs';

export default ratesHandler;
