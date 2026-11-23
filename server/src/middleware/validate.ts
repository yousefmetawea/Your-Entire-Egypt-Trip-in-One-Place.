import type { Request, Response, NextFunction } from 'express';
import { z, type ZodType } from 'zod';
import { ApiError } from '../errors/ApiError.js';

interface RequestValidationSchema {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

export function validateRequest(schemas: RequestValidationSchema) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        const parsedQuery = await schemas.query.parseAsync(req.query);
        // In Express 5, req.query has a getter. Assign parsed properties safely.
        for (const key of Object.keys(req.query)) {
          delete (req.query as Record<string, unknown>)[key];
        }
        Object.assign(req.query, parsedQuery);
      }
      if (schemas.params) {
        const parsedParams = await schemas.params.parseAsync(req.params);
        for (const key of Object.keys(req.params)) {
          delete (req.params as Record<string, unknown>)[key];
        }
        Object.assign(req.params, parsedParams);
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        next(ApiError.validation('Request validation failed', details));
      } else {
        next(error);
      }
    }
  };
}
