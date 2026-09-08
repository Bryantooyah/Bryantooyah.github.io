import { Router } from 'express';
import bcrypt from 'bcryptjs';
import type { AdminUser } from '@portfolio/shared';
import { query } from '../db/pool.js';
import { loginSchema } from '../schemas/index.js';
import { AUTH_COOKIE, authCookieOptions, issueToken, requireAuth } from '../middleware/auth.js';
import { HttpError } from '../lib/http.js';

export const authRouter: Router = Router();

interface AdminRow {
  id: number;
  email: string;
  password_hash: string;
}

authRouter.post('/login', async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const { rows } = await query<AdminRow>(
    'SELECT id, email, password_hash FROM admin_users WHERE email = $1',
    [email.toLowerCase()],
  );
  const user = rows[0];

  // Compare against a dummy hash when the account does not exist, so the
  // response time does not reveal which emails are registered.
  const hash = user?.password_hash ?? '$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin';
  const ok = await bcrypt.compare(password, hash);

  if (!user || !ok) {
    throw HttpError.unauthorized('Incorrect email or password');
  }

  res.cookie(AUTH_COOKIE, issueToken({ sub: user.id, email: user.email }), authCookieOptions());
  res.json({ id: user.id, email: user.email } satisfies AdminUser);
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(AUTH_COOKIE, { path: '/' });
  res.json({ ok: true });
});

/** Lets the client decide whether to render the admin UI or the login form. */
authRouter.get('/me', requireAuth, (req, res) => {
  const admin = req.admin;
  if (!admin) throw HttpError.unauthorized();
  res.json({ id: admin.id, email: admin.email } satisfies AdminUser);
});
