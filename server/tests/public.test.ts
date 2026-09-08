import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { insertProject, ADMIN_EMAIL, ADMIN_PASSWORD, loginAsAdmin } from './helpers.js';
import { query } from '../src/db/pool.js';

describe('GET /api/health', () => {
  it('reports the database as reachable', async () => {
    const res = await request(app).get('/api/health').expect(200);
    expect(res.body).toMatchObject({ ok: true, database: 'up' });
  });
});

describe('GET /api/projects', () => {
  it('withholds the long-form description from the list', async () => {
    await insertProject({ description: 'A very long case study body.' });

    const res = await request(app).get('/api/projects').expect(200);
    expect(res.body).toHaveLength(1);
    // The list view never renders it, and it can run to several KB.
    expect(res.body[0].description).toBeNull();
    expect(res.body[0].summary).toBe('A sample summary');
  });

  it('orders featured projects first', async () => {
    await insertProject({ slug: 'plain', featured: false, sortOrder: 1 });
    await insertProject({ slug: 'starred', featured: true, sortOrder: 2 });

    const res = await request(app).get('/api/projects').expect(200);
    expect(res.body.map((p: { slug: string }) => p.slug)).toEqual(['starred', 'plain']);
  });
});

describe('GET /api/projects/:slug', () => {
  it('includes the description', async () => {
    await insertProject({ slug: 'detailed', description: '## Case study' });

    const res = await request(app).get('/api/projects/detailed').expect(200);
    expect(res.body.description).toBe('## Case study');
  });

  it('404s for an unknown slug', async () => {
    await request(app).get('/api/projects/does-not-exist').expect(404);
  });
});

describe('GET /api/awards', () => {
  it('returns awards in sort order', async () => {
    await query(
      `INSERT INTO awards (title, issuer, year, sort_order)
       VALUES ('Second', 'B', 2023, 2), ('First', 'A', 2024, 1)`,
    );

    const res = await request(app).get('/api/awards').expect(200);
    expect(res.body.map((a: { title: string }) => a.title)).toEqual(['First', 'Second']);
  });
});

describe('POST /api/auth/login', () => {
  it('issues an httpOnly session cookie on success', async () => {
    const cookie = await loginAsAdmin();
    expect(cookie).toContain('HttpOnly');
  });

  it('gives the same error for a wrong password and an unknown account', async () => {
    await loginAsAdmin();

    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: ADMIN_EMAIL, password: 'definitely-wrong' })
      .expect(401);

    const unknownUser = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: ADMIN_PASSWORD })
      .expect(401);

    // Differing messages would let an attacker enumerate valid accounts.
    expect(wrongPassword.body.error).toBe(unknownUser.body.error);
  });
});

describe('unknown routes', () => {
  it('404s with a JSON body', async () => {
    const res = await request(app).get('/api/not-a-route').expect(404);
    expect(res.body.error).toBe('Not found');
  });
});
