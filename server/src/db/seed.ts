import { closePool, query } from './pool.js';
import type { AwardInput, ProjectInput } from '../schemas/index.js';

/**
 * Seeds the database with the initial portfolio content and the admin account.
 *
 * Content here is kept in sync with the resume (V8). Idempotent: projects
 * upsert on slug, awards are replaced wholesale, and the admin user upserts on
 * email. Safe to re-run after editing the content below.
 *
 * Once the site is live, prefer editing through /admin — re-running this script
 * overwrites any admin edits to these specific entries.
 */

const projects: ProjectInput[] = [
  {
    slug: 'das-dial',
    title: 'D.I.A.L.',
    summary:
      'A full-stack analytics dashboard for the Dyslexia Association of Singapore, giving therapists one place to submit student writing samples and review analysis across their caseload.',
    tech: ['React', 'TypeScript', 'Express', 'PostgreSQL', 'Docker', 'Render', 'Jest'],
    repoUrl: 'https://github.com/Bryantooyah/50003Project',
    liveUrl: 'https://dial-frontend.onrender.com',
    imageUrl: '/images/project-dial.webp',
    year: 2026,
    featured: true,
    sortOrder: 1,
    description: `## The problem

Therapists at the Dyslexia Association of Singapore read a great deal of student
writing. Noticing that one student keeps making the *same class* of error — and
deciding what to do about it — is slow manual work that leans heavily on an
individual therapist's experience, and it doesn't travel between them.

## What we built

A platform where a therapist submits a writing sample and gets analysis back
across their whole caseload, rather than one essay at a time. Two engines sit
behind it:

- **Error Pattern Analyzer** — classifies the errors in a sample and surfaces
  patterns across submissions instead of one-off mistakes.
- **Intervention Recommendation Engine** — maps an identified pattern onto
  specific, actionable interventions the therapist can use.

Both are LLM-backed and run over a PostgreSQL schema, with role-based access
control separating admin, therapist and student users.

## Shipping it

Deployed to production on Render as three services — React frontend, Express
API and managed Postgres — all provisioned from a single infrastructure-as-code
Blueprint, with Docker Compose for local development so any team member could
bring the whole stack up with one command.

## Testing

Jest suites across both frontend and backend, plus **property-based fuzz testing
with fast-check** against live API routes. Rather than asserting behaviour on a
handful of hand-picked inputs, you state a property that should hold for *all*
inputs and let the library hunt for counterexamples. It found input-validation
edge cases we would never have thought to write a test for.

## What I'd do differently

The LLM integration went in relatively late. Deciding the prompt boundary
up-front — exactly what the model owns versus what deterministic code owns —
would have saved a lot of rework.`,
  },
  {
    slug: 'savenow',
    title: 'SaveNow',
    summary:
      'A native Android budgeting app for fresh graduates. It records income and expenses, runs six analytics passes over the history to surface spending patterns, and uses an LLM to turn the numbers into plain-language advice.',
    tech: [
      'Java',
      'Android Studio',
      'XML Layouts',
      'SQLite',
      'MPAndroidChart',
      'OkHttp',
      'OpenAI',
      'Gemini',
    ],
    repoUrl: 'https://github.com/Bryantooyah/SaveNow-Mobile-App',
    liveUrl: null,
    imageUrl: '/images/project-savenow.webp',
    year: 2026,
    featured: true,
    sortOrder: 2,
    description: `## The problem

Most budgeting apps are good at *recording* what you spent and bad at telling
you anything useful about it. You end up with a tidy ledger and no more insight
than you started with. SaveNow is aimed at fresh graduates managing their own
money for the first time, so the question it has to answer is "am I on track?",
not just "what did I spend?"

## What it does

Income and expenses are tracked against category budgets, and **six analytics
algorithms** run over the transaction history to surface things a ledger hides —
spending trends month to month, categories quietly drifting upward, and outliers
worth a second look.

Three interactive chart views built on **MPAndroidChart** make that readable at a
glance: a total income-versus-expenditure overview, a monthly breakdown, and a
spending-by-category doughnut.

## The AI layer

On top of the numbers sits an optional LLM pass that turns the analysis into
plain-language advice — the difference between "you spent \\$430 on food" and
"food is up 22% on last month, and it's the category pushing you off your goal."

It calls **OpenAI first and falls back to Google Gemini** if that request fails.
Two providers for one feature sounds like overkill for coursework, but a single
outage otherwise takes out the one part of the app that makes it more than a
spreadsheet. Requests go through **OkHttp** on a background thread so the UI
never blocks on the network.

## Building it

Written in Java 11 against Android SDK 36 (minimum API 24), built in Android
Studio with Gradle's Kotlin DSL.

The part with no real web equivalent was designing multi-screen navigation
around the **Android activity lifecycle**, so state survives rotation,
backgrounding, and the system reclaiming memory. Get it wrong and nothing looks
broken until someone rotates their phone and loses what they typed. Layouts were
built in XML from wireframes and tested on both an emulator and a physical
device, which is where the differences actually show up.

Transactions persist in **SQLite** and settings in SharedPreferences, so the app
works fully offline, needs no account, and nothing leaves the device.

## Honest limitations

This was coursework, not production software, and it's worth being straight
about what that means: there's no automated test suite, storage is local to a
single device, and there's no cloud backup or sync. An instrumented test suite
and a sync layer would be the first two things I'd add.`,
  },
  {
    slug: 'portfolio-website',
    title: 'This Portfolio',
    summary:
      'The site you are on. Rebuilt from hand-written HTML into a full-stack TypeScript app with a live API, an admin CMS, and content that still renders when the backend is down.',
    tech: ['TypeScript', 'React', 'Vite', 'Tailwind CSS', 'Express', 'PostgreSQL', 'Vercel'],
    repoUrl: 'https://github.com/Bryantooyah/Bryantooyah.github.io',
    liveUrl: 'https://bryanchua-bay.vercel.app',
    imageUrl: '/images/project-portfolio.webp',
    year: 2025,
    featured: false,
    sortOrder: 3,
    description: `## Why rebuild it

The first version was five hand-written HTML files sharing a copy-pasted navbar.
It worked, but the contact form silently threw messages away, the viewport meta
tag had a typo that disabled mobile scaling on every page, and adding a project
meant editing markup in four places.

## What it is now

A TypeScript monorepo: React and Vite on the front, Express and PostgreSQL
behind it, deployed to Vercel with Neon as the database.

- A **working contact form** — Zod validation, a honeypot, and per-IP rate
  limiting done as a database count rather than an in-memory counter, because on
  serverless every request may land in a fresh process.
- A **GitHub proxy** that caches repo stats server-side, so the project cards
  show live stars and languages without leaking a token or hitting rate limits.
- An **admin CMS**, so adding a project is filling in a form rather than
  redeploying.

## The design decision I like most

The site is **static-first**. A snapshot of all content is compiled into the JS
bundle, and the API is only ever asked to make it *fresher*. If the database is
cold, the deploy is broken, or you're on a train with no signal, the page still
renders completely. The backend failing degrades the site to *slightly stale*,
never to *broken*.`,
  },
  {
    slug: 'shift-patrol-generator',
    title: 'Shift Patrol Generator',
    summary:
      'An optimisation algorithm that turns raw officer movement data into constraint-based patrol schedules. Built for the SPF Coding Challenge and took first place.',
    tech: ['Python', 'Flask', 'Algorithms', 'HTML/CSS'],
    repoUrl: 'https://github.com/Bryantooyah/Bryan-and-Tan-Pang-Topic-2',
    liveUrl: null,
    imageUrl: '/images/project-shift-patrol.webp',
    year: 2023,
    featured: false,
    sortOrder: 4,
    description: `## The brief

Given raw movement data for a set of officers, generate a patrol schedule that
covers the required ground without violating any scheduling constraints.

## Approach

A Flask web app: movement data goes in, the scheduling logic assigns shifts
against the coverage requirements, and a readable plan comes out.

The interesting part was constraint handling. A naive assignment is easy — the
hard version is one that *stays* valid as constraints stack up and start
conflicting with each other, which is where a greedy approach falls over.

## Outcome

First place in the Singapore Police Force Coding Challenge.`,
  },
  {
    slug: 'hdb-resale-price-prediction',
    title: 'HDB Resale Price Prediction',
    summary:
      'A linear regression model that predicts Singapore HDB resale prices from floor area, storey, lease age, town, flat type and flat model, with a Random Forest comparison to follow.',
    tech: ['Python', 'pandas', 'NumPy', 'scikit-learn', 'Matplotlib', 'Seaborn'],
    repoUrl: 'https://github.com/Bryantooyah/Machine-Learning-Project',
    liveUrl: null,
    imageUrl: '/images/project-hdb-ml.webp',
    year: 2026,
    featured: false,
    sortOrder: 5,
    description: `## The problem

HDB resale flats have no published price list, so a buyer or seller has to work
out what a flat is worth from comparable sales. The public resale transaction
dataset, which runs from 2017 onwards, makes that a clean regression problem:
given what a flat is like, predict what it sold for.

## What I built

The baseline is a linear regression model in Python, built with pandas and
scikit-learn. The features were chosen from the data rather than from intuition:

- **Numeric inputs** are floor area, storey, year of sale and lease
  commencement year. The storey range ("10 TO 12") is turned into its midpoint.
- **Categorical inputs** are town, flat type and flat model, one-hot encoded.
  Boxplots showed that all three separate the price ranges clearly.
- **Redundant lease fields** were dropped. Remaining lease, flat age and lease
  commencement year describe the same thing and are almost perfectly
  correlated, so only the strongest is kept.

## Comparing with a Random Forest

Linear regression is the baseline, not the end point. A Random Forest on the same
features is the next step, since a tree-based model can pick up non-linear
patterns that a straight line misses. The project is also a way to learn the
basics of the workflow: splitting data, choosing features, measuring error and
comparing models.

## Evaluation

The data is split 60/20/20 into training, validation and test sets. Errors for the
linear model are reported as MSE, RMSE, MAE and R² on the training and validation
sets, with predicted-versus-actual and residual plots to show where it goes wrong.

## A known limit

A linear model adds a fixed amount per feature, so it cannot capture interactions
between factors, such as a town's premium mattering more for larger flats. That
limit is why the Random Forest is worth comparing against.`,
  },
  {
    slug: 'todo-fullstack-app',
    title: 'To-Do Fullstack App',
    summary:
      'A to-do app with accounts, due dates, priorities, tags and server-side search, built as a TypeScript monorepo with shared Zod schemas, Express, Prisma and PostgreSQL, tested against a real database and deployed through CI.',
    tech: [
      'TypeScript',
      'React',
      'Express',
      'Prisma',
      'PostgreSQL',
      'TanStack Query',
      'Tailwind CSS',
      'Zod',
      'Docker',
      'Render',
      'Vercel',
    ],
    repoUrl: 'https://github.com/Bryantooyah/To-Do-Fullstack-App',
    liveUrl: 'https://to-do-app-beryl-mu.vercel.app',
    imageUrl: '/images/project-todo.webp',
    year: 2026,
    featured: false,
    sortOrder: 6,
    description: `## The problem

A to-do app looks like a small problem, but accounts, ownership, due dates, search
and undo all have to work together, and the bugs tend to hide in the seams between
layers rather than in any single feature.

## What it does

Each user has their own tasks, with due dates shown relatively ("Tomorrow", "3 days
overdue"), priorities and colour-coded tags. Search, filtering and sorting run on the
server, and the filter state lives in the URL, so a view survives a reload and can be
shared. Updates are optimistic and roll back with an error toast if the server rejects
them. Deletes are soft, so undo is a real server-side restore.

## How it's built

A TypeScript monorepo. The main design choice is a shared package of Zod schemas: the
same object validates an API request body and drives the matching React form, so the
client and server can't drift apart.

Auth uses short-lived access tokens with rotating refresh tokens. Replaying a spent
refresh token revokes the whole session family. Passwords are hashed with argon2id,
and a request for another user's task returns 404 rather than 403, so it doesn't
reveal that the record exists.

## Testing

66 tests across three layers: unit tests for the query builder, integration tests
against a real PostgreSQL database rather than a mock, and component tests with MSW.
CI runs lint, typecheck, the tests and both Docker builds on every push.

## What I'd do next

There's no end-to-end suite and no accessibility audit yet. A scripted Playwright user
journey comes first, then an axe-core pass.`,
  },
];

const awards: AwardInput[] = [
  {
    title: 'First Place — SPF Coding Challenge',
    issuer: 'Singapore Police Force',
    year: 2023,
    description:
      'Built an optimisation algorithm generating constraint-based patrol schedules from raw officer movement data.',
    imageUrl: '/images/logo-spf.webp',
    sortOrder: 1,
  },
  {
    title: 'Finalist — National AI Student Challenge (NAISC)',
    issuer: 'AI Singapore',
    year: 2025,
    description: 'Built an AI Avatar for the Temus Challenge track.',
    imageUrl: '/images/logo-naisc.webp',
    sortOrder: 2,
  },
  {
    title: 'First Runner-Up — BrainHack "Today I Learned" AI Hackathon',
    issuer: 'Defence Science and Technology Agency (DSTA)',
    year: 2021,
    description:
      "Placed second at DSTA's national AI hackathon, building and training models under competition conditions.",
    imageUrl: '/images/logo-dsta.webp',
    sortOrder: 3,
  },
  {
    title: 'CS50W — Web Programming with Python and JavaScript',
    issuer: 'Harvard University',
    year: 2026,
    description: 'Full-stack web development with Django, JavaScript and SQL.',
    imageUrl: '/images/logo-harvard.webp',
    sortOrder: 4,
  },
  {
    title: 'CS50x — Introduction to Computer Science',
    issuer: 'Harvard University',
    year: 2024,
    description: 'Computer science fundamentals, algorithms and data structures in C and Python.',
    imageUrl: '/images/logo-harvard.webp',
    sortOrder: 5,
  },
  {
    title: 'JLPT N3 — Japanese-Language Proficiency Test',
    issuer: 'Japan Foundation & JEES',
    year: 2025,
    description: 'Certified intermediate proficiency in Japanese.',
    imageUrl: '/images/logo-jlpt.webp',
    sortOrder: 6,
  },
  {
    title: 'Finalist — Dell Technologies Innovation Award',
    issuer: 'Dell Technologies',
    year: 2026,
    description:
      'Recognised for an innovative project that combined cloud-native technologies with real-world problem-solving, judged on technical rigour, creativity and presentation clarity.',
    imageUrl: '/images/logo-dell.webp',
    sortOrder: 7,
  },
  {
    title: 'Docker Fundamentals',
    issuer: 'Dell Technologies',
    year: 2026,
    description:
      'Hands-on Docker fundamentals: containerising applications and using Docker to streamline development, collaboration and deployment.',
    imageUrl: '/images/logo-docker.webp',
    sortOrder: 8,
  },
];

async function seedProjects(): Promise<void> {
  for (const p of projects) {
    await query(
      `INSERT INTO projects (slug, title, summary, description, tech, repo_url,
                             live_url, image_url, year, featured, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title,
         summary = EXCLUDED.summary,
         description = EXCLUDED.description,
         tech = EXCLUDED.tech,
         repo_url = EXCLUDED.repo_url,
         live_url = EXCLUDED.live_url,
         image_url = EXCLUDED.image_url,
         year = EXCLUDED.year,
         featured = EXCLUDED.featured,
         sort_order = EXCLUDED.sort_order,
         updated_at = NOW()`,
      [
        p.slug,
        p.title,
        p.summary,
        p.description,
        p.tech,
        p.repoUrl,
        p.liveUrl,
        p.imageUrl,
        p.year,
        p.featured,
        p.sortOrder,
      ],
    );
  }
  console.log(`Seeded ${String(projects.length)} projects.`);
}

async function seedAwards(): Promise<void> {
  // No natural unique key on awards, so clear and reinsert the seed set.
  await query('DELETE FROM awards');
  for (const a of awards) {
    await query(
      `INSERT INTO awards (title, issuer, year, description, image_url, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [a.title, a.issuer, a.year, a.description, a.imageUrl, a.sortOrder],
    );
  }
  console.log(`Seeded ${String(awards.length)} awards.`);
}

async function main(): Promise<void> {
  await seedProjects();
  await seedAwards();
  // The admin account is deliberately NOT touched here — see seed-admin.ts.
  // Content is re-seeded routinely; credentials must not ride along with it.
  console.log('Seed complete. (Admin account unchanged — use `npm run db:seed:admin`.)');
}

main()
  .catch((err: unknown) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(() => closePool());
