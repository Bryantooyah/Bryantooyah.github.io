import { useState } from 'react';

export interface Photo {
  src: string;
  alt: string;
  /** Tailwind aspect utility matching the source file's real ratio. */
  aspect: string;
}

/**
 * A photo of Bryan, with a graceful fallback.
 *
 * If the file is missing or mistyped the browser would otherwise show a broken
 * image icon. This swaps in a monogram block of the same shape instead, so the
 * layout holds and nothing looks broken.
 *
 * The aspect ratio is reserved before the image loads, which is what stops the
 * page reflowing around it — the hero photo sits above the fold, where a late
 * layout shift is most obvious.
 */
export function ProfilePhoto({
  photo,
  className = '',
  priority = false,
}: {
  photo: Photo;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  const shape = `${photo.aspect} w-full rounded-2xl border border-border object-cover ${className}`;

  if (failed) {
    return (
      <div className={`${shape} flex items-center justify-center bg-accent-soft`}>
        <span className="font-mono text-5xl font-bold text-accent/50">BC</span>
      </div>
    );
  }

  return (
    <img
      src={photo.src}
      alt={photo.alt}
      // The hero portrait is above the fold, so it is the one image on the site
      // that must not be lazy-loaded.
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      onError={() => {
        setFailed(true);
      }}
      className={shape}
    />
  );
}
