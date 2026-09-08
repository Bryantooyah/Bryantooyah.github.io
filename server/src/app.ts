import express from 'express';
import type { Express } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { env } from './env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { healthRouter } from './routes/health.js';
import { projectsRouter } from './routes/projects.js';
import { awardsRouter } from './routes/awards.js';
import { githubRouter } from './routes/github.js';
import { contactRouter } from './routes/contact.js';
import { authRouter } from './routes/auth.js';
import { adminRouter } from './routes/admin.js';

/**
 * Builds the Express app without starting a listener.
 *
 * Deliberately separate from index.ts so the same app object can be used three
 * ways: `app.listen()` locally, as a Vercel serverless handler via api/index.ts,
 * and directly by supertest with no port bound at all.
 */
export function createApp(): Express {
  const app = express();

  // Vercel terminates TLS and forwards through its proxy, so the client IP
  // lives in X-Forwarded-For. Without this, express reports the proxy's address
  // and the contact rate limit would treat every visitor as the same person.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // Generous enough for a long project case study, small enough that a giant
  // body cannot be used to tie up the function.
  app.use(express.json({ limit: '200kb' }));
  app.use(cookieParser());

  // Only needed when the API is served from a different origin than the site
  // (the Render fallback). On Vercel the function is same-origin and this is a
  // no-op. `credentials` matters because the admin session is a cookie.
  if (env.CORS_ORIGIN) {
    const origins = env.CORS_ORIGIN.split(',').map((value) => value.trim());
    app.use(cors({ origin: origins, credentials: true }));
  }

  app.use('/api/health', healthRouter);
  app.use('/api/projects', projectsRouter);
  app.use('/api/awards', awardsRouter);
  app.use('/api/github', githubRouter);
  app.use('/api/contact', contactRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app: Express = createApp();
export default app;
