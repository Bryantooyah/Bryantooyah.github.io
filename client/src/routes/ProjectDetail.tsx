import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import type { Project } from '@portfolio/shared';
import { getProject } from '@/lib/api';
import { useResource } from '@/hooks/useResource';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { findFallbackProject } from '@/data/fallback';
import { GitHubStat } from '@/components/GitHubStat';
import { ArrowLeftIcon, ExternalIcon, GitHubIcon } from '@/components/Icons';
import { ButtonLink, Page, TechBadge } from '@/components/ui';
import { NotFound } from './NotFound';

export function ProjectDetail() {
  const { slug = '' } = useParams();

  const fetcher = useCallback(() => getProject(slug), [slug]);
  const fallback: Project | null = findFallbackProject(slug) ?? null;
  const { data: project, state } = useResource<Project | null>(fetcher, fallback);

  useDocumentTitle(project?.title ?? 'Project', project?.summary);

  // Only a genuinely unknown slug reaches this — a failed request still has the
  // bundled fallback to fall back on.
  if (!project && state !== 'loading') {
    return <NotFound />;
  }
  if (!project) return null;

  return (
    <Page>
      <Link
        to="/projects"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-accent"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        All projects
      </Link>

      <header className="mb-8">
        <div className="mb-3 flex flex-wrap items-baseline gap-x-4">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{project.title}</h1>
          {project.year ? (
            <span className="font-mono text-sm text-muted">{project.year}</span>
          ) : null}
        </div>

        <p className="max-w-2xl text-lg leading-relaxed text-muted">{project.summary}</p>

        {project.tech.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {project.tech.map((tech) => (
              <TechBadge key={tech} label={tech} />
            ))}
          </div>
        ) : null}

        <div className="mt-5">
          <GitHubStat repoUrl={project.repoUrl} />
        </div>

        {project.repoUrl ?? project.liveUrl ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {project.repoUrl ? (
              <ButtonLink href={project.repoUrl} variant="outline">
                <GitHubIcon className="h-4 w-4" />
                View source
              </ButtonLink>
            ) : null}
            {project.liveUrl ? (
              <ButtonLink href={project.liveUrl}>
                <ExternalIcon className="h-4 w-4" />
                Live site
              </ButtonLink>
            ) : null}
          </div>
        ) : null}
      </header>

      {project.imageUrl ? (
        <img
          src={project.imageUrl}
          alt={`Screenshot of ${project.title}`}
          width={1280}
          height={720}
          className="mb-10 aspect-video w-full rounded-xl border border-border object-cover"
        />
      ) : null}

      {project.description ? (
        <div className="prose-case max-w-2xl">
          {/*
            react-markdown does not render raw HTML by default, so admin-authored
            Markdown cannot inject script tags into the page.
          */}
          <ReactMarkdown>{project.description}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-muted">
          The full write-up for this project isn&apos;t available offline. Reload once you&apos;re
          back online, or{' '}
          {project.repoUrl ? (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-accent underline underline-offset-2"
            >
              read the repository
            </a>
          ) : (
            'check back shortly'
          )}
          .
        </p>
      )}
    </Page>
  );
}
