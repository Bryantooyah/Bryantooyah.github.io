import bcrypt from 'bcryptjs';
import request from 'supertest';
import { app } from '../src/app.js';
import { query } from '../src/db/pool.js';

export const ADMIN_EMAIL = 'admin@example.com';
export const ADMIN_PASSWORD = 'test-password-12345';

/** Inserts the admin account and returns the session cookie for it. */
export async function loginAsAdmin(): Promise<string> {
  // Cost 4 keeps the test suite fast; production seeding uses 12.
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 4);
  await query(
    `INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [ADMIN_EMAIL, hash],
  );

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    .expect(200);

  const cookies = res.headers['set-cookie'];
  const cookie = Array.isArray(cookies) ? cookies[0] : cookies;
  if (!cookie) throw new Error('Login did not return a session cookie');
  return cookie;
}

export async function insertProject(
  overrides: Partial<{
    slug: string;
    title: string;
    summary: string;
    description: string | null;
    tech: string[];
    repoUrl: string | null;
    year: number | null;
    featured: boolean;
    sortOrder: number;
  }> = {},
): Promise<number> {
  const p = {
    slug: 'sample-project',
    title: 'Sample Project',
    summary: 'A sample summary',
    description: '## Heading\n\nSome long-form case study content.',
    tech: ['TypeScript', 'React'],
    repoUrl: 'https://github.com/example/repo',
    year: 2025,
    featured: true,
    sortOrder: 1,
    ...overrides,
  };

  const { rows } = await query<{ id: number }>(
    `INSERT INTO projects (slug, title, summary, description, tech, repo_url, year, featured, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    [
      p.slug,
      p.title,
      p.summary,
      p.description,
      p.tech,
      p.repoUrl,
      p.year,
      p.featured,
      p.sortOrder,
    ],
  );
  return rows[0]!.id;
}
