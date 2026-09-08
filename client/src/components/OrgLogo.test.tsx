import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OrgLogo, initials } from './OrgLogo';

describe('initials', () => {
  it('uses an acronym the name already contains', () => {
    expect(initials('Defence Science and Technology Agency (DSTA)')).toBe('DSTA');
    expect(initials('AI Singapore')).toBe('AI');
  });

  it('otherwise takes the first letter of each significant word', () => {
    expect(initials('Singapore Police Force')).toBe('SPF');
    expect(initials('Harvard University')).toBe('HU');
    // "of" and "the" are skipped rather than counted.
    expect(initials('Board of the Central Fund')).toBe('BCF');
  });
});

describe('OrgLogo', () => {
  it('shows the monogram when no logo file is set', () => {
    render(<OrgLogo src={null} name="Singapore Police Force" />);
    expect(screen.getByText('SPF')).toBeInTheDocument();
  });

  it('renders the logo when one is provided', () => {
    const { container } = render(<OrgLogo src="/images/logo-spf.webp" name="Singapore Police Force" />);
    expect(container.querySelector('img')).toHaveAttribute('src', '/images/logo-spf.webp');
  });
});
