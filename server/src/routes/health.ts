import { Router } from 'express';
import { query } from '../db/pool.js';
import { features } from '../env.js';

export const healthRouter: Router = Router();

/**
 * Always answers 200 while the process is serving. The database status is
 * reported in the body rather than through the status code, so a transient
 * Postgres blip does not cause the platform health check to recycle a server
 * that is otherwise fine.
 */
healthRouter.get('/', async (_req, res) => {
  let database: 'up' | 'down' = 'down';
  try {
    await query('SELECT 1');
    database = 'up';
  } catch (err) {
    console.error('Health check: database unreachable', err);
  }

  res.json({
    ok: true,
    database,
    features,
    timestamp: new Date().toISOString(),
  });
});
