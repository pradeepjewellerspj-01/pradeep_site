// /api/content, /api/images/:id and /api/admin/* on Vercel (routed here by
// vercel.json, which passes the original path as ?path=). See server/content.mjs.
import { contentApiHandler } from '../server/content.mjs';

export default contentApiHandler;
