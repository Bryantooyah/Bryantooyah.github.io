import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { Project } from '@portfolio/shared';
import { ProfilePhoto } from './ProfilePhoto';
import { ProjectCard } from './ProjectCard';
import { PROFILE } from '@/data/profile';

/**
 * A missing image is not hypothetical here: the SPA catch-all rewrite returns
 * index.html for any path not on disk, so a screenshot that has not been added
 * yet arrives as HTML with a 200. The browser fails to decode it and fires
 * `error` on the img — which is exactly what these fallbacks hang off.
 */

const project: Project = {
  id: 1,
  slug: 'example',
  title: 'Example Project',
  summary: 'A summary.',
  description: null,
  tech: ['TypeScript'],
  repoUrl: null,
  liveUrl: null,
  imageUrl: '/images/does-not-exist.webp',
  year: 2026,
  featured: false,
  sortOrder: 1,
};

describe('image fallbacks', () => {
  it('ProjectCard swaps a failed screenshot for a placeholder', () => {
    render(
      <MemoryRouter>
        <ProjectCard project={project} />
      </MemoryRouter>,
    );

    const img = document.querySelector('img');
    expect(img).not.toBeNull();

    fireEvent.error(img!);

    // The broken image is gone, replaced by the monogram placeholder. "TypeScript"
    // now appears twice: once as the placeholder glyph, once as the tech badge.
    expect(document.querySelector('img')).toBeNull();
    expect(screen.getAllByText('TypeScript')).toHaveLength(2);
  });

  it('ProfilePhoto swaps a failed portrait for a monogram', () => {
    render(<ProfilePhoto photo={PROFILE.heroPhoto} />);

    const img = document.querySelector('img');
    expect(img).not.toBeNull();

    fireEvent.error(img!);

    expect(document.querySelector('img')).toBeNull();
    expect(screen.getByText('BC')).toBeInTheDocument();
  });

  it('ProjectCard renders a placeholder when there is no image at all', () => {
    render(
      <MemoryRouter>
        <ProjectCard project={{ ...project, imageUrl: null }} />
      </MemoryRouter>,
    );

    expect(document.querySelector('img')).toBeNull();
  });
});
