import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from '../utils/cookies.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, token } = await AuthService.register(req.body);

      // Set httpOnly secure session cookie
      res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

      res.status(201).json({
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, token } = await AuthService.login(req.body);

      // Set httpOnly secure session cookie
      res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

      res.status(200).json({
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const user = await AuthService.getCurrentUser(userId);

      res.status(200).json({
        user: user.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(_req: Request, res: Response): Promise<void> {
    const cookieOptions = getAuthCookieOptions();
    res.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
    });

    res.status(200).json({
      message: 'Logged out successfully',
    });
  }
}
