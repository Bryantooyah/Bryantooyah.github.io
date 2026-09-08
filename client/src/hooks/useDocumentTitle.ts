import { useEffect } from 'react';

const SUFFIX = 'Bryan Chua';

/**
 * Sets the page title and meta description per route.
 *
 * This is a single-page app, so the document head does not change on its own
 * during navigation — without this, every route would keep the title that
 * index.html shipped with, which hurts both bookmarking and search results.
 */
export function useDocumentTitle(title: string, description?: string): void {
  useEffect(() => {
    document.title = title === SUFFIX ? title : `${title} — ${SUFFIX}`;

    if (!description) return;
    const meta = document.querySelector('meta[name="description"]');
    const previous = meta?.getAttribute('content');
    meta?.setAttribute('content', description);

    return () => {
      // getAttribute returns string | null, and the optional chain can also
      // yield undefined — a type check covers both without a loose comparison.
      if (typeof previous === 'string') meta?.setAttribute('content', previous);
    };
  }, [title, description]);
}
