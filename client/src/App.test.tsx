import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import * as api from '@/lib/api';

/**
 * Whole-app smoke tests. Every request is made to fail, which exercises the
 * static-first path: with no API at all, the site must still render complete
 * content from the bundled fallback.
 */
function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

beforeAll(async () => {
  /*
    Warm the code-split route chunks before any assertion runs.

    ProjectDetail and Admin are React.lazy imports, and Vite transforms them on
    first use — ProjectDetail pulls in react-markdown, which on a cold cache can
    take longer than a findBy* timeout. Paying that cost here, outside any timed
    assertion, keeps the suite from failing for reasons that have nothing to do
    with the components under test.
  */
  await Promise.all([import('./routes/ProjectDetail'), import('./routes/Admin')]);
});

beforeEach(() => {
  vi.spyOn(api, 'getProjects').mockRejectedValue(new Error('offline'));
  vi.spyOn(api, 'getAwards').mockRejectedValue(new Error('offline'));
  vi.spyOn(api, 'getProject').mockRejectedValue(new Error('offline'));
  vi.spyOn(api, 'getGitHubStats').mockRejectedValue(new Error('offline'));
  vi.spyOn(api, 'getCurrentAdmin').mockRejectedValue(new Error('offline'));
  // Keep the expected console.warn from useResource out of the test output.
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

describe('App', () => {
  it('renders the home page with content even when the API is down', async () => {
    renderAt('/');

    expect(screen.getByRole('heading', { level: 1, name: 'Bryan Chua' })).toBeInTheDocument();
    // Both featured projects come from the bundled fallback.
    expect(await screen.findByText('D.I.A.L.')).toBeInTheDocument();
    expect(screen.getByText('SaveNow')).toBeInTheDocument();
  });

  it('lists every project and filters by technology', async () => {
    const user = userEvent.setup();
    renderAt('/projects');

    expect(await screen.findByText('Shift Patrol Generator')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Java' }));

    expect(screen.getByText('SaveNow')).toBeInTheDocument();
    expect(screen.queryByText('D.I.A.L.')).not.toBeInTheDocument();
  });

  it('renders a project case study from the fallback', async () => {
    renderAt('/projects/savenow');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'SaveNow' }),
    ).toBeInTheDocument();
  });

  it('shows a 404 page for an unknown route', async () => {
    renderAt('/homepage/index.html');

    // The old site's links pointed here; they must land somewhere sensible.
    expect(await screen.findByText('404')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back home/i })).toBeInTheDocument();
  });

  it('shows a 404 for a project slug that does not exist', async () => {
    renderAt('/projects/not-a-real-project');
    expect(await screen.findByText('404')).toBeInTheDocument();
  });

  it('falls back to the login form when the admin session check fails', async () => {
    renderAt('/admin');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  it.each([
    ['/', 'Bryan Chua'],
    ['/projects', 'Projects'],
    ['/projects/savenow', 'SaveNow'],
    ['/about', 'A bit about me'],
    ['/credentials', 'Credentials'],
    ['/contact', 'Get in touch'],
    ['/nope', "This page doesn't exist"],
  ])('gives %s exactly one h1', async (path, heading) => {
    // Every page needs one and only one h1 — screen readers use it to announce
    // what the page is, and search engines treat it as the page title. Four
    // pages previously had none, because their top heading was a section h2.
    renderAt(path);

    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('exposes a skip link as the first tab stop', async () => {
    const user = userEvent.setup();
    renderAt('/');

    await user.tab();
    expect(screen.getByRole('link', { name: /skip to content/i })).toHaveFocus();
  });
});
