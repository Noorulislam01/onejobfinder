import { defineConfig, loadEnv } from 'vite';
import joobleHandler from './api/jooble.js';
import linkedinJobsHandler from './api/linkedin-jobs.js';

export default defineConfig(({ mode }) => {
  const serverEnv = { ...process.env, ...loadEnv(mode, process.cwd(), '') };
  return {
    plugins: [{
      name: 'jooble-dev-api',
      configureServer(server) {
        const handlers = { '/api/jooble': joobleHandler, '/api/linkedin-jobs': linkedinJobsHandler };
        const apiMiddleware = async (req, res, next) => {
          const handler = handlers[(req.url || '').split('?')[0]];
          if (!handler) return next();
          if (!['GET', 'POST'].includes(req.method || '')) return next();
          if (req.method === 'POST') {
            try {
              let raw = '';
              for await (const chunk of req) {
                raw += chunk;
                if (raw.length > 10000) { res.writeHead(413); res.end(); return; }
              }
              req.body = JSON.parse(raw || '{}');
            } catch {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Invalid JSON request body.' }));
              return;
            }
          }
          await handler(req, res, serverEnv);
        };
        return () => server.middlewares.stack.unshift({ route: '', handle: apiMiddleware });
      }
    }],
    server: { host: true },
    build: { outDir: 'dist' }
  };
});
