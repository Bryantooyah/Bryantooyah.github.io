import { Link } from 'react-router-dom';
import { SOCIAL } from '@/data/profile';
import { GitHubIcon, LinkedInIcon, MailIcon } from './Icons';

const iconClass = 'h-[18px] w-[18px]';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-sm font-semibold">
            bryan<span className="text-accent">.</span>chua
          </p>
          <p className="mt-1 text-sm text-muted">
            &copy; {new Date().getFullYear()} Bryan Chua. Built with TypeScript, React and Express.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={SOCIAL.github}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition hover:border-accent hover:text-accent"
            aria-label="GitHub profile"
          >
            <GitHubIcon className={iconClass} />
          </a>
          <a
            href={SOCIAL.linkedin}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition hover:border-accent hover:text-accent"
            aria-label="LinkedIn profile"
          >
            <LinkedInIcon className={iconClass} />
          </a>
          <Link
            to="/contact"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition hover:border-accent hover:text-accent"
            aria-label="Contact me"
          >
            <MailIcon className={iconClass} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
