import { Link } from 'react-router-dom';
import { getAwards, getProjects } from '@/lib/api';
import { useResource } from '@/hooks/useResource';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fallbackAwards, fallbackProjects } from '@/data/fallback';
import { EXPERIENCE, PROFILE, SKILL_GROUPS, SOCIAL } from '@/data/profile';
import { ProjectCard } from '@/components/ProjectCard';
import { AwardCard } from '@/components/AwardCard';
import { Carousel } from '@/components/Carousel';
import { ProfilePhoto } from '@/components/ProfilePhoto';
import { ArrowRightIcon, GitHubIcon, LinkedInIcon } from '@/components/Icons';
import { ButtonLink, Page, SectionHeading, TechBadge } from '@/components/ui';

export function Home() {
  useDocumentTitle('Bryan Chua — Software Engineer', PROFILE.tagline);

  const { data: projects } = useResource(getProjects, fallbackProjects);
  const { data: awards } = useResource(getAwards, fallbackAwards);

  const current = EXPERIENCE[0];

  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
          <div className="grid items-center gap-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div>
              <p className="reveal mb-4 font-mono text-sm text-accent">Hi, I&apos;m</p>
              <h1 className="reveal text-4xl font-extrabold tracking-tight sm:text-6xl">
                {PROFILE.name}
              </h1>
              <p className="reveal mt-5 max-w-xl text-lg leading-relaxed text-muted">
                {PROFILE.tagline}
              </p>

              <div className="reveal mt-8 flex flex-wrap gap-3">
                <ButtonLink to="/projects">
                  View my work
                  <ArrowRightIcon className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink to="/contact" variant="outline">
                  Get in touch
                </ButtonLink>
              </div>

              <div className="reveal mt-8 flex flex-wrap items-center gap-5 text-sm">
                <a
                  href={SOCIAL.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 text-muted transition hover:text-accent"
                >
                  <GitHubIcon className="h-[18px] w-[18px]" />
                  GitHub
                </a>
                <a
                  href={SOCIAL.linkedin}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 text-muted transition hover:text-accent"
                >
                  <LinkedInIcon className="h-[18px] w-[18px]" />
                  LinkedIn
                </a>
              </div>
            </div>

            <div className="reveal order-first md:order-last">
              {/* Capped at the source file's own width (341px) so it is never
                  upscaled into softness on a large screen. */}
              <div className="mx-auto w-full max-w-[340px]">
                <ProfilePhoto photo={PROFILE.heroPhoto} priority className="shadow-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Page>
        <SectionHeading eyebrow="Selected work" title="Things I've built" />

        {/* Narrower than the page. A card the full 1024px leaves a landscape
            screenshot floating in a sea of empty card, and grows taller than is
            comfortable on a laptop. */}
        <div className="mx-auto max-w-2xl">
          <Carousel
            label="Projects"
            items={projects}
            keyOf={(project) => project.id}
            renderItem={(project) => <ProjectCard project={project} wide />}
          />
        </div>

        <div className="mt-6">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            All projects
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        {current ? (
          <div className="mt-20">
            <SectionHeading eyebrow="Experience" title="Where I've worked" />
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-lg font-bold tracking-tight">{current.role}</h3>
                <span className="font-mono text-xs text-muted">{current.period}</span>
              </div>
              <p className="mt-1 text-sm font-medium text-accent">{current.organisation}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{current.points[0]}</p>
              <Link
                to="/about"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
              >
                Full background
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : null}

        <div className="mt-20">
          <SectionHeading eyebrow="Toolkit" title="What I work with" />
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

        <div className="mt-20">
          <SectionHeading eyebrow="Recognition" title="Credentials" />
          <div className="mx-auto max-w-2xl">
            <Carousel
              label="Awards"
              items={awards}
              keyOf={(award) => award.id}
              renderItem={(award) => <AwardCard award={award} />}
            />
          </div>
        </div>

        <div className="mt-20 rounded-xl border border-border bg-surface-2 p-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight">Looking for an intern?</h2>
          <p className="mx-auto mt-2 max-w-lg text-muted">
            I&apos;m open to internships and freelance work in full-stack development.
            Tell me what you&apos;re building.
          </p>
          <div className="mt-6 flex justify-center">
            <ButtonLink to="/contact">
              Get in touch
              <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </Page>
    </>
  );
}
