import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from './Icons';

interface CarouselProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  keyOf: (item: T) => string | number;
  /** Describes the set for screen readers, e.g. "Projects". */
  label: string;
}

/**
 * One-card-at-a-time slider with previous/next controls.
 *
 * Built on native CSS scroll-snap rather than a transform-based slider, which
 * buys a lot for free: real touch swiping with momentum on mobile, working
 * scrollbars, correct behaviour when a card's content changes height, and no
 * layout maths to get wrong. The buttons simply scroll the container.
 *
 * The scroll container is focusable and handles arrow keys, because a
 * horizontally scrolling region that can only be driven by mouse is unusable
 * from the keyboard.
 */
export function Carousel<T>({ items, renderItem, keyOf, label }: CarouselProps<T>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [height, setHeight] = useState<number | undefined>(undefined);

  const scrollToIndex = useCallback((target: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(target, track.children.length - 1));
    const child = track.children[clamped];
    if (child instanceof HTMLElement) {
      // scrollTo on the container rather than child.scrollIntoView(), which
      // would also scroll the page vertically to bring the card into view.
      track.scrollTo({ left: child.offsetLeft - track.offsetLeft, behavior: 'smooth' });
    }
  }, []);

  // Derive the active index from actual scroll position, so swiping, the
  // buttons and the dots can never disagree about where we are.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    function onScroll(): void {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!track) return;
        const width = track.clientWidth;
        setIndex(width === 0 ? 0 : Math.round(track.scrollLeft / width));
      });
    }

    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener('scroll', onScroll);
    };
  }, []);

  /*
    The track takes the height of the slide you are looking at, rather than the
    tallest one.

    A flex row is as tall as its tallest child, and stretched children fill it.
    With slides of genuinely different shapes — a wide screenshot against a tall
    poster — that forced every card to the tallest card's height, which showed up
    as a hole in the middle of the shorter ones. Slides are now top-aligned at
    their natural height and the track follows the active one.

    ResizeObserver rather than a one-off measurement because a card's height
    changes after its image loads.
  */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = (): void => {
      const child = track.children[index];
      if (child instanceof HTMLElement) setHeight(child.offsetHeight);
    };

    measure();
    const observer = new ResizeObserver(measure);
    for (const child of track.children) observer.observe(child);
    return () => {
      observer.disconnect();
    };
  }, [index, items]);

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollToIndex(index + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollToIndex(index - 1);
    }
  }

  if (items.length === 0) return null;

  const atStart = index <= 0;
  const atEnd = index >= items.length - 1;

  const arrowClass =
    'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-35';

  return (
    <section aria-roledescription="carousel" aria-label={label}>
      <div
        ref={trackRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        role="group"
        aria-label={`${label}, use arrow keys to browse`}
        style={height ? { height } : undefined}
        className="carousel-track flex snap-x snap-mandatory items-start overflow-x-auto overflow-y-hidden scroll-smooth rounded-xl transition-[height] duration-300"
      >
        {items.map((item, i) => (
          <div
            key={keyOf(item)}
            className="w-full shrink-0 snap-center px-0.5"
            aria-roledescription="slide"
            aria-label={`${String(i + 1)} of ${String(items.length)}`}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={arrowClass}
            onClick={() => {
              scrollToIndex(index - 1);
            }}
            disabled={atStart}
            aria-label={`Previous ${label.toLowerCase().replace(/s$/, '')}`}
          >
            <ArrowLeftIcon className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            className={arrowClass}
            onClick={() => {
              scrollToIndex(index + 1);
            }}
            disabled={atEnd}
            aria-label={`Next ${label.toLowerCase().replace(/s$/, '')}`}
          >
            <ArrowRightIcon className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {items.map((item, i) => (
            <button
              key={keyOf(item)}
              type="button"
              onClick={() => {
                scrollToIndex(i);
              }}
              aria-label={`Go to ${label.toLowerCase().replace(/s$/, '')} ${String(i + 1)}`}
              aria-current={i === index}
              className={[
                'h-2 rounded-full transition-all',
                i === index ? 'w-6 bg-accent' : 'w-2 bg-border hover:bg-muted',
              ].join(' ')}
            />
          ))}
        </div>

        <p className="font-mono text-xs text-muted tabular-nums">
          {index + 1} / {items.length}
        </p>
      </div>
    </section>
  );
}
