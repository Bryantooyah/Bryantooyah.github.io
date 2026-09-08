import 'dotenv/config';
import { z } from 'zod';

/**
 * Environment configuration, validated once at import time.
 *
 * Optional-looking secrets (Resend, GitHub token) are genuinely optional: the
 * features they power degrade rather than crash, so a half-configured deploy
 * still serves the site. DATABASE_URL and JWT_SECRET are the real requirements
 * and are enforced below for production.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  DATABASE_URL: z.string().min(1).optional(),
  /** Neon and most hosted Postgres require SSL; local Docker does not. */
  DATABASE_SSL: z.stringbool().default(false),

  JWT_SECRET: z.string().optional(),
  /** Comma-separated allowlist. Unset means same-origin only (the Vercel case). */
  CORS_ORIGIN: z.string().optional(),

  GITHUB_TOKEN: z.string().optional(),
  GITHUB_CACHE_TTL_MINUTES: z.coerce.number().int().positive().default(360),

  RESEND_API_KEY: z.string().optional(),
  CONTACT_TO_EMAIL: z.email().optional(),
  CONTACT_FROM_EMAIL: z.string().default('Portfolio <onboarding@resend.dev>'),
  /** Max contact submissions per IP per hour. */
  CONTACT_RATE_LIMIT: z.coerce.number().int().positive().default(3),

  SEED_ADMIN_EMAIL: z.email().default('bcbryanchua@gmail.com'),
  SEED_ADMIN_PASSWORD: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  console.error(z.prettifyError(parsed.error));
  throw new Error('Invalid environment configuration');
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

if (isProduction) {
  const missing: string[] = [];
  if (!env.DATABASE_URL) missing.push('DATABASE_URL');
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
    missing.push('JWT_SECRET (must be at least 32 characters)');
  }
  if (missing.length > 0) {
    throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Secret used for signing JWTs and salting stored IP hashes.
 * Outside production a fixed development value keeps local runs frictionless;
 * production is guaranteed to have a real secret by the check above.
 */
export const secret: string = env.JWT_SECRET ?? 'dev-only-insecure-secret-do-not-use-in-production';

/** Feature flags derived from which optional secrets are actually present. */
export const features = {
  email: Boolean(env.RESEND_API_KEY && env.CONTACT_TO_EMAIL),
  githubAuth: Boolean(env.GITHUB_TOKEN),
} as const;
