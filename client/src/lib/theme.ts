export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

/**
 * Reads the theme already applied to the document. The inline script in
 * index.html has run by this point, so the DOM — not localStorage — is the
 * source of truth, and the two can never disagree.
 */
export function getCurrentTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private mode or blocked storage: the choice still applies for this page
    // view, it just will not be remembered.
  }
}
