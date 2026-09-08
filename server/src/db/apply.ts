import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { closePool, query } from './pool.js';

/** Applies schema.sql. Idempotent — every statement is CREATE ... IF NOT EXISTS. */
async function main(): Promise<void> {
  const schemaPath = fileURLToPath(new URL('./schema.sql', import.meta.url));
  const sql = await readFile(schemaPath, 'utf8');

  await query(sql);
  console.log('Schema applied.');
}

main()
  .catch((err: unknown) => {
    console.error('Failed to apply schema:', err);
    process.exitCode = 1;
  })
  .finally(() => closePool());
