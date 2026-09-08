import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { HttpError } from '../lib/http.js';
import { isProduction, secret } from '../env.js';

export const AUTH_COOKIE = 'portfolio_admin';
const TOKEN_TTL_SECONDS = 60 * 60 * 12; // 12 hours

export interface AdminClaims {
  sub: number;
  email: string;
}

export function issueToken(claims: AdminClaims): string {
  return jwt.sign(claims, secret, { expiresIn: TOKEN_TTL_SECONDS });
}

export function authCookieOptions(): {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  maxAge: number;
  path: string;
} {
  return {
    // httpOnly keeps the token out of reach of any script on the page, so an
    // XSS bug cannot exfiltrate the admin session.
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: TOKEN_TTL_SECONDS * 1000,
    path: '/',
  };
}

/**
 * Rejects the request unless it carries a valid admin session cookie.
 * Applied to every mutating admin route — the client-side route guard is only
 * there to avoid showing a doomed form, never to enforce access.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token: unknown = (req.cookies as Record<string, unknown> | undefined)?.[AUTH_COOKIE];

  if (typeof token !== 'string' || token.length === 0) {
    next(HttpError.unauthorized());
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as jwt.JwtPayload & Partial<AdminClaims>;
    if (typeof payload.sub !== 'number' || typeof payload.email !== 'string') {
      next(HttpError.unauthorized('Malformed session'));
      return;
    }
    req.admin = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(HttpError.unauthorized('Session expired or invalid'));
  }
}
