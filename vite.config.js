import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { ratesHandler } from './server/ibja.mjs';
import { contentApiHandler } from './server/content.mjs';

// Serves the site's API from `npm run dev` and `npm run preview`:
// /api/rates (live IBJA rates) and the admin content API (server/content.mjs).
const siteApi = () => {
  // Must not return anything: Vite treats a returned function as a post-hook.
  const mount = (server) => {
    server.middlewares.use('/api/rates', ratesHandler);
    for (const path of ['/api/content', '/api/images', '/api/admin']) server.middlewares.use(path, contentApiHandler);
  };
  return { name: 'pradeep-site-api', configureServer: mount, configurePreviewServer: mount };
};

export default defineConfig(({ mode }) => {
  // Server-only secrets (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, ADMIN_PASSWORD) from .env for the local API.
  // They are never exposed to the browser: only VITE_* variables are.
  for (const [k, v] of Object.entries(loadEnv(mode, process.cwd(), ''))) if (!(k in process.env)) process.env[k] = v;
  return config;
});

const config = {
  plugins: [react(), tailwindcss(), siteApi()],
  build: {
    rolldownOptions: {
      output: {
        // Long-lived vendor chunks cache independently of app code.
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
            { name: 'gsap', test: /node_modules[\\/](gsap|@gsap)[\\/]/ },
            { name: 'swiper', test: /node_modules[\\/]swiper[\\/]/ },
            { name: 'icons', test: /node_modules[\\/]lucide-react[\\/]/ },
          ],
        },
      },
    },
  },
};
