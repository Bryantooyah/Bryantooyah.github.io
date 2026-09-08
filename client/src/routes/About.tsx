import type { ReactNode } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { BIO, EDUCATION, EXPERIENCE, PROFILE, SKILL_GROUPS } from '@/data/profile';
import { ProfilePhoto } from '@/components/ProfilePhoto';
import { OrgLogo } from '@/components/OrgLogo';
import { Page, SectionHeading, TechBadge } from '@/components/ui';

/** One role or qualification: logo, title, linked organisation, dates, bullets. */
function Entry({
  title,
  organisation,
  url,
  logo,
  period,
  points,
}: {
  title: string;
  organisation: string;
  url: string | null;
  logo: string | null;
  period: string;
  points: string[];
}) {
  const org: ReactNode = url ? (
    <a
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      className="text-accent hover:underline"
    >
      {organisation}
    </a>
  ) : (
    <span className="text-accent">{organisation}</span>
  );

  return (
    <article className="flex gap-4 rounded-xl border border-border bg-surface p-6">
      <OrgLogo src={logo} name={organisation} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="text-lg font-bold tracking-tight">{title}</h3>
          <span className="font-mono text-xs text-muted">{period}</span>
        </div>
        <p className="mt-1 text-sm font-medium">{org}</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
          {points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function About() {
  useDocumentTitle(
    'About',
    'Bryan Chua — background, work experience, education and technical skills.',
  );

  return (
    <Page>
      <SectionHeading level={1} eyebrow="About" title="A bit about me" />

      <div className="grid gap-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="max-w-2xl space-y-4 text-muted">
          <p className="text-lg leading-relaxed">{PROFILE.tagline}</p>
          {BIO.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        <div>
          <ProfilePhoto photo={PROFILE.aboutPhoto} />
        </div>
      </div>

      <div className="mt-16">
        <SectionHeading eyebrow="Experience" title="Where I've worked" />
        <div className="space-y-6">
          {EXPERIENCE.map((job) => (
            <Entry
              key={`${job.organisation}-${job.period}`}
              title={job.role}
              organisation={job.organisation}
              url={job.url}
              logo={job.logo}
              period={job.period}
              points={job.points}
            />
          ))}
        </div>
      </div>

      <div className="mt-16">
        <SectionHeading eyebrow="Education" title="Studies" />
        <div className="space-y-6">
          {EDUCATION.map((entry) => (
            <Entry
              key={entry.institution}
              title={entry.qualification}
              organisation={entry.institution}
              url={entry.url}
              logo={entry.logo}
              period={entry.period}
              points={entry.points}
            />
          ))}
        </div>
      </div>

      <div className="mt-16">
        <SectionHeading eyebrow="Skills" title="What I work with" />
        <div className="grid gap-5 sm:grid-cols-2">
          {SKILL_GROUPS.map((group) => (
            <div key={group.name} className="rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-3 text-sm font-semibold">{group.name}</h3>
              <div className="flex flex-wrap gap-1.5">
                {group.skills.map((skill) => (
                  <TechBadge key={skill} label={skill} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}
