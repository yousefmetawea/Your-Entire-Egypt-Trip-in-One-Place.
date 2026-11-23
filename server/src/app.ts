import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { requestLogger } from './middleware/requestLogger.js';
import { csrfProtection } from './middleware/csrf.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();

// 1. Trust proxy in production if behind reverse proxy
if (env.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

// 2. Security headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: env.nodeEnv === 'production',
    crossOriginEmbedderPolicy: false,
  }),
);

// 3. Strict CORS configuration
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }),
);

// 4. Rate limiting (global)
app.use(globalRateLimiter);

// 5. Request logging
app.use(requestLogger);

// 6. Parsers (JSON payload max 1mb, cookies)
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// 7. CSRF and Origin protection on state-mutating methods
app.use(csrfProtection);

// 8. Health check endpoint (for uptime monitors & Phase 0 verification)
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// 9. Mount API routes
import { apiRouter } from './routes/index.js';
app.use('/api', apiRouter);

// Centralized error handling middleware
app.use(errorHandler);
