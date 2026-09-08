# Bryan Chua — Portfolio

Full-stack TypeScript portfolio. React + Vite on the front, Express + PostgreSQL
behind it, deployed to Vercel with Neon as the database.

Structured to mirror [50003Project](https://github.com/Bryantooyah/50003Project) —
same `client/` + `server/` split, same core dependencies.

```text
client/    React 19 + Vite + TypeScript + Tailwind v4
server/    Express 5 + TypeScript + PostgreSQL (pg) + Zod
shared/    Types imported by both sides as @portfolio/shared
api/       Vercel serverless entry — re-exports the Express app
docs/      Redirect stub keeping bryantooyah.github.io alive
legacy/    The previous hand-written HTML site, kept for reference
```

---

## Quick start

```bash
npm ci
docker compose up -d                 # Postgres 16 on localhost:5433
cp server/.env.example server/.env   # then set SEED_ADMIN_PASSWORD
npm run db:apply                     # create tables
npm run db:seed                      # load projects, awards, admin user
npm run dev                          # client :5173, API :3000
```

Vite proxies `/api` to the API in dev, so the client uses plain relative paths
in both development and production.

### Scripts

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

## How it fits together

**Static-first.** `client/src/data/fallback.ts` holds a snapshot of all content,
compiled into the bundle. `useResource` requests the API and silently falls back
to that snapshot on any error or timeout. A cold database, a broken deploy or no
network degrades the site to *slightly stale*, never to *broken*. The API's job
is to keep content fresh, not to make the page work.

**One app object, three runtimes.** `server/src/app.ts` builds the Express app
but never calls `listen()`. `server/src/index.ts` listens for local dev,
`api/index.mjs` hands the same object to Vercel, and supertest drives it
directly with no port bound.

**Rate limiting lives in the database.** On Vercel each request may land in a
fresh process, so an in-memory counter would reset constantly and enforce
nothing. The contact limiter counts rows by hashed IP instead.

**Types-only sharing.** `@portfolio/shared` is a workspace package containing
nothing but interfaces. Every import is `import type`, so it is erased at
compile time and never appears in the compiled output — verified by the build.

---

## Deployment (Vercel + Neon)

### 1. Database — Neon

Create a project at [neon.tech](https://neon.tech). Copy the **pooled**
connection string (the host contains `-pooler`). Pooled matters: each serverless
invocation opens its own connection, and the pool is capped at 1 per process in
production for the same reason.

Neon's free tier persists indefinitely. (Render's free Postgres expires after
30 days, which is why it isn't used here.)

### 2. Deploy — Vercel

Import the GitHub repo at [vercel.com/new](https://vercel.com/new). `vercel.json`
already sets the build command, output directory and routing, so accept the
defaults.

Set these environment variables (Production **and** Preview):

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | Neon pooled connection string |
| `DATABASE_SSL` | yes | `true` |
| `JWT_SECRET` | yes | 32+ chars: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NODE_ENV` | yes | `production` |
| `SEED_ADMIN_EMAIL` | for seeding | Your login email |
| `SEED_ADMIN_PASSWORD` | for seeding | 12+ chars |
| `GITHUB_TOKEN` | optional | Read-only PAT; raises the API limit from 60/hr to 5000/hr |
| `RESEND_API_KEY` | optional | Without it messages are still stored, just not emailed |
| `CONTACT_TO_EMAIL` | optional | Where contact mail goes |

Then seed production once, from your machine:

```bash
DATABASE_URL="<neon pooled url>" DATABASE_SSL=true \
SEED_ADMIN_PASSWORD="<your password>" npm run db:apply
DATABASE_URL="<neon pooled url>" DATABASE_SSL=true \
SEED_ADMIN_PASSWORD="<your password>" npm run db:seed
```

### 3. Keep the old URL working

GitHub → Settings → Pages → deploy from `main`, `/docs`. That publishes
`docs/index.html`, which redirects `bryantooyah.github.io` to the new domain, so
links already in circulation (your resume PDF, LinkedIn) still land correctly.

### 4. Stop broken code reaching main

`.github/workflows/ci.yml` runs lint, typecheck, tests (against a real Postgres)
and both builds on every PR. **The workflow only reports — the branch rule is
what blocks.** In GitHub → Settings → Branches, add a rule on `main`:

- Require a pull request before merging
- Require status checks to pass → select **Lint, typecheck, test, build**

Vercel also builds a preview per PR, so you get a working URL before merging.

---

## Custom domain — bryanchua.com

1. **Check availability** at [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/).
   Fallbacks if taken: `bryanchua.sg`, `chuabryan.com`, `bryanchua.dev`.
2. **Register.** Cloudflare Registrar sells at wholesale cost with no markup or
   first-year bait pricing (~US$11/yr for `.com`), WHOIS privacy included.
   Porkbun and Namecheap are fine alternatives. Avoid GoDaddy — cheap year one,
   steep renewals.
3. **Vercel** → Project → Settings → Domains → add `bryanchua.com` and
   `www.bryanchua.com`. Vercel prints the exact DNS records it wants.
4. **Cloudflare DNS** → add them, and set both to **DNS only** (grey cloud, not
   orange). Proxying Cloudflare in front of Vercel breaks certificate issuance
   and can cause redirect loops. Use the record values Vercel gives you rather
   than any hard-coded IP.
5. Vercel issues a Let's Encrypt certificate automatically within a few minutes.
   Set the apex as primary and let `www` redirect to it.
6. **Turn on auto-renew** and set a calendar reminder. A lapsed registration is
   the most common way a portfolio quietly disappears.
7. Update the domain on your resume, LinkedIn and GitHub profile. Then update
   `client/index.html` (canonical + `og:url`) and `client/public/sitemap.xml`
   if you chose a domain other than `bryanchua.com`.

### Running costs

| | Tier | Cost |
| --- | --- | --- |
| Vercel | Hobby | $0 — non-commercial, which a personal portfolio is |
| Neon | Free | $0 — 0.5 GB, sleeps when idle, does not expire |
| Resend | Free | $0 — 100/day, far beyond a contact form |
| Domain | — | ~S$15–20/yr, the only recurring cost |

---

## Editing content

Sign in at `/admin` to add or edit projects and credentials and read contact
messages — no redeploy needed. The database is the source of truth.

`/admin` needs the API, so run `npm run dev` (client *and* server). Running only
`npm run dev:client` leaves nothing on :3000 and every sign-in fails.

After a material change, refresh the offline snapshot so the fallback matches:

```bash
API=https://bryanchua.com npm run snapshot
npm run lint && git commit -am "Refresh content snapshot"
```

Profile content — tagline, skills, work experience, education — lives in
`client/src/data/profile.ts` and is edited in code. Keep it in step with the
resume.

Images are archived in `/images` and published to `client/public/images` by
`npm run images`, which re-encodes them to WebP. Expected source filenames:

| Source | Published as | Used for |
| --- | --- | --- |
| `images/hero.jpg` | `hero.webp` | Home hero photo |
| `images/profile.jpg` | `profile.webp` | About photo |
| `images/Dial.png` | `project-dial.webp` | D.I.A.L. card |
| `images/savenow.jpg` | `project-savenow.webp` | SaveNow card |
| `images/project1.png` | `project-shift-patrol.webp` | Shift Patrol card |
| `images/portfolio.png` | `project-portfolio.webp` | This portfolio's card |
| `images/logo-*.png` | `logo-*.webp` | Organisation logos |

Organisation logos are `logo-cpf`, `logo-spf`, `logo-sutd`, `logo-dsta`,
`logo-naisc`, `logo-harvard` and `logo-jlpt`. Those seven jobs name no
extension, so `.png`, `.svg`, `.jpg` or `.webp` all resolve — save each file
however it downloads. Pick the **dark-ink** variant where a brand offers both:
they sit on a white plate, and the white-on-transparent version disappears.

A missing image is never fatal — projects fall back to a monogram placeholder
and organisations to their initials, rather than a broken-image icon.

The screenshot of this site on its own project card is regenerated by loading
the built site in headless Chrome and saving the capture as `images/portfolio.png`.
