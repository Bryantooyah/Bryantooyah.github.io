import type { NextFunction, Request, Response } from 'express';
import { ZodError, z } from 'zod';
import type { ApiError } from '@portfolio/shared';
import { HttpError } from '../lib/http.js';
import { isProduction } from '../env.js';

/** 404 handler. Registered after all routes, before the error handler. */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Not found' } satisfies ApiError);
}

/**
 * Terminal error handler. Express 5 forwards rejected promises from async
 * handlers here automatically, so route code can throw freely.
 *
 * Must keep all four parameters — Express identifies error middleware by arity.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: z.flattenError(err).fieldErrors as Record<string, string[]>,
    } satisfies ApiError);
    return;
  }

  if (err instanceof HttpError) {
    const body: ApiError = { error: err.message };
    if (err.details) body.details = err.details;
    res.status(err.status).json(body);
    return;
  }

  // Anything reaching here is a genuine fault. Log it in full, tell the client
  // nothing — an unexpected error message can leak query text or file paths.
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: isProduction ? 'Internal server error' : String(err),
  } satisfies ApiError);
}
