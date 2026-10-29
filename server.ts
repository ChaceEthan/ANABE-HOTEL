import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { apiRouter } from './src/server/api.ts';
import { getJwtSecret } from './src/server/auth.ts';
import { initDatabase, isDatabasePostgres } from './src/server/db/database.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  if (isProd) {
    getJwtSecret();
  }

  const app = express();

  // CORS Configuration
  const configuredOrigins = [
    process.env.VITE_APP_URL,
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN,
  ].filter(Boolean) as string[];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        // Allow localhost and local IP origins
        if (/^https?:\/\/localhost(:\d+)?$/.test(origin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }

        // Allow explicitly configured origins
        if (configuredOrigins.some((o) => origin === o || origin.startsWith(o))) {
          return callback(null, true);
        }

        // Allow vercel preview and production subdomains
        if (/\.vercel\.app$/.test(new URL(origin).hostname)) {
          return callback(null, true);
        }

        // Allow Render domains
        if (/\.onrender\.com$/.test(new URL(origin).hostname)) {
          return callback(null, true);
        }

        // Allow in development or fallback
        if (!isProd) return callback(null, true);
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Basic Middleware
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Lightweight Health Check Endpoint for Render and monitoring
  const healthHandler = (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'anabe-hotel',
      timestamp: new Date().toISOString(),
      database: isDatabasePostgres() ? 'neon-postgres' : 'local-json',
      uptime: Math.floor(process.uptime()),
    });
  };

  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

  // Initialize and warm up database
  try {
    const db = await initDatabase();
    console.log(
      `[ANABE HOTEL] Database initialized with ${db.rooms.length} rooms (Storage: ${
        isDatabasePostgres() ? 'Neon PostgreSQL' : 'Local JSON'
      }).`
    );
  } catch (err) {
    console.error('[ANABE HOTEL] Database initialization error:', err);
  }

  // Mount API router
  app.use('/api', apiRouter);

  // Locate assets directory (handles both dev and bundled dist environments)
  const publicImagesDir = fs.existsSync(path.resolve(__dirname, 'public/images'))
    ? path.resolve(__dirname, 'public/images')
    : path.resolve(__dirname, '../public/images');

  const publicLogoDir = fs.existsSync(path.resolve(__dirname, 'public/logo'))
    ? path.resolve(__dirname, 'public/logo')
    : path.resolve(__dirname, '../public/logo');

  const publicUploadsDir = fs.existsSync(path.resolve(__dirname, 'public/uploads'))
    ? path.resolve(__dirname, 'public/uploads')
    : path.resolve(__dirname, '../public/uploads');

  const srcImagesDir = fs.existsSync(path.resolve(__dirname, 'src/assets/images'))
    ? path.resolve(__dirname, 'src/assets/images')
    : publicImagesDir;

  app.use('/images', express.static(publicImagesDir));
  app.use('/logo', express.static(publicLogoDir));
  app.use('/uploads', express.static(publicUploadsDir));
  app.use('/src/assets/images', express.static(srcImagesDir));
  app.use('/assets/images', express.static(publicImagesDir));

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
    const actualDist = fs.existsSync(distPath) ? distPath : __dirname;
    app.use(express.static(actualDist));

    app.get('*', (_req, res) => {
      res.sendFile(path.join(actualDist, 'index.html'));
    });
    console.log(`[ANABE HOTEL] Production static assets mounted from ${actualDist}.`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ANABE HOTEL] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[ANABE HOTEL] Failed to start server:', err);
  process.exit(1);
});
