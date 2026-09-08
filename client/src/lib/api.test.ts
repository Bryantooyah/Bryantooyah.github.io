import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, getProjects } from './api';

function respond(body: string, init: { status?: number; type?: string }) {
  return new Response(body, {
    status: init.status ?? 200,
    headers: init.type ? { 'content-type': init.type } : {},
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('api request handling', () => {
  /*
    Regression test for a crash that took down the whole page.

    Vercel (and the dev server) rewrite anything that is not a real file to
    /index.html. If the API function is missing or the /api rewrite is
    misrouted, /api/projects answers with HTML and a 200. The old code parsed
    that, swallowed the parse error, saw response.ok, and returned null — so
    useResource recorded it as live data and handed null to a component that
    immediately did `.length` on it.
  */
  it('rejects an HTML 200 rather than returning null', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(respond('<!doctype html><html></html>', { type: 'text/html' })),
    );

    await expect(getProjects()).rejects.toBeInstanceOf(ApiError);
  });

  it('rejects a 200 with no content type', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respond('', {})));
    await expect(getProjects()).rejects.toBeInstanceOf(ApiError);
  });

  it('rejects a 200 whose body is not valid JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(respond('not json at all', { type: 'application/json' })),
    );
    await expect(getProjects()).rejects.toBeInstanceOf(ApiError);
  });

  it('returns parsed JSON on a normal response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(respond('[{"id":1}]', { type: 'application/json' })),
    );
    await expect(getProjects()).resolves.toEqual([{ id: 1 }]);
  });

  it('surfaces the server error message and field details on a 400', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        respond('{"error":"Validation failed","details":{"email":["bad"]}}', {
          status: 400,
          type: 'application/json',
        }),
      ),
    );

    await expect(getProjects()).rejects.toMatchObject({
      status: 400,
      message: 'Validation failed',
      details: { email: ['bad'] },
    });
  });
});
