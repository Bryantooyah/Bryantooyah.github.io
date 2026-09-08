import { z } from 'zod';

/**
 * Request validators. Every route parses its body through one of these before
 * touching the database — the boundary where untrusted input stops.
 */

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Please tell me your name').max(100),
  email: z.email('That does not look like a valid email').max(200),
  phone: z.string().trim().max(40).optional(),
  subject: z.string().trim().min(1, 'Please add a subject').max(200),
  message: z
    .string()
    .trim()
    .min(10, 'Please write at least 10 characters')
    .max(5000, 'Please keep it under 5000 characters'),
  /**
   * Honeypot. The form renders this field visually hidden and off the tab
   * order, so a human never fills it in; automated scrapers fill every input
   * they find. Checked in the route, not here, so bots get a normal-looking
   * success rather than a validation error that tells them how to adapt.
   */
  website: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, 'Password is required'),
});

/*
  Field definitions are kept free of `.default()` so they can back two schemas
  with different semantics:

  - the create schema layers defaults on top, so POST can omit optional fields;
  - the patch schema is a plain `.partial()` of these, so an omitted field stays
    `undefined` and the UPDATE leaves that column alone.

  Applying `.partial()` to a schema that already carries defaults does NOT do
  this — Zod still substitutes the default for a missing key, so every PATCH
  would silently overwrite unmentioned columns with empty values.
*/
const projectFields = {
  slug: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase words separated by hyphens'),
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().min(1).max(500),
  description: z.string().max(50_000).nullable(),
  tech: z.array(z.string().trim().min(1).max(50)).max(20),
  repoUrl: z.url().max(500).nullable(),
  liveUrl: z.url().max(500).nullable(),
  imageUrl: z.string().trim().max(500).nullable(),
  year: z.coerce.number().int().min(1990).max(2100).nullable(),
  featured: z.boolean(),
  sortOrder: z.coerce.number().int(),
};

const awardFields = {
  title: z.string().trim().min(1).max(200),
  issuer: z.string().trim().min(1).max(200),
  year: z.coerce.number().int().min(1990).max(2100),
  description: z.string().max(2000).nullable(),
  imageUrl: z.string().trim().max(500).nullable(),
  sortOrder: z.coerce.number().int(),
};

export const projectSchema = z.object({
  ...projectFields,
  description: projectFields.description.default(null),
  tech: projectFields.tech.default([]),
  repoUrl: projectFields.repoUrl.default(null),
  liveUrl: projectFields.liveUrl.default(null),
  imageUrl: projectFields.imageUrl.default(null),
  year: projectFields.year.default(null),
  featured: projectFields.featured.default(false),
  sortOrder: projectFields.sortOrder.default(0),
});

export const awardSchema = z.object({
  ...awardFields,
  description: awardFields.description.default(null),
  imageUrl: awardFields.imageUrl.default(null),
  sortOrder: awardFields.sortOrder.default(0),
});

/** PATCH accepts any subset of the create fields, with no defaults filled in. */
export const projectPatchSchema = z.object(projectFields).partial();
export const awardPatchSchema = z.object(awardFields).partial();

/** GitHub route params — guards against path traversal in the upstream URL. */
export const repoParamsSchema = z.object({
  owner: z.string().regex(/^[A-Za-z0-9-]{1,39}$/, 'Invalid owner'),
  repo: z.string().regex(/^[A-Za-z0-9._-]{1,100}$/, 'Invalid repository name'),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type AwardInput = z.infer<typeof awardSchema>;
