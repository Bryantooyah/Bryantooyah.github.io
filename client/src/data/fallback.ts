import type { Award, Project } from '@portfolio/shared';

/**
 * Build-time snapshot of the portfolio content, compiled into the JS bundle.
 *
 * The site renders from this whenever the API cannot be reached — a cold
 * database, a broken deploy, a dropped connection. The consequence is that the
 * page is always complete and correct; the API's job is to keep it *fresh*,
 * never to make it *work*.
 *
 * GENERATED FILE — do not edit by hand. Regenerate with `npm run snapshot`.
 * Last generated: 2026-09-08
 */

export const fallbackProjects: Project[] = [
  {
    "id": 1,
    "slug": "das-dial",
    "title": "D.I.A.L.",
    "summary": "A full-stack analytics dashboard for the Dyslexia Association of Singapore, giving therapists one place to submit student writing samples and review analysis across their caseload.",
    "description": "## The problem\n\nTherapists at the Dyslexia Association of Singapore read a great deal of student\nwriting. Noticing that one student keeps making the *same class* of error — and\ndeciding what to do about it — is slow manual work that leans heavily on an\nindividual therapist's experience, and it doesn't travel between them.\n\n## What we built\n\nA platform where a therapist submits a writing sample and gets analysis back\nacross their whole caseload, rather than one essay at a time. Two engines sit\nbehind it:\n\n- **Error Pattern Analyzer** — classifies the errors in a sample and surfaces\n  patterns across submissions instead of one-off mistakes.\n- **Intervention Recommendation Engine** — maps an identified pattern onto\n  specific, actionable interventions the therapist can use.\n\nBoth are LLM-backed and run over a PostgreSQL schema, with role-based access\ncontrol separating admin, therapist and student users.\n\n## Shipping it\n\nDeployed to production on Render as three services — React frontend, Express\nAPI and managed Postgres — all provisioned from a single infrastructure-as-code\nBlueprint, with Docker Compose for local development so any team member could\nbring the whole stack up with one command.\n\n## Testing\n\nJest suites across both frontend and backend, plus **property-based fuzz testing\nwith fast-check** against live API routes. Rather than asserting behaviour on a\nhandful of hand-picked inputs, you state a property that should hold for *all*\ninputs and let the library hunt for counterexamples. It found input-validation\nedge cases we would never have thought to write a test for.\n\n## What I'd do differently\n\nThe LLM integration went in relatively late. Deciding the prompt boundary\nup-front — exactly what the model owns versus what deterministic code owns —\nwould have saved a lot of rework.",
    "tech": [
      "React",
      "TypeScript",
      "Express",
      "PostgreSQL",
      "Docker",
      "Render",
      "Jest"
    ],
    "repoUrl": "https://github.com/Bryantooyah/50003Project",
    "liveUrl": "https://dial-frontend.onrender.com",
    "imageUrl": "/images/project-dial.webp",
    "year": 2026,
    "featured": true,
    "sortOrder": 1
  },
  {
    "id": 2,
    "slug": "savenow",
    "title": "SaveNow",
    "summary": "A native Android budgeting app for fresh graduates. It records income and expenses, runs six analytics passes over the history to surface spending patterns, and uses an LLM to turn the numbers into plain-language advice.",
    "description": "## The problem\n\nMost budgeting apps are good at *recording* what you spent and bad at telling\nyou anything useful about it. You end up with a tidy ledger and no more insight\nthan you started with. SaveNow is aimed at fresh graduates managing their own\nmoney for the first time, so the question it has to answer is \"am I on track?\",\nnot just \"what did I spend?\"\n\n## What it does\n\nIncome and expenses are tracked against category budgets, and **six analytics\nalgorithms** run over the transaction history to surface things a ledger hides —\nspending trends month to month, categories quietly drifting upward, and outliers\nworth a second look.\n\nThree interactive chart views built on **MPAndroidChart** make that readable at a\nglance: a total income-versus-expenditure overview, a monthly breakdown, and a\nspending-by-category doughnut.\n\n## The AI layer\n\nOn top of the numbers sits an optional LLM pass that turns the analysis into\nplain-language advice — the difference between \"you spent \\$430 on food\" and\n\"food is up 22% on last month, and it's the category pushing you off your goal.\"\n\nIt calls **OpenAI first and falls back to Google Gemini** if that request fails.\nTwo providers for one feature sounds like overkill for coursework, but a single\noutage otherwise takes out the one part of the app that makes it more than a\nspreadsheet. Requests go through **OkHttp** on a background thread so the UI\nnever blocks on the network.\n\n## Building it\n\nWritten in Java 11 against Android SDK 36 (minimum API 24), built in Android\nStudio with Gradle's Kotlin DSL.\n\nThe part with no real web equivalent was designing multi-screen navigation\naround the **Android activity lifecycle**, so state survives rotation,\nbackgrounding, and the system reclaiming memory. Get it wrong and nothing looks\nbroken until someone rotates their phone and loses what they typed. Layouts were\nbuilt in XML from wireframes and tested on both an emulator and a physical\ndevice, which is where the differences actually show up.\n\nTransactions persist in **SQLite** and settings in SharedPreferences, so the app\nworks fully offline, needs no account, and nothing leaves the device.\n\n## Honest limitations\n\nThis was coursework, not production software, and it's worth being straight\nabout what that means: there's no automated test suite, storage is local to a\nsingle device, and there's no cloud backup or sync. An instrumented test suite\nand a sync layer would be the first two things I'd add.",
    "tech": [
      "Java",
      "Android Studio",
      "XML Layouts",
      "SQLite",
      "MPAndroidChart",
      "OkHttp",
      "OpenAI",
      "Gemini"
    ],
    "repoUrl": "https://github.com/Bryantooyah/SaveNow-Mobile-App",
    "liveUrl": null,
    "imageUrl": "/images/project-savenow.webp",
    "year": 2026,
    "featured": true,
    "sortOrder": 2
  },
  {
    "id": 3,
    "slug": "portfolio-website",
    "title": "This Portfolio",
    "summary": "The site you are on. Rebuilt from hand-written HTML into a full-stack TypeScript app with a live API, an admin CMS, and content that still renders when the backend is down.",
    "description": "## Why rebuild it\n\nThe first version was five hand-written HTML files sharing a copy-pasted navbar.\nIt worked, but the contact form silently threw messages away, the viewport meta\ntag had a typo that disabled mobile scaling on every page, and adding a project\nmeant editing markup in four places.\n\n## What it is now\n\nA TypeScript monorepo: React and Vite on the front, Express and PostgreSQL\nbehind it, deployed to Vercel with Neon as the database.\n\n- A **working contact form** — Zod validation, a honeypot, and per-IP rate\n  limiting done as a database count rather than an in-memory counter, because on\n  serverless every request may land in a fresh process.\n- A **GitHub proxy** that caches repo stats server-side, so the project cards\n  show live stars and languages without leaking a token or hitting rate limits.\n- An **admin CMS**, so adding a project is filling in a form rather than\n  redeploying.\n\n## The design decision I like most\n\nThe site is **static-first**. A snapshot of all content is compiled into the JS\nbundle, and the API is only ever asked to make it *fresher*. If the database is\ncold, the deploy is broken, or you're on a train with no signal, the page still\nrenders completely. The backend failing degrades the site to *slightly stale*,\nnever to *broken*.",
    "tech": [
      "TypeScript",
      "React",
      "Vite",
      "Tailwind CSS",
      "Express",
      "PostgreSQL",
      "Vercel"
    ],
    "repoUrl": "https://github.com/Bryantooyah/Bryantooyah.github.io",
    "liveUrl": "https://bryanchua-bay.vercel.app",
    "imageUrl": "/images/project-portfolio.webp",
    "year": 2025,
    "featured": false,
    "sortOrder": 3
  },
  {
    "id": 4,
    "slug": "shift-patrol-generator",
    "title": "Shift Patrol Generator",
    "summary": "An optimisation algorithm that turns raw officer movement data into constraint-based patrol schedules. Built for the SPF Coding Challenge and took first place.",
    "description": "## The brief\n\nGiven raw movement data for a set of officers, generate a patrol schedule that\ncovers the required ground without violating any scheduling constraints.\n\n## Approach\n\nA Flask web app: movement data goes in, the scheduling logic assigns shifts\nagainst the coverage requirements, and a readable plan comes out.\n\nThe interesting part was constraint handling. A naive assignment is easy — the\nhard version is one that *stays* valid as constraints stack up and start\nconflicting with each other, which is where a greedy approach falls over.\n\n## Outcome\n\nFirst place in the Singapore Police Force Coding Challenge.",
    "tech": [
      "Python",
      "Flask",
      "Algorithms",
      "HTML/CSS"
    ],
    "repoUrl": "https://github.com/Bryantooyah/Bryan-and-Tan-Pang-Topic-2",
    "liveUrl": null,
    "imageUrl": "/images/project-shift-patrol.webp",
    "year": 2023,
    "featured": false,
    "sortOrder": 4
  }
];

export const fallbackAwards: Award[] = [
  {
    "id": 7,
    "title": "First Place — SPF Coding Challenge",
    "issuer": "Singapore Police Force",
    "year": 2023,
    "description": "Built an optimisation algorithm generating constraint-based patrol schedules from raw officer movement data.",
    "imageUrl": "/images/logo-spf.webp",
    "sortOrder": 1
  },
  {
    "id": 8,
    "title": "Finalist — National AI Student Challenge (NAISC)",
    "issuer": "AI Singapore",
    "year": 2025,
    "description": "Built an AI Avatar for the Temus Challenge track.",
    "imageUrl": "/images/logo-naisc.webp",
    "sortOrder": 2
  },
  {
    "id": 9,
    "title": "First Runner-Up — BrainHack \"Today I Learned\" AI Hackathon",
    "issuer": "Defence Science and Technology Agency (DSTA)",
    "year": 2021,
    "description": "Placed second at DSTA's national AI hackathon, building and training models under competition conditions.",
    "imageUrl": "/images/logo-dsta.webp",
    "sortOrder": 3
  },
  {
    "id": 10,
    "title": "CS50W — Web Programming with Python and JavaScript",
    "issuer": "Harvard University",
    "year": 2026,
    "description": "Full-stack web development with Django, JavaScript and SQL.",
    "imageUrl": "/images/logo-harvard.webp",
    "sortOrder": 4
  },
  {
    "id": 11,
    "title": "CS50x — Introduction to Computer Science",
    "issuer": "Harvard University",
    "year": 2024,
    "description": "Computer science fundamentals, algorithms and data structures in C and Python.",
    "imageUrl": "/images/logo-harvard.webp",
    "sortOrder": 5
  },
  {
    "id": 12,
    "title": "JLPT N3 — Japanese-Language Proficiency Test",
    "issuer": "Japan Foundation & JEES",
    "year": 2025,
    "description": "Certified intermediate proficiency in Japanese.",
    "imageUrl": "/images/logo-jlpt.webp",
    "sortOrder": 6
  }
];

export function findFallbackProject(slug: string): Project | undefined {
  return fallbackProjects.find((project) => project.slug === slug);
}
