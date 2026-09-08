import type { Award } from '@portfolio/shared';
import { OrgLogo } from './OrgLogo';

export function AwardCard({ award }: { award: Award }) {
  return (
    <article className="flex gap-4 rounded-xl border border-border bg-surface p-5">
      {/* The awarding body's mark. `imageUrl` holds its logo; without one the
          component falls back to the issuer's initials. */}
      <OrgLogo src={award.imageUrl} name={award.issuer} />

      <div className="min-w-0">
        <div className="mb-1 flex flex-wrap items-baseline gap-x-3">
          <h3 className="font-bold tracking-tight">{award.title}</h3>
          <span className="font-mono text-xs text-muted">{award.year}</span>
        </div>
        <p className="text-sm font-medium text-accent">{award.issuer}</p>
        {award.description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted">{award.description}</p>
        ) : null}
      </div>
    </article>
  );
}
