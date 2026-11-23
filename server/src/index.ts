import type { Server } from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

let server: Server | null = null;

async function startServer(): Promise<void> {
  try {
    // 1. Establish database connection before accepting traffic
    await connectDatabase();

    // 2. Start HTTP listener
    server = app.listen(env.port, () => {
      console.log(
        `[Server] Discover Cairo API running on http://localhost:${env.port} (${env.nodeEnv})`,
      );
      console.log(`[Server] CORS whitelisted client origin: ${env.clientOrigin}`);
    });
  } catch (error) {
    console.error('[Server] Fatal startup error:', error);
    process.exit(1);
  }
}

// Graceful shutdown handling
async function handleShutdown(signal: string): Promise<void> {
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      console.log('[Server] HTTP server closed');
      try {
        await disconnectDatabase();
        console.log('[Server] Clean shutdown complete');
        process.exit(0);
      } catch (err) {
        console.error('[Server] Error during disconnect:', err);
        process.exit(1);
      }
    });

    // Force close after 10 seconds if hanging connections persist
    setTimeout(() => {
      console.error('[Server] Graceful shutdown timed out. Forcing exit.');
      process.exit(1);
    }, 10000).unref();
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => void handleShutdown('SIGTERM'));
process.on('SIGINT', () => void handleShutdown('SIGINT'));

void startServer();
