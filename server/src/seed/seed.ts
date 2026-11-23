import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ts from 'typescript';
import mongoose from 'mongoose';
import argon2 from 'argon2';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { env } from '../config/env.js';
import {
  UserModel,
  PlaceModel,
  AccommodationModel,
  TransportOptionModel,
  ReadyMadeTripModel,
} from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to load and transpile TypeScript seed files cleanly without importing them across rootDir boundaries
// This avoids duplicating source seed data while maintaining perfect TS project boundary separation.
async function readClientSeed<T>(filename: string, exportVar: string): Promise<T[]> {
  const filePath = path.resolve(__dirname, '../../../client/src/services/mock/seed', filename);
  const rawTs = await fs.readFile(filePath, 'utf-8');

  // Transpile TypeScript to plain JavaScript on the fly
  const transpiled = ts.transpileModule(rawTs, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });

  // Evaluate CommonJS module export in isolated execution sandbox
  const exportsObj: Record<string, unknown> = {};
  const fn = new Function('exports', transpiled.outputText);
  fn(exportsObj);

  const data = exportsObj[exportVar] as T[];
  if (!Array.isArray(data)) {
    throw new Error(`Failed to read seed array "${exportVar}" from ${filename}`);
  }
  return data;
}

export interface SeedOptions {
  reset?: boolean;
  createTestUser?: boolean;
}

export interface SeedResult {
  placesUpserted: number;
  accommodationUpserted: number;
  transportUpserted: number;
  readyMadeTripsUpserted: number;
  testUserCreated: boolean;
}

export async function runSeed(options: SeedOptions = {}): Promise<SeedResult> {
  const { reset = false, createTestUser = true } = options;

  // Safety constraint: Never allow reset in production environment (no overrides or exceptions)
  if (reset && env.nodeEnv === 'production') {
    throw new Error(
      'Fatal Security Constraint: Database reset is strictly prohibited in production environment.',
    );
  }

  // Connect only if not already connected
  if (mongoose.connection.readyState === 0) {
    await connectDatabase();
  }

  const [seedPlaces, seedAccommodation, seedTransport, seedReadyMadeTrips] = await Promise.all([
    readClientSeed<Record<string, unknown>>('places.ts', 'seedPlaces'),
    readClientSeed<Record<string, unknown>>('accommodation.ts', 'seedAccommodation'),
    readClientSeed<Record<string, unknown>>('transport.ts', 'seedTransport'),
    readClientSeed<Record<string, unknown>>('readyMadeTrips.ts', 'seedReadyMadeTrips'),
  ]);

  if (reset) {
    console.log('[Seed] Resetting existing catalog collections...');
    await Promise.all([
      PlaceModel.deleteMany({}),
      AccommodationModel.deleteMany({}),
      TransportOptionModel.deleteMany({}),
      ReadyMadeTripModel.deleteMany({}),
    ]);
  }

  console.log('[Seed] Upserting catalog items (idempotent)...');

  // 1. Places (Upsert by stable id)
  const placeOps = seedPlaces.map((place) =>
    PlaceModel.findOneAndUpdate({ id: place.id as string }, place, {
      upsert: true,
      returnDocument: 'after',
      setDefaultsOnInsert: true,
    }),
  );
  await Promise.all(placeOps);

  // 2. Accommodation (Upsert by stable id)
  const accommodationOps = seedAccommodation.map((item) =>
    AccommodationModel.findOneAndUpdate({ id: item.id as string }, item, {
      upsert: true,
      returnDocument: 'after',
      setDefaultsOnInsert: true,
    }),
  );
  await Promise.all(accommodationOps);

  // 3. Transport Options (Upsert by stable id)
  const transportOps = seedTransport.map((item) =>
    TransportOptionModel.findOneAndUpdate({ id: item.id as string }, item, {
      upsert: true,
      returnDocument: 'after',
      setDefaultsOnInsert: true,
    }),
  );
  await Promise.all(transportOps);

  // 4. Ready Made Trips (Upsert by stable id)
  const readyMadeTripOps = seedReadyMadeTrips.map((item) =>
    ReadyMadeTripModel.findOneAndUpdate({ id: item.id as string }, item, {
      upsert: true,
      returnDocument: 'after',
      setDefaultsOnInsert: true,
    }),
  );
  await Promise.all(readyMadeTripOps);

  // 5. Dev Test User (only in non-production)
  let testUserCreated = false;
  if (createTestUser && env.nodeEnv !== 'production') {
    const existingUser = await UserModel.findOne({ email: 'alex@example.com' });
    if (!existingUser) {
      const passwordHash = await argon2.hash('CairoAlex2026!');
      await UserModel.create({
        id: 'user_alex_default',
        name: 'Alex Traveler',
        email: 'alex@example.com',
        passwordHash,
        role: 'traveler',
      });
      testUserCreated = true;
      console.log('[Seed] Created default dev test user: alex@example.com');
    }
  }

  const result: SeedResult = {
    placesUpserted: seedPlaces.length,
    accommodationUpserted: seedAccommodation.length,
    transportUpserted: seedTransport.length,
    readyMadeTripsUpserted: seedReadyMadeTrips.length,
    testUserCreated,
  };

  console.log('[Seed] Seeding completed successfully:', result);
  return result;
}

// Standalone execution via CLI
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  const shouldReset = process.argv.includes('--reset');
  runSeed({ reset: shouldReset })
    .then(async () => {
      await disconnectDatabase();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('[Seed] Error during seeding:', error);
      await disconnectDatabase();
      process.exit(1);
    });
}
