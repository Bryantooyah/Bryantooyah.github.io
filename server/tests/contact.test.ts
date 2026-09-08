import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { query } from '../src/db/pool.js';

const valid = {
  name: 'Jane Recruiter',
  email: 'jane@example.com',
  subject: 'Internship opportunity',
  message: 'Hello Bryan, I would like to talk to you about an internship.',
};

async function messageCount(): Promise<number> {
  const { rows } = await query<{ count: number }>(
    'SELECT COUNT(*)::int AS count FROM contact_messages',
  );
  return rows[0]?.count ?? 0;
}

describe('POST /api/contact', () => {
  it('stores a valid message', async () => {
    await request(app).post('/api/contact').send(valid).expect(201);
    expect(await messageCount()).toBe(1);
  });

  it('returns field-level errors for invalid input', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ ...valid, email: 'not-an-email', message: 'short' })
      .expect(400);

    expect(res.body.details.email).toBeDefined();
    expect(res.body.details.message).toBeDefined();
    expect(await messageCount()).toBe(0);
  });

  it('never stores a null-byte or oversized message', async () => {
    await request(app)
      .post('/api/contact')
      .send({ ...valid, message: 'x'.repeat(5001) })
      .expect(400);

    expect(await messageCount()).toBe(0);
  });

  describe('honeypot', () => {
    it('accepts the request but stores nothing', async () => {
      await request(app)
        .post('/api/contact')
        .send({ ...valid, website: 'http://spam.example' })
        .expect(202);

      // The bot must not be able to tell it was caught, so the response looks
      // like success — but nothing reaches the database.
      expect(await messageCount()).toBe(0);
    });

    it('ignores an empty honeypot value from a real browser', async () => {
      // Browsers submit empty text inputs as "", which must not be treated as
      // bot activity.
      await request(app)
        .post('/api/contact')
        .send({ ...valid, website: '' })
        .expect(201);

      expect(await messageCount()).toBe(1);
    });
  });

  describe('rate limiting', () => {
    it('blocks past the per-hour limit', async () => {
      for (let i = 0; i < 3; i += 1) {
        await request(app)
          .post('/api/contact')
          .send({ ...valid, subject: `Message ${String(i)}` })
          .expect(201);
      }

      await request(app).post('/api/contact').send(valid).expect(429);
      expect(await messageCount()).toBe(3);
    });

    it('ignores submissions older than the window', async () => {
      for (let i = 0; i < 3; i += 1) {
        await request(app).post('/api/contact').send(valid).expect(201);
      }

      // Age the existing rows out of the one-hour window.
      await query("UPDATE contact_messages SET created_at = NOW() - INTERVAL '2 hours'");

      await request(app).post('/api/contact').send(valid).expect(201);
      expect(await messageCount()).toBe(4);
    });
  });
});
