import { useMemo, useState } from 'react';
import { getProjects } from '@/lib/api';
import { useResource } from '@/hooks/useResource';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fallbackProjects } from '@/data/fallback';
import { ProjectCard } from '@/components/ProjectCard';
import { Page, SectionHeading } from '@/components/ui';

const ALL = 'All';

export function Projects() {
  useDocumentTitle('Projects', 'Projects Bryan Chua has designed and built.');

  const { data: projects } = useResource(getProjects, fallbackProjects);
  const [filter, setFilter] = useState<string>(ALL);

  // Tags are derived from the projects themselves, so adding a project through
  // the admin panel adds its tags to the filter automatically.
  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const project of projects) {
      for (const tech of project.tech) {
        counts.set(tech, (counts.get(tech) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag]) => tag);
  }, [projects]);

  const visible = useMemo(
    () => (filter === ALL ? projects : projects.filter((p) => p.tech.includes(filter))),
    [projects, filter],
  );

  return (
    <Page>
      <SectionHeading
        level={1}
        eyebrow="Portfolio"
        title="Projects"
        description="Coursework, competitions and things built out of curiosity. Each one has a write-up covering what it does and what I'd change."
      />

      {tags.length > 0 ? (
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter projects by technology">
          {[ALL, ...tags].map((tag) => {
            const active = filter === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setFilter(tag);
                }}
                aria-pressed={active}
                className={[
                  'rounded-full px-3 py-1.5 font-mono text-xs font-medium transition',
                  active
                    ? 'bg-accent text-accent-fg'
                    : 'border border-border text-muted hover:border-accent hover:text-accent',
                ].join(' ')}
              >
                {tag}
              </button>
            );
          })}
        </div>
      ) : null}

      {visible.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {visible.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <p className="text-muted">No projects match that filter yet.</p>
      )}
    </Page>
  );
}
