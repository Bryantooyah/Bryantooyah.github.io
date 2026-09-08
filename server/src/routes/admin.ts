import { Router } from 'express';
import { query } from '../db/pool.js';
import {
  toAward,
  toContactMessage,
  toProject,
  type AwardRow,
  type ContactMessageRow,
  type ProjectRow,
} from '../db/mappers.js';
import {
  awardPatchSchema,
  awardSchema,
  projectPatchSchema,
  projectSchema,
} from '../schemas/index.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError } from '../lib/http.js';

export const adminRouter: Router = Router();

// Every route below this line requires a valid admin session. The client-side
// guard only decides what to render; this is what actually enforces access.
adminRouter.use(requireAuth);

function parseId(raw: string | undefined): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw HttpError.badRequest('Invalid id');
  return id;
}

/* ---------------------------------------------------------------- projects */

adminRouter.post('/projects', async (req, res) => {
  const input = projectSchema.parse(req.body);
  const { rows } = await query<ProjectRow>(
    `INSERT INTO projects (slug, title, summary, description, tech, repo_url,
                           live_url, image_url, year, featured, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING id, slug, title, summary, description, tech, repo_url, live_url,
               image_url, year, featured, sort_order`,
    [
      input.slug,
      input.title,
      input.summary,
      input.description,
      input.tech,
      input.repoUrl,
      input.liveUrl,
      input.imageUrl,
      input.year,
      input.featured,
      input.sortOrder,
    ],
  );
  res.status(201).json(toProject(rows[0]!));
});

adminRouter.patch('/projects/:id', async (req, res) => {
  const id = parseId(req.params.id);
  const input = projectPatchSchema.parse(req.body);

  // Build the SET clause from only the fields actually supplied, so a PATCH
  // never blanks out columns the caller did not mention.
  const columns: Record<string, unknown> = {
    slug: input.slug,
    title: input.title,
    summary: input.summary,
    description: input.description,
    tech: input.tech,
    repo_url: input.repoUrl,
    live_url: input.liveUrl,
    image_url: input.imageUrl,
    year: input.year,
    featured: input.featured,
    sort_order: input.sortOrder,
  };

  const entries = Object.entries(columns).filter(([, value]) => value !== undefined);
  if (entries.length === 0) throw HttpError.badRequest('No fields to update');

  // Column names come from the fixed map above, never from user input; only
  // the values are parameterised placeholders.
  const setClause = entries.map(([column], i) => `${column} = $${i + 2}`).join(', ');

  const { rows } = await query<ProjectRow>(
    `UPDATE projects SET ${setClause}, updated_at = NOW()
     WHERE id = $1
     RETURNING id, slug, title, summary, description, tech, repo_url, live_url,
               image_url, year, featured, sort_order`,
    [id, ...entries.map(([, value]) => value)],
  );

  const row = rows[0];
  if (!row) throw HttpError.notFound('Project not found');
  res.json(toProject(row));
});

adminRouter.delete('/projects/:id', async (req, res) => {
  const { rowCount } = await query('DELETE FROM projects WHERE id = $1', [parseId(req.params.id)]);
  if (rowCount === 0) throw HttpError.notFound('Project not found');
  res.status(204).end();
});

/* ------------------------------------------------------------------ awards */

adminRouter.post('/awards', async (req, res) => {
  const input = awardSchema.parse(req.body);
  const { rows } = await query<AwardRow>(
    `INSERT INTO awards (title, issuer, year, description, image_url, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id, title, issuer, year, description, image_url, sort_order`,
    [input.title, input.issuer, input.year, input.description, input.imageUrl, input.sortOrder],
  );
  res.status(201).json(toAward(rows[0]!));
});

adminRouter.patch('/awards/:id', async (req, res) => {
  const id = parseId(req.params.id);
  const input = awardPatchSchema.parse(req.body);

  const columns: Record<string, unknown> = {
    title: input.title,
    issuer: input.issuer,
    year: input.year,
    description: input.description,
    image_url: input.imageUrl,
    sort_order: input.sortOrder,
  };

  const entries = Object.entries(columns).filter(([, value]) => value !== undefined);
  if (entries.length === 0) throw HttpError.badRequest('No fields to update');

  const setClause = entries.map(([column], i) => `${column} = $${i + 2}`).join(', ');

  const { rows } = await query<AwardRow>(
    `UPDATE awards SET ${setClause}
     WHERE id = $1
     RETURNING id, title, issuer, year, description, image_url, sort_order`,
    [id, ...entries.map(([, value]) => value)],
  );

  const row = rows[0];
  if (!row) throw HttpError.notFound('Award not found');
  res.json(toAward(row));
});

adminRouter.delete('/awards/:id', async (req, res) => {
  const { rowCount } = await query('DELETE FROM awards WHERE id = $1', [parseId(req.params.id)]);
  if (rowCount === 0) throw HttpError.notFound('Award not found');
  res.status(204).end();
});

/* ---------------------------------------------------------------- messages */

adminRouter.get('/messages', async (_req, res) => {
  const { rows } = await query<ContactMessageRow>(
    `SELECT id, name, email, phone, subject, message, created_at, read_at
     FROM contact_messages
     ORDER BY created_at DESC
     LIMIT 200`,
  );
  res.json(rows.map(toContactMessage));
});

adminRouter.patch('/messages/:id/read', async (req, res) => {
  const { rows } = await query<ContactMessageRow>(
    `UPDATE contact_messages SET read_at = NOW()
     WHERE id = $1
     RETURNING id, name, email, phone, subject, message, created_at, read_at`,
    [parseId(req.params.id)],
  );
  const row = rows[0];
  if (!row) throw HttpError.notFound('Message not found');
  res.json(toContactMessage(row));
});

adminRouter.delete('/messages/:id', async (req, res) => {
  const { rowCount } = await query('DELETE FROM contact_messages WHERE id = $1', [
    parseId(req.params.id),
  ]);
  if (rowCount === 0) throw HttpError.notFound('Message not found');
  res.status(204).end();
});
