-- Portfolio schema. Idempotent: safe to re-run against an existing database.

CREATE TABLE IF NOT EXISTS projects (
  id          SERIAL PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  summary     TEXT NOT NULL,
  description TEXT,
  tech        TEXT[] NOT NULL DEFAULT '{}',
  repo_url    TEXT,
  live_url    TEXT,
  image_url   TEXT,
  year        INTEGER,
  featured    BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS projects_sort_idx ON projects (sort_order, id);

CREATE TABLE IF NOT EXISTS awards (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  issuer      TEXT NOT NULL,
  year        INTEGER NOT NULL,
  description TEXT,
  image_url   TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS awards_sort_idx ON awards (sort_order, id);

CREATE TABLE IF NOT EXISTS contact_messages (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  -- SHA-256 of (client IP + server secret). Enough to rate-limit a repeat
  -- sender without storing an actual address.
  ip_hash    TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at    TIMESTAMPTZ
);

-- Drives the per-IP rate limit lookup, which filters on both columns.
CREATE INDEX IF NOT EXISTS contact_ip_created_idx ON contact_messages (ip_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS contact_created_idx ON contact_messages (created_at DESC);

CREATE TABLE IF NOT EXISTS admin_users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS github_cache (
  repo       TEXT PRIMARY KEY,
  payload    JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
