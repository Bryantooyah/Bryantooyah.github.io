import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

/** Small shared primitives. Kept together because none is big enough to own a file. */

export function Page({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-5xl px-5 py-12 sm:py-16">{children}</div>;
}

/**
 * `level` exists so a page whose first heading is a section heading still emits
 * an <h1>. Every page needs exactly one, both for screen-reader navigation and
 * because search engines treat it as the page's title.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  level = 2,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  level?: 1 | 2;
}) {
  const Heading = level === 1 ? 'h1' : 'h2';

  return (
    <div className="mb-8">
      {eyebrow ? (
        <p className="mb-2 font-mono text-xs font-medium tracking-widest text-accent uppercase">
          {eyebrow}
        </p>
      ) : null}
      <Heading
        className={
          level === 1
            ? 'text-3xl font-extrabold tracking-tight sm:text-4xl'
            : 'text-2xl font-bold tracking-tight sm:text-3xl'
        }
      >
        {title}
      </Heading>
      {description ? <p className="mt-2 max-w-2xl text-muted">{description}</p> : null}
    </div>
  );
}

export function TechBadge({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-1 font-mono text-xs font-medium',
        active
          ? 'bg-accent text-accent-fg'
          : 'bg-accent-soft text-accent',
      ].join(' ')}
    >
      {label}
    </span>
  );
}

type ButtonVariant = 'primary' | 'outline';

function buttonClass(variant: ButtonVariant): string {
  const shared =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60';
  return variant === 'primary'
    ? `${shared} bg-accent text-accent-fg hover:bg-accent-hover`
    : `${shared} border border-border text-text hover:border-accent hover:text-accent`;
}

export function ButtonLink({
  to,
  href,
  variant = 'primary',
  children,
}: {
  to?: string;
  href?: string;
  variant?: ButtonVariant;
  children: ReactNode;
}) {
  if (to) {
    return (
      <Link to={to} className={buttonClass(variant)}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" className={buttonClass(variant)}>
      {children}
    </a>
  );
}

export function Button({
  type = 'button',
  variant = 'primary',
  disabled,
  onClick,
  children,
}: {
  type?: 'button' | 'submit';
  variant?: ButtonVariant;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={buttonClass(variant)}>
      {children}
    </button>
  );
}

/**
 * Announces async status changes to screen readers. `role="status"` makes the
 * message polite — it is read after whatever is currently being announced,
 * rather than interrupting.
 */
export function StatusMessage({
  tone,
  children,
}: {
  tone: 'success' | 'error';
  children: ReactNode;
}) {
  return (
    <p
      role="status"
      className={[
        'flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm',
        tone === 'success'
          ? 'border-accent/40 bg-accent-soft text-accent'
          : 'border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400',
      ].join(' ')}
    >
      {children}
    </p>
  );
}
