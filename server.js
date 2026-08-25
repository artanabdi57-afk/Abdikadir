import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import apiApp from './api/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const HOST = '0.0.0.0';

async function startServer() {
  const app = express();

  // Mount backend API endpoints FIRST
  app.use(apiApp);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      root: path.resolve(__dirname, 'sahan-app'),
      server: {
        middlewareMode: true,
        host: HOST,
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'sahan-app/dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[Sahan Platform] Dev server running on http://${HOST}:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[Sahan Platform] Failed to start server:', err);
  process.exit(1);
});
