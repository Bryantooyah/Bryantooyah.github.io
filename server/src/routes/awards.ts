import { Router } from 'express';
import { query } from '../db/pool.js';
import { toAward, type AwardRow } from '../db/mappers.js';

export const awardsRouter: Router = Router();

awardsRouter.get('/', async (_req, res) => {
  const { rows } = await query<AwardRow>(
    `SELECT id, title, issuer, year, description, image_url, sort_order
     FROM awards
     ORDER BY sort_order ASC, year DESC, id ASC`,
  );
  res.json(rows.map(toAward));
});
