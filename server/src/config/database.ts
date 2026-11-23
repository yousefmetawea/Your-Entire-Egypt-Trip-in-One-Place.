import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export async function connectDatabase(): Promise<typeof mongoose> {
  if (isConnected) {
    return mongoose;
  }

  try {
    const connection = await mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: env.nodeEnv !== 'production',
    });

    isConnected = true;
    console.log(`[Database] Connected successfully to MongoDB: ${connection.connection.name}`);
    return connection;
  } catch (error) {
    console.error('[Database] Connection failed:', error instanceof Error ? error.message : error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) {
    return;
  }

  await mongoose.disconnect();
  isConnected = false;
  console.log('[Database] Disconnected from MongoDB');
}

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[Database] Lost connection to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database] Connection error:', err);
});
