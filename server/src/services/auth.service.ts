import crypto from 'crypto';
import argon2 from 'argon2';
import { UserModel, type IUser } from '../models/User.js';
import { ApiError } from '../errors/ApiError.js';
import { generateToken, type TokenPayload } from '../utils/jwt.js';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'traveler' | 'admin';
    createdAt: string;
  };
  token: string;
}

export class AuthService {
  static async register(input: RegisterInput): Promise<AuthResult> {
    const normalizedEmail = input.email.trim().toLowerCase();

    // 1. Prevent duplicate email registrations
    const existing = await UserModel.findOne({ email: normalizedEmail });
    if (existing) {
      throw ApiError.conflict('An account with this email address already exists');
    }

    // 2. Hash password securely using Argon2
    const passwordHash = await argon2.hash(input.password);

    // 3. Create user record
    const userId = `user_${crypto.randomUUID()}`;
    const userDoc = await UserModel.create({
      id: userId,
      name: input.name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'traveler',
    });

    const tokenPayload: TokenPayload = {
      userId: userDoc.id,
      email: userDoc.email,
      role: userDoc.role,
    };
    const token = generateToken(tokenPayload);

    return {
      user: {
        id: userDoc.id,
        name: userDoc.name,
        email: userDoc.email,
        role: userDoc.role,
        createdAt: userDoc.createdAt,
      },
      token,
    };
  }

  static async login(input: LoginInput): Promise<AuthResult> {
    const normalizedEmail = input.email.trim().toLowerCase();

    // Generic error message to prevent user enumeration
    const invalidCredentialsError = ApiError.unauthorized('Invalid email or password');

    const userDoc = await UserModel.findOne({ email: normalizedEmail });
    if (!userDoc) {
      // Execute dummy verify to protect against timing attacks
      await argon2
        .verify(
          '$argon2id$v=19$m=65536,t=3,p=4$dummyhashdummyhashdummy$dummyhashdummyhashdummy',
          input.password,
        )
        .catch(() => false);
      throw invalidCredentialsError;
    }

    const isMatch = await argon2.verify(userDoc.passwordHash, input.password);
    if (!isMatch) {
      throw invalidCredentialsError;
    }

    const tokenPayload: TokenPayload = {
      userId: userDoc.id,
      email: userDoc.email,
      role: userDoc.role,
    };
    const token = generateToken(tokenPayload);

    return {
      user: {
        id: userDoc.id,
        name: userDoc.name,
        email: userDoc.email,
        role: userDoc.role,
        createdAt: userDoc.createdAt,
      },
      token,
    };
  }

  static async getCurrentUser(userId: string): Promise<IUser> {
    const user = await UserModel.findOne({ id: userId });
    if (!user) {
      throw ApiError.unauthorized('User session no longer exists');
    }
    return user;
  }
}
