import { useCallback, useMemo } from 'react';
import type { GitHubStats } from '@portfolio/shared';
import { getGitHubStats } from '@/lib/api';
import { useResource } from '@/hooks/useResource';
import { ForkIcon, StarIcon } from './Icons';

/** Extracts owner/repo from a github.com URL. Returns null for anything else. */
export function parseRepoUrl(url: string | null): { owner: string; repo: string } | null {
  if (!url) return null;
  const match = /github\.com\/([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+?)(?:\.git)?\/?$/.exec(url);
  if (!match?.[1] || !match[2]) return null;
  return { owner: match[1], repo: match[2] };
}

function formatRelative(iso: string | null): string | null {
  if (!iso) return null;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (Number.isNaN(days)) return null;
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${String(days)}d ago`;
  if (days < 365) return `${String(Math.floor(days / 30))}mo ago`;
  return `${String(Math.floor(days / 365))}y ago`;
}

const EMPTY: GitHubStats | null = null;

/**
 * Live repository stats. Renders nothing at all until real data arrives —
 * a project card is complete without it, so an unavailable GitHub API should
 * leave no trace rather than showing zeros or an error.
 */
export function GitHubStat({ repoUrl }: { repoUrl: string | null }) {
  // parseRepoUrl builds a fresh object each call, so memoise it — otherwise the
  // fetcher below changes identity every render and useResource refetches in a
  // loop.
  const parsed = useMemo(() => parseRepoUrl(repoUrl), [repoUrl]);

  const fetcher = useCallback(() => {
    if (!parsed) return Promise.reject(new Error('Not a GitHub URL'));
    return getGitHubStats(parsed.owner, parsed.repo);
  }, [parsed]);

  const { data } = useResource<GitHubStats | null>(fetcher, EMPTY);

  if (!data) return null;

  const updated = formatRelative(data.pushedAt);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted">
      {data.primaryLanguage ? (
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
          {data.primaryLanguage}
        </span>
      ) : null}
      {data.stars > 0 ? (
        <span className="flex items-center gap-1">
          <StarIcon className="h-3.5 w-3.5" />
          {data.stars}
          <span className="sr-only">stars</span>
        </span>
      ) : null}
      {data.forks > 0 ? (
        <span className="flex items-center gap-1">
          <ForkIcon className="h-3.5 w-3.5" />
          {data.forks}
          <span className="sr-only">forks</span>
        </span>
      ) : null}
      {updated ? <span>updated {updated}</span> : null}
    </div>
  );
}
