import bcrypt from 'bcryptjs';
import { closePool, query } from './pool.js';
import { env } from '../env.js';

/**
 * Creates or updates the admin account. Deliberately separate from seed.ts.
 *
 * Content gets re-seeded routinely — after editing a project, refreshing the
 * snapshot, and so on. Credentials should not ride along with that. Bundled
 * together, a content re-seed run against production silently rewrites the
 * admin password to whatever SEED_ADMIN_PASSWORD resolves to, which for anyone
 * with a dev value in server/.env means quietly downgrading the live
 * credential to a known one.
 *
 *   npm run db:seed        content only, safe to re-run
 *   npm run db:seed:admin  credentials only, run deliberately
 */
async function main(): Promise<void> {
  if (!env.SEED_ADMIN_PASSWORD) {
    throw new Error(
      'SEED_ADMIN_PASSWORD is not set. Set it in the environment for this command only — ' +
        'do not leave a production password in server/.env.',
    );
  }
  if (env.SEED_ADMIN_PASSWORD.length < 12) {
    throw new Error('SEED_ADMIN_PASSWORD must be at least 12 characters');
  }

  // Cost 12 is the sensible floor for a password guarding write access.
  const hash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 12);
  await query(
    `INSERT INTO admin_users (email, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [env.SEED_ADMIN_EMAIL.toLowerCase(), hash],
  );

  console.log(`Admin account set: ${env.SEED_ADMIN_EMAIL}`);
}

main()
  .catch((err: unknown) => {
    console.error('Admin seed failed:', err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => closePool());
