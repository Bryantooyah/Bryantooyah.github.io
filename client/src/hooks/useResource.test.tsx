import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useResource } from './useResource';

const FALLBACK = [{ id: 1, name: 'bundled' }];
const LIVE = [{ id: 2, name: 'from api' }];

describe('useResource', () => {
  it('starts with the fallback so the page is never empty', () => {
    const { result } = renderHook(() => useResource(() => new Promise(() => undefined), FALLBACK));

    expect(result.current.data).toEqual(FALLBACK);
    expect(result.current.loading).toBe(true);
  });

  it('replaces the fallback once the request succeeds', async () => {
    const { result } = renderHook(() => useResource(() => Promise.resolve(LIVE), FALLBACK));

    await waitFor(() => {
      expect(result.current.state).toBe('live');
    });
    expect(result.current.data).toEqual(LIVE);
  });

  it('keeps the fallback when the request resolves with null', async () => {
    // A component that renders data unconditionally would crash on null. The
    // hook must never let one through, whatever the fetcher returns.
    const { result } = renderHook(() =>
      useResource(() => Promise.resolve(null as unknown as typeof FALLBACK), FALLBACK),
    );

    await waitFor(() => {
      expect(result.current.state).toBe('fallback');
    });
    expect(result.current.data).toEqual(FALLBACK);
  });

  it('keeps rendering the fallback when the request fails', async () => {
    const { result } = renderHook(() =>
      useResource(() => Promise.reject(new Error('offline')), FALLBACK),
    );

    await waitFor(() => {
      expect(result.current.state).toBe('fallback');
    });
    // The whole point: a dead API degrades to stale content, never to a blank page.
    expect(result.current.data).toEqual(FALLBACK);
  });
});
