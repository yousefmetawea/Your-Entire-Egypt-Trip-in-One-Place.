import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors/ApiError.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // Handle standard JSON syntax errors or payload errors from express.json()
  if (err instanceof SyntaxError && 'status' in err && (err as { status: number }).status === 400) {
    res.status(400).json({
      error: {
        code: 'BAD_REQUEST',
        message: 'Malformed JSON payload',
      },
    });
    return;
  }

  // Unexpected runtime errors: hide internal stack in production
  const message =
    env.nodeEnv === 'production'
      ? 'An unexpected internal server error occurred.'
      : err instanceof Error
        ? err.message
        : 'Internal server error';

  if (env.nodeEnv !== 'test') {
    console.error('[Unhandled Server Error]:', err);
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message,
    },
  });
}
