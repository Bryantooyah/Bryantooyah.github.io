import { app } from './app.js';
import { env } from './env.js';
import { closePool } from './db/pool.js';

/**
 * Local development entry point only. In production on Vercel the app is
 * invoked through api/index.ts and this file never runs.
 */
const server = app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${String(env.PORT)}`);
  console.log(`Health check:     http://localhost:${String(env.PORT)}/api/health`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`\n${signal} received, shutting down.`);
  server.close(() => {
    void closePool().then(() => process.exit(0));
  });
  // Do not hang forever on a stuck connection.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
