/**
 * Domain types shared by the client and the server.
 *
 * Published as the workspace package `@portfolio/shared`, so both sides resolve
 * it through node_modules like any other dependency — no path aliases, and no
 * bundler configuration needed on Vercel.
 *
 * MUST stay types-only. Every consumer imports it with `import type`, which the
 * compiler erases entirely, so this file is never executed. Adding a runtime
 * value here (a const, a function, an enum) would be imported at runtime and
 * fail, because package.json points `exports` straight at this .ts file.
 */

export interface Project {
  id: number;
  slug: string;
  title: string;
  summary: string;
  /** Long-form case study, Markdown. Only sent by the detail endpoint. */
  description: string | null;
  tech: string[];
  repoUrl: string | null;
  liveUrl: string | null;
  imageUrl: string | null;
  year: number | null;
  featured: boolean;
  sortOrder: number;
}

export interface Award {
  id: number;
  title: string;
  issuer: string;
  year: number;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
}

/** Shape returned by GET /api/github/:owner/:repo — a trimmed GitHub repo record. */
export interface GitHubStats {
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  primaryLanguage: string | null;
  /** Bytes per language, as GitHub reports them. */
  languages: Record<string, number>;
  topics: string[];
  pushedAt: string | null;
  htmlUrl: string;
  /** True when served from cache after an upstream failure — the data may be old. */
  stale: boolean;
}

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  /** Honeypot. Real users never see this field, so any value means "bot". */
  website?: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  createdAt: string;
  readAt: string | null;
}

export interface AdminUser {
  id: number;
  email: string;
}

/** Every error response the API produces uses this shape. */
export interface ApiError {
  error: string;
  /** Field-level messages, keyed by field name. Present on validation failures. */
  details?: Record<string, string[]>;
}
