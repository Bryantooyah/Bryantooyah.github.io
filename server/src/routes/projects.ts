import { Router } from 'express';
import { query } from '../db/pool.js';
import { toProject, type ProjectRow } from '../db/mappers.js';
import { HttpError } from '../lib/http.js';

export const projectsRouter: Router = Router();

const DETAIL_COLUMNS = `id, slug, title, summary, description, tech, repo_url,
                        live_url, image_url, year, featured, sort_order`;

// Description is the long-form case study and can run to several KB. The list
// view never renders it, so the list query returns NULL in its place.
const LIST_COLUMNS = `id, slug, title, summary, NULL::text AS description, tech,
                      repo_url, live_url, image_url, year, featured, sort_order`;

projectsRouter.get('/', async (_req, res) => {
  const { rows } = await query<ProjectRow>(
    `SELECT ${LIST_COLUMNS}
     FROM projects
     ORDER BY featured DESC, sort_order ASC, id ASC`,
  );
  res.json(rows.map(toProject));
});

projectsRouter.get('/:slug', async (req, res) => {
  const { rows } = await query<ProjectRow>(
    `SELECT ${DETAIL_COLUMNS} FROM projects WHERE slug = $1`,
    [req.params.slug],
  );

  const row = rows[0];
  if (!row) throw HttpError.notFound('Project not found');

  res.json(toProject(row));
});
