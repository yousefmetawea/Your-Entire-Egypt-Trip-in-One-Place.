import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors/ApiError.js';
import { AUTH_COOKIE_NAME } from '../utils/cookies.js';
import { verifyToken, type TokenPayload } from '../utils/jwt.js';

// Augment Express Request type with authenticated user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  // 1. Check httpOnly cookie first
  let token = req.cookies?.[AUTH_COOKIE_NAME];

  // 2. Allow Authorization header fallback for API clients/testing
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.slice(7);
  }

  if (!token) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired authentication session'));
  }
}

export function requireRole(allowedRoles: Array<'traveler' | 'admin'>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to access this resource'));
    }

    next();
  };
}
