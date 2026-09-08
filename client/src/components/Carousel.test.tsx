import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Carousel } from './Carousel';

const items = [
  { id: 1, name: 'First' },
  { id: 2, name: 'Second' },
  { id: 3, name: 'Third' },
];

function renderCarousel() {
  return render(
    <Carousel
      label="Projects"
      items={items}
      keyOf={(item) => item.id}
      renderItem={(item) => <p>{item.name}</p>}
    />,
  );
}

beforeEach(() => {
  // happy-dom has no layout engine, so scrolling is a no-op it does not
  // implement. Stub it so the click handlers can be asserted on.
  Element.prototype.scrollTo = vi.fn();
});

describe('Carousel', () => {
  it('renders every slide, so nothing is hidden from search engines or find-in-page', () => {
    renderCarousel();
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });

  it('disables Previous on the first slide', () => {
    renderCarousel();
    expect(screen.getByRole('button', { name: /previous project/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next project/i })).toBeEnabled();
  });

  it('scrolls when Next is clicked', async () => {
    const user = userEvent.setup();
    renderCarousel();

    await user.click(screen.getByRole('button', { name: /next project/i }));

    expect(Element.prototype.scrollTo).toHaveBeenCalled();
  });

  it('offers a dot per slide', () => {
    renderCarousel();
    expect(screen.getByRole('button', { name: 'Go to project 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to project 3' })).toBeInTheDocument();
  });

  it('can be driven from the keyboard', async () => {
    const user = userEvent.setup();
    renderCarousel();

    await user.tab();
    await user.keyboard('{ArrowRight}');

    // A horizontally scrolling region reachable only by mouse would be
    // unusable for keyboard users.
    expect(Element.prototype.scrollTo).toHaveBeenCalled();
  });

  it('renders nothing when there are no items', () => {
    const { container } = render(
      <Carousel label="Projects" items={[]} keyOf={() => 'x'} renderItem={() => null} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('reports position as "n of total"', () => {
    renderCarousel();
    expect(screen.getByText(/1 \/ 3/)).toBeInTheDocument();
  });
});
