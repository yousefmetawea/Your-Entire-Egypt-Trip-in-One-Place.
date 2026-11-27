import { Readable } from 'node:stream';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import type { Plugin } from 'vite';

/**
 * Dev only: serves /api/ai/* with the same handlers Vercel runs in production.
 * Env is read on the server (client/.env.local) and is never sent to the browser.
 */
function aiDevApi(mode: string): Plugin {
  return {
    name: 'yourtrip-ai-dev-api',
    apply: 'serve',
    configureServer(server) {
      const env = loadEnv(mode, process.cwd(), '');
      server.middlewares.use(async (req, res, next) => {
        const path = (req.url ?? '').split('?')[0];
        if (path !== '/api/ai/plan' && path !== '/api/ai/ask') return next();
        try {
          const host = req.headers.host ?? 'localhost';
          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (typeof value === 'string') headers.set(key, value);
          }
          const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
          const request = new Request(`http://${host}${req.url ?? ''}`, {
            method: req.method,
            headers,
            body: hasBody ? (Readable.toWeb(req) as ReadableStream) : undefined,
            duplex: 'half',
          });
          type Deps = { env: Record<string, string | undefined> };
          type Handler = (request: Request, deps: Deps) => Promise<Response>;
          const depsModule = (await server.ssrLoadModule('/ai-api/deps.ts')) as {
            defaultDeps: () => Deps;
          };
          const deps = depsModule.defaultDeps();
          deps.env = { ...deps.env, ...env };
          const isPlan = path === '/api/ai/plan';
          const handlerModule = (await server.ssrLoadModule(
            isPlan ? '/ai-api/plan.ts' : '/ai-api/ask.ts',
          )) as Record<string, Handler>;
          const target = handlerModule[isPlan ? 'handlePlan' : 'handleAsk'];
          if (!target) throw new Error('missing handler');
          const response = await target(request, deps);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch {
          res.statusCode = 500;
          res.setHeader('content-type', 'application/json');
          res.end('{"error":{"code":"unavailable","message":"Something went wrong."}}');
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), aiDevApi(mode)],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
}));
