import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load server/.env regardless of current working directory
dotenv.config({ path: path.resolve(__dirname, '../../../server/.env') });

const envSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.coerce.number().int().positive().max(65535).default(4000),
  mongodbUri: z.string().min(1, 'MONGODB_URI is required'),
  jwtSecret: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  jwtExpiresIn: z.string().default('7d'),
  clientOrigin: z
    .string()
    .url('CLIENT_ORIGIN must be a valid URL')
    .default('http://localhost:5173'),
  enableDemoActions: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  rateLimitWindowMs: z.coerce.number().int().positive().default(900000), // 15 mins
  rateLimitMax: z.coerce.number().int().positive().default(100),
  authRateLimitMax: z.coerce.number().int().positive().default(5),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  // If in test mode and MONGODB_URI/JWT_SECRET are not set, provide test fallbacks
  const rawData = {
    nodeEnv: source.NODE_ENV ?? 'development',
    port: source.PORT,
    mongodbUri:
      source.MONGODB_URI ??
      (source.NODE_ENV === 'test' ? 'mongodb://localhost:27017/test' : undefined),
    jwtSecret:
      source.JWT_SECRET ??
      (source.NODE_ENV === 'test'
        ? 'test_secret_must_be_at_least_32_characters_long_for_unit_tests'
        : undefined),
    jwtExpiresIn: source.JWT_EXPIRES_IN,
    clientOrigin: source.CLIENT_ORIGIN,
    enableDemoActions: source.ENABLE_DEMO_ACTIONS,
    rateLimitWindowMs: source.RATE_LIMIT_WINDOW_MS,
    rateLimitMax: source.RATE_LIMIT_MAX,
    authRateLimitMax: source.AUTH_RATE_LIMIT_MAX,
  };

  const parsed = envSchema.safeParse(rawData);

  if (!parsed.success) {
    const errorDetails = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    console.error(
      `\n❌ Configuration Error: Invalid server environment variables:\n${errorDetails}\n`,
    );
    throw new Error('Invalid environment configuration');
  }

  // Safety constraint: enableDemoActions must never be active in production
  if (parsed.data.nodeEnv === 'production' && parsed.data.enableDemoActions) {
    throw new Error('Fatal Security Constraint: ENABLE_DEMO_ACTIONS cannot be true in production');
  }

  return parsed.data;
}

export const env = loadEnv();
