import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateRequest } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validation/auth.validation.js';
import { requireAuth } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

export const authRouter = Router();

authRouter.post(
  '/register',
  authRateLimiter,
  validateRequest({ body: registerSchema }),
  AuthController.register,
);

authRouter.post(
  '/login',
  authRateLimiter,
  validateRequest({ body: loginSchema }),
  AuthController.login,
);

authRouter.get('/me', requireAuth, AuthController.me);

authRouter.post('/logout', requireAuth, AuthController.logout);
