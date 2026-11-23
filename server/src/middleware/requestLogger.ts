import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // Do not clutter test suites with request logs
  if (env.nodeEnv === 'test') {
    return next();
  }

  const startTime = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    // Log basic HTTP info without printing body, cookies, or secrets
    console.log(`[HTTP] ${method} ${originalUrl} ${statusCode} - ${duration}ms`);
  });

  next();
}
