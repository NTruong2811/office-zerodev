import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

function localCorsProxyPlugin(): Plugin {
  return {
    name: 'local-cors-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/proxy')) {
          return next();
        }

        try {
          const urlObj = new URL(req.url, 'http://localhost');
          let targetUrl = urlObj.searchParams.get('url');
          if (!targetUrl) {
            res.statusCode = 400;
            res.end('Missing url parameter');
            return;
          }

          for (let i = 0; i < 4; i++) {
            if (
              targetUrl.includes('%3A') ||
              targetUrl.includes('%3a') ||
              targetUrl.includes('%2F') ||
              targetUrl.includes('%2f') ||
              targetUrl.includes('%25')
            ) {
              try {
                const decoded = decodeURIComponent(targetUrl);
                if (decoded === targetUrl) break;
                targetUrl = decoded;
              } catch {
                break;
              }
            } else {
              break;
            }
          }

          const response = await fetch(targetUrl);
          if (!response.ok) {
            res.statusCode = response.status;
            res.end(`Remote server returned ${response.status}`);
            return;
          }

          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', '*');

          const contentType = response.headers.get('content-type');
          if (contentType) res.setHeader('Content-Type', contentType);

          const contentLength = response.headers.get('content-length');
          if (contentLength) res.setHeader('Content-Length', contentLength);

          const buffer = Buffer.from(await response.arrayBuffer());
          res.end(buffer);
        } catch (err: any) {
          res.statusCode = 500;
          res.end(`Proxy error: ${err?.message || err}`);
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), localCorsProxyPlugin()],
})
