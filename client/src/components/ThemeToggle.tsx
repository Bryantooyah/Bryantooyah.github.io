import { useEffect, useState } from 'react';
import { applyTheme, getCurrentTheme, type Theme } from '@/lib/theme';
import { MoonIcon, SunIcon } from './Icons';

export function ThemeToggle() {
  // Starts as 'light' and syncs on mount rather than reading the DOM during
  // render, so the component behaves the same under server-side rendering or a
  // test environment where documentElement may not carry the class yet.
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    setTheme(getCurrentTheme());
  }, []);

  function toggle(): void {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition hover:border-accent hover:text-accent"
      // The label states what the button will do, not what the theme is now.
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {theme === 'dark' ? <SunIcon className="h-[18px] w-[18px]" /> : <MoonIcon className="h-[18px] w-[18px]" />}
    </button>
  );
}
