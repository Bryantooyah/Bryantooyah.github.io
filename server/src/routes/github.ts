import { Router } from 'express';
import type { GitHubStats } from '@portfolio/shared';
import { query } from '../db/pool.js';
import { env } from '../env.js';
import { repoParamsSchema } from '../schemas/index.js';
import { HttpError } from '../lib/http.js';

export const githubRouter: Router = Router();

interface CacheRow {
  payload: GitHubStats;
  fetched_at: Date;
}

/** Shape of the fields we consume from GitHub's repo endpoint. */
interface GitHubRepoResponse {
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  topics?: string[];
  pushed_at: string | null;
  html_url: string;
}

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    // GitHub rejects requests without a User-Agent.
    'User-Agent': 'bryan-portfolio',
  };
  // Authenticated requests raise the rate limit from 60/hr to 5000/hr. The
  // token stays server-side; this proxy is the only reason it is never in the
  // browser bundle.
  if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
  return headers;
}

async function fetchFromGitHub(owner: string, repo: string): Promise<GitHubStats> {
  const base = `https://api.github.com/repos/${owner}/${repo}`;
  const headers = githubHeaders();

  const [repoRes, langRes] = await Promise.all([
    fetch(base, { headers, signal: AbortSignal.timeout(8000) }),
    fetch(`${base}/languages`, { headers, signal: AbortSignal.timeout(8000) }),
  ]);

  if (!repoRes.ok) {
    throw new Error(`GitHub responded ${repoRes.status} for ${owner}/${repo}`);
  }

  const data = (await repoRes.json()) as GitHubRepoResponse;
  const languages = langRes.ok ? ((await langRes.json()) as Record<string, number>) : {};

  return {
    fullName: data.full_name,
    description: data.description,
    stars: data.stargazers_count,
    forks: data.forks_count,
    openIssues: data.open_issues_count,
    primaryLanguage: data.language,
    languages,
    topics: data.topics ?? [],
    pushedAt: data.pushed_at,
    htmlUrl: data.html_url,
    stale: false,
  };
}

/**
 * GET /api/github/:owner/:repo
 *
 * Serves cached stats, refreshing them at most once per TTL. If GitHub is
 * unreachable or rate-limits us, a previously cached payload is returned with
 * `stale: true` rather than an error — out-of-date star counts are a far better
 * outcome on a portfolio than a broken card.
 */
githubRouter.get('/:owner/:repo', async (req, res) => {
  const { owner, repo } = repoParamsSchema.parse(req.params);
  const key = `${owner}/${repo}`;

  const cached = await query<CacheRow>(
    'SELECT payload, fetched_at FROM github_cache WHERE repo = $1',
    [key],
  );
  const hit = cached.rows[0];

  if (hit) {
    const ageMinutes = (Date.now() - hit.fetched_at.getTime()) / 60_000;
    if (ageMinutes < env.GITHUB_CACHE_TTL_MINUTES) {
      res.json({ ...hit.payload, stale: false } satisfies GitHubStats);
      return;
    }
  }

  try {
    const fresh = await fetchFromGitHub(owner, repo);
    await query(
      `INSERT INTO github_cache (repo, payload, fetched_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (repo) DO UPDATE SET payload = EXCLUDED.payload, fetched_at = NOW()`,
      [key, JSON.stringify(fresh)],
    );
    res.json(fresh);
  } catch (err) {
    console.error(`GitHub fetch failed for ${key}:`, err);
    if (hit) {
      res.json({ ...hit.payload, stale: true } satisfies GitHubStats);
      return;
    }
    throw new HttpError(502, 'Could not reach GitHub and no cached data is available');
  }
});
