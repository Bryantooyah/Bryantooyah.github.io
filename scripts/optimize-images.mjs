/**
 * Converts the source images in /images to sized WebP under client/public.
 *
 * The originals are kept as the archive; this script produces what ships. Run
 * it with `npm run images` after adding or replacing anything in /images.
 *
 * Nothing is upscaled — `withoutEnlargement` leaves a small source at its own size rather
 * than producing a blurry stretch.
 */
import { mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const source = path.join(root, 'images');
const outDir = path.join(root, 'client', 'public', 'images');

/**
 * Source file → published name, with the target box.
 *
 * A missing source is skipped with a warning rather than failing the run, so
 * you can drop images in one at a time. The site handles an absent image
 * gracefully: ProjectCard falls back to a placeholder.
 */
const JOBS = [
  // --- Photos of Bryan ---
  // Home hero: the Kyoto photo. Source is only 341x498, so `withoutEnlargement`
  // publishes it at native size rather than upscaling it into softness.
  { from: 'hero.jpg', to: 'hero.webp', width: 640, height: 940, fit: 'cover' },
  // About: the Miyajima photo, already near-square at 3021x3046.
  { from: 'profile.jpg', to: 'profile.webp', width: 900, height: 900, fit: 'cover' },

  // --- Project artwork ---
  // `inside` everywhere, never `cover`. These are screenshots and posters with
  // text in them, and their aspect ratios vary a lot (the SaveNow poster is
  // portrait at 0.71, the D.I.A.L. screenshot landscape at 1.65). Cropping them
  // to a uniform 16:9 would slice the middle out of the poster. The card
  // letterboxes them with object-contain instead, so nothing is cut off.
  { from: 'Dial.png', to: 'project-dial.webp', width: 1280, height: 1280, fit: 'inside' },
  { from: 'savenow.jpg', to: 'project-savenow.webp', width: 1280, height: 1280, fit: 'inside' },
  { from: 'project1.png', to: 'project-shift-patrol.webp', width: 1280, height: 1280, fit: 'inside' },
  { from: 'portfolio.png', to: 'project-portfolio.webp', width: 1280, height: 1280, fit: 'inside' },
  { from: 'todo-task-list.png', to: 'project-todo.webp', width: 1280, height: 1280, fit: 'inside' },
  { from: 'project-hdb-ml.png', to: 'project-hdb-ml.webp', width: 1280, height: 1280, fit: 'inside' },

  /*
    --- Organisation logos ---
    Shown small (44px) beside a role or credential, so 256px is ample. `inside`
    keeps each logo's own proportions; the component centres it on a white plate,
    because most official logos ship with a transparent or white background and
    would vanish against the dark theme.

    No extension below on purpose — the resolver takes .png, .jpg, .webp or .svg,
    so save each file however it comes.
  */
  { from: 'logo-cpf', to: 'logo-cpf.webp', width: 256, height: 256, fit: 'inside' },
  { from: 'logo-spf', to: 'logo-spf.webp', width: 256, height: 256, fit: 'inside' },
  { from: 'logo-sutd', to: 'logo-sutd.webp', width: 256, height: 256, fit: 'inside' },
  { from: 'logo-dsta', to: 'logo-dsta.webp', width: 256, height: 256, fit: 'inside' },
  { from: 'logo-naisc', to: 'logo-naisc.webp', width: 256, height: 256, fit: 'inside' },
  { from: 'logo-harvard', to: 'logo-harvard.webp', width: 256, height: 256, fit: 'inside' },
  { from: 'logo-jlpt', to: 'logo-jlpt.webp', width: 256, height: 256, fit: 'inside' },
  { from: 'logo-dell', to: 'logo-dell.webp', width: 256, height: 256, fit: 'inside' },
  { from: 'logo-docker', to: 'logo-docker.webp', width: 256, height: 256, fit: 'inside' },
];

/** Extensions tried when a job names a file without one. */
const EXTENSIONS = ['.png', '.svg', '.jpg', '.jpeg', '.webp'];

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

/** Resolves a job's source path, trying known extensions when none is given. */
async function resolveSource(from) {
  if (path.extname(from) !== '') {
    const file = path.join(source, from);
    return (await exists(file)) ? file : null;
  }
  for (const ext of EXTENSIONS) {
    const file = path.join(source, from + ext);
    if (await exists(file)) return file;
  }
  return null;
}

async function convert() {
  await mkdir(outDir, { recursive: true });

  let before = 0;
  let after = 0;

  for (const job of JOBS) {
    const input = await resolveSource(job.from);
    if (input === null) {
      console.warn(`skip  ${job.from} (not found)`);
      continue;
    }

    const output = path.join(outDir, job.to);
    await sharp(input)
      .resize(job.width, job.height, { fit: job.fit, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(output);

    const inSize = (await stat(input)).size;
    const outSize = (await stat(output)).size;
    before += inSize;
    after += outSize;

    const saved = ((1 - outSize / inSize) * 100).toFixed(0);
    console.log(
      `${job.from.padEnd(16)} → ${job.to.padEnd(28)} ${(inSize / 1024).toFixed(0).padStart(5)} KB → ${(outSize / 1024).toFixed(0).padStart(4)} KB  (-${saved}%)`,
    );
  }

  if (before > 0) {
    console.log(
      `\nTotal: ${(before / 1024).toFixed(0)} KB → ${(after / 1024).toFixed(0)} KB ` +
        `(-${((1 - after / before) * 100).toFixed(0)}%)`,
    );
  }
}

await convert();
