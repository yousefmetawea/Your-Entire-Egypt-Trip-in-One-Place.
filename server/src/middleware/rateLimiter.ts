import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { ApiError } from '../errors/ApiError.js';

export const globalRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(ApiError.rateLimited());
  },
  skip: () => env.nodeEnv === 'test',
});

export const authRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(ApiError.rateLimited('Too many authentication attempts. Please try again later.'));
  },
  skip: () => env.nodeEnv === 'test',
});
