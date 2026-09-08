import pg from 'pg';
import type { QueryResult, QueryResultRow } from 'pg';
import { env, isProduction } from '../env.js';

const { Pool } = pg;

let pool: pg.Pool | undefined;

export function getPool(): pg.Pool {
  if (pool) return pool;

  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set — cannot connect to the database');
  }

  pool = new Pool({
    connectionString: env.DATABASE_URL,
    // One connection per process in production. Each serverless invocation is
    // its own process, so anything larger multiplies directly into Neon's
    // connection cap under concurrency. Locally a normal pool is fine.
    max: isProduction ? 1 : 10,
    ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : undefined,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

  pool.on('error', (err) => {
    // An idle client erroring out must not take the process down.
    console.error('Unexpected idle client error', err);
  });

  return pool;
}

export function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params);
}

/** Release the pool. Used by tests and by the local dev server on shutdown. */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
