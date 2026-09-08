import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { afterAll, beforeAll, beforeEach } from 'vitest';

/*
  Runs before any test module is imported, which matters: env.ts reads
  process.env at import time, so DATABASE_URL must point at the test database
  before anything pulls in the app. dotenv does not override variables that are
  already set, so these assignments win over server/.env.
*/
const ADMIN_URL = process.env.TEST_ADMIN_DATABASE_URL ?? 'postgres://portfolio:portfolio@localhost:5433/postgres';
const TEST_DB = 'portfolio_test';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = ADMIN_URL.replace(/\/[^/]*$/, `/${TEST_DB}`);
process.env.DATABASE_SSL = 'false';
process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long';
process.env.CONTACT_RATE_LIMIT = '3';
// Never send real email from a test run.
delete process.env.RESEND_API_KEY;

const TABLES = ['contact_messages', 'projects', 'awards', 'admin_users', 'github_cache'];

async function ensureTestDatabase(): Promise<void> {
  // Connect to the maintenance database to create the test one if needed.
  const admin = new pg.Client({ connectionString: ADMIN_URL });
  await admin.connect();
  try {
    const { rowCount } = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      TEST_DB,
    ]);
    if (rowCount === 0) {
      // Identifier cannot be parameterised; TEST_DB is a fixed constant above.
      await admin.query(`CREATE DATABASE ${TEST_DB}`);
    }
  } finally {
    await admin.end();
  }
}

beforeAll(async () => {
  await ensureTestDatabase();

  const schemaPath = fileURLToPath(new URL('../src/db/schema.sql', import.meta.url));
  const sql = await readFile(schemaPath, 'utf8');

  const { query } = await import('../src/db/pool.js');
  await query(sql);
});

beforeEach(async () => {
  const { query } = await import('../src/db/pool.js');
  // RESTART IDENTITY so each test sees predictable ids.
  await query(`TRUNCATE ${TABLES.join(', ')} RESTART IDENTITY CASCADE`);
});

afterAll(async () => {
  const { closePool } = await import('../src/db/pool.js');
  await closePool();
});
