/**
 * Regenerates client/src/data/fallback.ts from the live API.
 *
 * The fallback file is what the site renders when the API cannot be reached,
 * so it needs refreshing whenever content changes materially in /admin.
 * The database stays the source of truth; this just re-snapshots it.
 *
 *   npm run snapshot                          # against local dev (:3000)
 *   API=https://bryanchua.com npm run snapshot  # against production
 */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const API = process.env.API ?? 'http://localhost:3000';
const OUT = fileURLToPath(new URL('../client/src/data/fallback.ts', import.meta.url));

async function get(path) {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`GET ${path} responded ${res.status}`);
  return res.json();
}

const [projects, awards] = await Promise.all([get('/api/projects'), get('/api/awards')]);

// Fetch each detail record so the case studies are available offline too — the
// list endpoint deliberately omits `description`.
const detailed = await Promise.all(projects.map((p) => get(`/api/projects/${p.slug}`)));

const file = `import type { Award, Project } from '@portfolio/shared';

/**
 * Build-time snapshot of the portfolio content, compiled into the JS bundle.
 *
 * The site renders from this whenever the API cannot be reached — a cold
 * database, a broken deploy, a dropped connection. The consequence is that the
 * page is always complete and correct; the API's job is to keep it *fresh*,
 * never to make it *work*.
 *
 * GENERATED FILE — do not edit by hand. Regenerate with \`npm run snapshot\`.
 * Last generated: ${new Date().toISOString().slice(0, 10)}
 */

export const fallbackProjects: Project[] = ${JSON.stringify(detailed, null, 2)};

export const fallbackAwards: Award[] = ${JSON.stringify(awards, null, 2)};

export function findFallbackProject(slug: string): Project | undefined {
  return fallbackProjects.find((project) => project.slug === slug);
}
`;

await writeFile(OUT, file, 'utf8');
console.log(
  `Wrote ${String(detailed.length)} projects and ${String(awards.length)} awards to client/src/data/fallback.ts`,
);
console.log('Run `npm run lint` to reformat, then commit the result.');
