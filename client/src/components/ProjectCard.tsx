import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Project } from '@portfolio/shared';
import { GitHubStat } from './GitHubStat';
import { ArrowRightIcon, ExternalIcon, GitHubIcon } from './Icons';
import { TechBadge } from './ui';

type Orientation = 'landscape' | 'portrait';

/**
 * Screenshot or poster, letterboxed against the card surface.
 *
 * Reports the image's orientation once it loads, because the card arranges
 * itself differently around a wide screenshot than a tall poster. Defaults to
 * landscape and only ever switches to portrait, so it settles in one step
 * rather than flip-flopping.
 */
function Media({
  project,
  className,
  fit,
  onOrientation,
}: {
  project: Project;
  className: string;
  /**
   * `cover` for wide screenshots — they have margins, so filling the frame and
   * losing a few percent at the edges reads far better than floating in bars.
   * `contain` for tall posters, which are artwork with text right up to the
   * edge and must not be cropped at all.
   */
  fit: 'cover' | 'contain';
  onOrientation?: (value: Orientation) => void;
}) {
  const [failed, setFailed] = useState(false);

  if (project.imageUrl === null || failed) {
    return (
      <div className={`${className} flex items-center justify-center bg-accent-soft`}>
        <span className="font-mono text-3xl font-bold text-accent/60">
          {project.tech[0] ?? project.title.slice(0, 2)}
        </span>
      </div>
    );
  }

  return (
    <img
      src={project.imageUrl}
      alt=""
      loading="lazy"
      decoding="async"
      onLoad={(event) => {
        const img = event.currentTarget;
        if (img.naturalHeight > img.naturalWidth) onOrientation?.('portrait');
      }}
      // A missing file arrives as the SPA's index.html, which fails to decode.
      onError={() => {
        setFailed(true);
      }}
      className={`${className} bg-surface-2 ${fit === 'cover' ? 'object-cover' : 'object-contain'}`}
    />
  );
}

function Links({ project, stacked }: { project: Project; stacked?: boolean }) {
  return (
    <div
      className={
        stacked
          ? 'flex flex-col gap-2 text-sm font-medium'
          : 'flex flex-wrap items-center gap-4 text-sm font-medium'
      }
    >
      <Link
        to={`/projects/${project.slug}`}
        className="inline-flex items-center gap-1 text-accent hover:underline"
      >
        Case study
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
      {project.repoUrl ? (
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 text-muted transition hover:text-text"
        >
          <GitHubIcon className="h-4 w-4" />
          Source
        </a>
      ) : null}
      {project.liveUrl ? (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 text-muted transition hover:text-text"
        >
          <ExternalIcon className="h-4 w-4" />
          Live
        </a>
      ) : null}
    </div>
  );
}

/** Caps the badge list so it stays on one row and does not grow the card. */
function TechList({ project, limit }: { project: Project; limit: number }) {
  if (project.tech.length === 0) return null;
  const extra = project.tech.length - limit;

  return (
    <div className="flex flex-wrap gap-1.5">
      {project.tech.slice(0, limit).map((tech) => (
        <TechBadge key={tech} label={tech} />
      ))}
      {extra > 0 ? (
        <span className="self-center font-mono text-xs text-muted">+{extra}</span>
      ) : null}
    </div>
  );
}

function Header({ project }: { project: Project }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <h3 className="text-lg font-bold tracking-tight">
        <Link to={`/projects/${project.slug}`} className="transition group-hover:text-accent">
          {project.title}
        </Link>
      </h3>
      {project.year ? (
        <span className="shrink-0 font-mono text-xs text-muted">{project.year}</span>
      ) : null}
    </div>
  );
}

const CARD =
  'group overflow-hidden rounded-xl border border-border bg-surface transition hover:border-accent/50';

/**
 * `wide` is the home-page carousel card, which fills the row on its own.
 *
 * Its layout follows the image:
 *  - a wide screenshot sits across the top, with the text below-left and the
 *    links in a column to the right;
 *  - a tall poster sits down the left instead, so it is not letterboxed into a
 *    letterbox.
 *
 * Both cap the image height. Left uncapped, a single card grew taller than a
 * laptop viewport.
 */
export function ProjectCard({ project, wide = false }: { project: Project; wide?: boolean }) {
  const [orientation, setOrientation] = useState<Orientation>('landscape');

  if (!wide) {
    return (
      <article className={`${CARD} flex h-full flex-col`}>
        <Link to={`/projects/${project.slug}`} tabIndex={-1} aria-hidden className="block">
          <Media project={project} fit="contain" className="aspect-video w-full" />
        </Link>

        <div className="flex flex-1 flex-col p-5">
          <Header project={project} />
          <p className="mb-4 text-sm leading-relaxed text-muted">{project.summary}</p>

          {project.tech.length > 0 ? (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {project.tech.slice(0, 5).map((tech) => (
                <TechBadge key={tech} label={tech} />
              ))}
              {project.tech.length > 5 ? (
                <span className="self-center font-mono text-xs text-muted">
                  +{project.tech.length - 5}
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="mt-auto space-y-3">
            <GitHubStat repoUrl={project.repoUrl} />
            <Links project={project} />
          </div>
        </div>
      </article>
    );
  }

  // Tall poster: down the left at its natural height, so nothing is cropped and
  // the card is exactly as tall as the artwork.
  if (orientation === 'portrait') {
    return (
      <article className={`${CARD} grid sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]`}>
        <Link to={`/projects/${project.slug}`} tabIndex={-1} aria-hidden className="block">
          <Media
            project={project}
            fit="contain"
            onOrientation={setOrientation}
            className="h-auto w-full"
          />
        </Link>

        <div className="flex flex-col gap-3 p-5">
          <Header project={project} />
          <p className="text-sm leading-relaxed text-muted">{project.summary}</p>
          <TechList project={project} limit={6} />
          <GitHubStat repoUrl={project.repoUrl} />
          <Links project={project} />
        </div>
      </article>
    );
  }

  // Wide screenshot: across the top, filling the frame edge to edge.
  return (
    <article className={`${CARD} flex flex-col`}>
      <Link to={`/projects/${project.slug}`} tabIndex={-1} aria-hidden className="block">
        <Media
          project={project}
          fit="cover"
          onOrientation={setOrientation}
          className="aspect-[16/9] w-full"
        />
      </Link>

      <div className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex flex-col gap-3">
          <Header project={project} />
          <p className="text-sm leading-relaxed text-muted">{project.summary}</p>
          <TechList project={project} limit={5} />
          <GitHubStat repoUrl={project.repoUrl} />
        </div>

        <div className="sm:border-l sm:border-border sm:pl-5">
          <Links project={project} stacked />
        </div>
      </div>
    </article>
  );
}
