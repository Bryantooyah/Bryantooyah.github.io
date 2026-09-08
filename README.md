# Bryan Chua — Portfolio

My personal site, rebuilt from five hand-written HTML pages into a full-stack
TypeScript application: a React front end, an Express API, and PostgreSQL behind
it, with an admin panel for editing content without redeploying.

```text
client/    React 19 + Vite + TypeScript + Tailwind v4
server/    Express 5 + TypeScript + PostgreSQL (pg) + Zod
shared/    Types imported by both sides as @portfolio/shared
api/       Serverless entry point — re-exports the Express app
```

---

## Highlights

**Static-first rendering.** A snapshot of all content is compiled into the JS
bundle. The client requests the API and silently falls back to that snapshot on
any error or timeout, so a cold database, a failed deploy or no network at all
degrades the site to *slightly stale* rather than *broken*. The API's job is to
keep content fresh, never to make the page work.

**One app object, three runtimes.** `server/src/app.ts` builds the Express app
but never calls `listen()`. The local dev server listens on it, the serverless
handler hands the same object to the platform, and the test suite drives it
directly through supertest with no port bound.

**Rate limiting in the database, not in memory.** On serverless every request
may land in a fresh process, so an in-memory counter would reset constantly and
enforce nothing. The contact-form limiter counts rows by hashed IP instead —
enough to recognise a repeat sender without storing anyone's address.

**A cached GitHub proxy.** Project cards show live stars, languages and last-push
dates. The API fetches and caches them server-side with a six-hour TTL, serving
stale data if GitHub is unreachable, which keeps the token off the client and
stays well clear of the rate limit.

**Types-only sharing.** `@portfolio/shared` is a workspace package containing
nothing but interfaces. Every import is `import type`, so it is erased at compile
time and never reaches the compiled output — asserted by the build.

---

## Running locally

```bash
npm ci
docker compose up -d                 # Postgres 16 on localhost:5433
cp server/.env.example server/.env   # then set SEED_ADMIN_PASSWORD
npm run db:apply                     # create tables
npm run db:seed                      # load content and the admin user
npm run dev                          # client :5173, API :3000
```

Vite proxies `/api` to the API in development, so the client uses plain relative
paths in both environments.

| Command | Does |
| --- | --- |
| `npm run dev` | Client and server together |
| `npm run lint` | oxlint across the repo |
| `npm run typecheck` | `tsc --noEmit` in both workspaces |
| `npm test` | Vitest — client and server |
| `npm run build` | Production client bundle |
| `npm run build:server` | Compile the API to `server/dist` |
| `npm run db:apply` / `db:seed` | Schema and seed data |
| `npm run images` | Re-encode `/images` to WebP under `client/public` |
| `npm run snapshot` | Regenerate the offline fallback from the live API |

---

## Tests

71 tests across the two workspaces. The server suite runs against a real
PostgreSQL instance rather than mocks, so the SQL itself is covered — including
auth rejection, Zod validation, the contact rate limiter tripping, and the
GitHub cache hitting and missing.

`.github/workflows/ci.yml` runs lint, typecheck, both test suites and both builds
on every pull request, with Postgres as a service container.

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

---

## Deployment

Deployed on [Vercel](https://vercel.com) with [Neon](https://neon.tech) for
PostgreSQL. `vercel.json` sets the build command, output directory and routing;
the required environment variables are documented in `server/.env.example`.

Content is edited through `/admin` — sign in to add or update projects and
credentials and read contact messages, no redeploy needed. Longer-form profile
content lives in `client/src/data/profile.ts`.
