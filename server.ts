import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { apiRouter } from './src/server/api.ts';
import { getDatabase } from './src/server/db/database.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();

  // Basic Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Initialize and warm up database
  try {
    const db = getDatabase();
    console.log(`[ANABE HOTEL] Database initialized with ${db.rooms.length} rooms.`);
  } catch (err) {
    console.error('[ANABE HOTEL] Database initialization error:', err);
  }

  // Mount API router
  app.use('/api', apiRouter);

  // Serve static public assets (logos, favicons) and generated asset images
  app.use(express.static(path.resolve(__dirname, 'public')));
  app.use('/src/assets/images', express.static(path.resolve(__dirname, 'src/assets/images')));

  if (!isProd) {
    // Development mode: attach Vite dev server middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
    console.log('[ANABE HOTEL] Vite development server middleware mounted.');
  } else {
    // Production mode: serve static build assets
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[ANABE HOTEL] Production static assets mounted from dist.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ANABE HOTEL] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[ANABE HOTEL] Failed to start server:', err);
  process.exit(1);
});
