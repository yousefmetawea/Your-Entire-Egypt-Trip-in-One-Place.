import type { CookieOptions } from 'express';
import { env } from '../config/env.js';

export const AUTH_COOKIE_NAME = 'discover_cairo_token';

export function getAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
  };
}
