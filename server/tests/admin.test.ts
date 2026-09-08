import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { insertProject, loginAsAdmin } from './helpers.js';

describe('admin access control', () => {
  it('rejects every admin route without a session', async () => {
    await request(app).get('/api/admin/messages').expect(401);
    await request(app).post('/api/admin/projects').send({}).expect(401);
    await request(app).patch('/api/admin/projects/1').send({}).expect(401);
    await request(app).delete('/api/admin/projects/1').expect(401);
  });

  it('rejects a forged session cookie', async () => {
    await request(app)
      .get('/api/admin/messages')
      .set('Cookie', 'portfolio_admin=not-a-real-jwt')
      .expect(401);
  });
});

describe('PATCH /api/admin/projects/:id', () => {
  /*
    Regression test. projectPatchSchema used to be projectSchema.partial(),
    which still applied the create schema's `.default()` values to absent keys.
    A PATCH of just { title } therefore arrived with tech: [], repoUrl: null and
    year: null, and silently wiped those columns.
  */
  it('leaves fields that were not supplied untouched', async () => {
    const cookie = await loginAsAdmin();
    const id = await insertProject({
      tech: ['TypeScript', 'React'],
      repoUrl: 'https://github.com/example/repo',
      year: 2025,
      featured: true,
      sortOrder: 7,
    });

    const res = await request(app)
      .patch(`/api/admin/projects/${String(id)}`)
      .set('Cookie', cookie)
      .send({ title: 'Renamed' })
      .expect(200);

    expect(res.body).toMatchObject({
      title: 'Renamed',
      tech: ['TypeScript', 'React'],
      repoUrl: 'https://github.com/example/repo',
      year: 2025,
      featured: true,
      sortOrder: 7,
    });
  });

  it('still clears a field when null is sent explicitly', async () => {
    const cookie = await loginAsAdmin();
    const id = await insertProject({ repoUrl: 'https://github.com/example/repo' });

    const res = await request(app)
      .patch(`/api/admin/projects/${String(id)}`)
      .set('Cookie', cookie)
      .send({ repoUrl: null })
      .expect(200);

    expect(res.body.repoUrl).toBeNull();
    // The distinction that matters: absent means "leave alone", null means "clear".
    expect(res.body.tech).toEqual(['TypeScript', 'React']);
  });

  it('rejects an empty patch body', async () => {
    const cookie = await loginAsAdmin();
    const id = await insertProject();

    await request(app)
      .patch(`/api/admin/projects/${String(id)}`)
      .set('Cookie', cookie)
      .send({})
      .expect(400);
  });

  it('404s for an unknown id', async () => {
    const cookie = await loginAsAdmin();
    await request(app)
      .patch('/api/admin/projects/99999')
      .set('Cookie', cookie)
      .send({ title: 'Nope' })
      .expect(404);
  });
});

describe('POST /api/admin/projects', () => {
  it('rejects a slug that is not url-safe', async () => {
    const cookie = await loginAsAdmin();
    const res = await request(app)
      .post('/api/admin/projects')
      .set('Cookie', cookie)
      .send({ slug: 'Not A Slug', title: 'X', summary: 'Y' })
      .expect(400);

    expect(res.body.details.slug).toBeDefined();
  });

  it('applies defaults for omitted optional fields', async () => {
    const cookie = await loginAsAdmin();
    const res = await request(app)
      .post('/api/admin/projects')
      .set('Cookie', cookie)
      .send({ slug: 'minimal', title: 'Minimal', summary: 'Just the basics' })
      .expect(201);

    expect(res.body).toMatchObject({
      tech: [],
      repoUrl: null,
      year: null,
      featured: false,
      sortOrder: 0,
    });
  });
});

describe('DELETE /api/admin/projects/:id', () => {
  it('deletes once, then 404s', async () => {
    const cookie = await loginAsAdmin();
    const id = await insertProject();

    await request(app).delete(`/api/admin/projects/${String(id)}`).set('Cookie', cookie).expect(204);
    await request(app).delete(`/api/admin/projects/${String(id)}`).set('Cookie', cookie).expect(404);
  });
});
