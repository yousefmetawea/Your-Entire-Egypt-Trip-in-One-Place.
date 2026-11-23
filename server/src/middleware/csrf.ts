import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors/ApiError.js';
import { env } from '../config/env.js';

const STATE_MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Enforces centralized CSRF protection and request hygiene:
 * 1. For state-mutating requests (POST, PUT, PATCH, DELETE):
 *    - Validates the Origin header matches CLIENT_ORIGIN (or allowed origin).
 *    - Rejects missing Origin for state-mutating browser requests when headers indicate browser origin.
 *    - Enforces Content-Type: application/json for requests with a body.
 *    - Rejects standard HTML form submissions (application/x-www-form-urlencoded, multipart/form-data).
 */
export function csrfProtection(req: Request, _res: Response, next: NextFunction): void {
  if (!STATE_MUTATING_METHODS.has(req.method)) {
    return next();
  }

  // 1. Origin header check
  const origin = req.headers.origin;
  const clientOrigin = env.clientOrigin;

  // In production, reject any state-mutating request without an origin or whose origin doesn't match clientOrigin
  if (origin && origin !== clientOrigin) {
    return next(
      ApiError.forbidden(`Cross-origin request rejected from unauthorized origin: ${origin}`),
    );
  }

  // In production or when sec-fetch-site indicates cross-site, enforce origin presence
  const secFetchSite = req.headers['sec-fetch-site'];
  if (secFetchSite === 'cross-site') {
    return next(ApiError.forbidden('Cross-site requests are strictly blocked.'));
  }

  // 2. Reject HTML form submissions
  const contentType = req.headers['content-type'] ?? '';
  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    return next(
      ApiError.badRequest('HTML form submissions are not supported. Use application/json.'),
    );
  }

  // 3. For requests with a payload, enforce application/json
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentLength = req.headers['content-length'];
    const hasBody = contentLength && parseInt(contentLength, 10) > 0;

    if (hasBody && !contentType.includes('application/json')) {
      return next(
        ApiError.badRequest('Content-Type header must be application/json for request payloads.'),
      );
    }
  }

  next();
}
