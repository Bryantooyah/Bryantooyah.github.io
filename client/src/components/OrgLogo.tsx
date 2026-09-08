import { useState } from 'react';

/**
 * A short mark for an organisation.
 *
 * Prefers an acronym the name already contains — "Defence Science and
 * Technology Agency (DSTA)" should read DSTA, not DST — and otherwise takes the
 * first letter of each significant word, so "Singapore Police Force" gives SPF.
 */
export function initials(name: string): string {
  const acronym = /\b[A-Z]{2,5}\b/.exec(name);
  if (acronym) return acronym[0];

  return name
    .replace(/[(),]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 0 && !/^(of|the|and|for|de|&)$/i.test(word))
    .slice(0, 3)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * An organisation's logo, falling back to its initials.
 *
 * Logos are third-party files that have to be added by hand, so the fallback is
 * the normal case until they are, not an error path — a card with a neat
 * monogram looks deliberate, a broken-image icon does not.
 *
 * `contain` on a white-ish plate: most official logos are supplied with a
 * transparent or white background and disappear against the dark theme
 * otherwise.
 */
export function OrgLogo({
  src,
  name,
  /**
   * Wider than it is tall on purpose. Official marks are a mix of square crests
   * (SPF, Harvard) and wide wordmarks (SUTD, DSTA, JLPT at over 3:1), and a
   * square slot renders the wordmarks about 14px tall — unreadable. This box
   * lets a wordmark use the full width while a crest still centres at 48px.
   */
  className = 'h-12 w-16',
}: {
  src: string | null;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const shape = `${className} shrink-0 rounded-lg`;

  if (src === null || failed) {
    return (
      <div
        className={`${shape} flex items-center justify-center bg-accent-soft font-mono text-xs font-bold text-accent`}
        aria-hidden
      >
        {initials(name)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      aria-hidden
      loading="lazy"
      decoding="async"
      onError={() => {
        setFailed(true);
      }}
      className={`${shape} bg-white object-contain p-1`}
    />
  );
}
