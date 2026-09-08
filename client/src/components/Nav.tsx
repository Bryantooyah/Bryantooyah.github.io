import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { CloseIcon, MenuIcon } from './Icons';

const LINKS = [
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/credentials', label: 'Credentials' },
  { to: '/contact', label: 'Contact' },
];

function linkClass({ isActive }: { isActive: boolean }): string {
  return [
    'rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive ? 'text-accent' : 'text-muted hover:text-text',
  ].join(' ');
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer whenever the route changes, otherwise it stays open
  // over the page the visitor just navigated to.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Escape closes the drawer — expected of anything overlaying the page.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5" aria-label="Main">
        <Link
          to="/"
          className="font-mono text-[15px] font-semibold tracking-tight transition hover:text-accent"
        >
          bryan<span className="text-accent">.</span>chua
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => {
              setOpen((value) => !value);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition hover:border-accent hover:text-accent"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <CloseIcon className="h-[18px] w-[18px]" /> : <MenuIcon className="h-[18px] w-[18px]" />}
          </button>
        </div>
      </nav>

      {/* `hidden` rather than conditional rendering keeps the links in the DOM
          for assistive tech to find via aria-controls. */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="border-t border-border bg-bg px-5 py-3 md:hidden"
      >
        <ul className="flex flex-col gap-1">
          {LINKS.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} className={linkClass}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
