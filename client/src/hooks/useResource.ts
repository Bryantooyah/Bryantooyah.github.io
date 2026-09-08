import { useEffect, useState } from 'react';

export type ResourceState = 'loading' | 'live' | 'fallback';

export interface Resource<T> {
  data: T;
  state: ResourceState;
  /** True while the first request is still outstanding. */
  loading: boolean;
}

/**
 * Fetches a resource, falling back to bundled static content on any failure.
 *
 * `data` is never empty and never undefined — it starts as the fallback and is
 * replaced only if the request succeeds. Callers therefore render
 * unconditionally and never need a loading guard or an error branch.
 *
 * `fetcher` is an effect dependency, so it must be referentially stable. Pass a
 * module-level function (as lib/api.ts exports) or wrap it in useCallback.
 */
export function useResource<T>(fetcher: () => Promise<T>, fallback: T): Resource<T> {
  const [data, setData] = useState<T>(fallback);
  const [state, setState] = useState<ResourceState>('loading');

  useEffect(() => {
    let cancelled = false;

    fetcher()
      .then((result) => {
        if (cancelled) return;
        // Defence in depth. `data` is contracted never to be null, because
        // callers render it unconditionally — a null here would crash them.
        // api.ts should already have rejected such a response.
        if (result === null || result === undefined) {
          console.warn('API returned an empty result; keeping bundled content.');
          setState('fallback');
          return;
        }
        setData(result);
        setState('live');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.warn('Falling back to bundled content:', err);
        setState('fallback');
      });

    return () => {
      cancelled = true;
    };
  }, [fetcher]);

  return { data, state, loading: state === 'loading' };
}
