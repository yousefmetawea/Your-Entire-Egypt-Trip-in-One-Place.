import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import {
  UserModel,
  PlaceModel,
  AccommodationModel,
  TransportOptionModel,
  TripModel,
  BookingRequestModel,
  ReadyMadeTripModel,
} from '../models/index.js';
import { runSeed } from './seed.js';

let mongod: MongoMemoryServer;

describe('Database Models & Idempotent Seed Runner', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create({
      binary: {
        systemBinary:
          process.env.MONGOMS_SYSTEM_BINARY ||
          '/home/yousef/Your-Entire-Egypt-Trip-in-One-Place/node_modules/.cache/mongodb-memory-server/mongod-x64-fedora-8.2.6',
      },
    });
    const uri = mongod.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('runs seed script and populates catalog collections and dev test user', async () => {
    const result = await runSeed({ reset: true, createTestUser: true });

    expect(result.placesUpserted).toBe(26);
    expect(result.accommodationUpserted).toBe(12);
    expect(result.transportUpserted).toBe(4);
    expect(result.readyMadeTripsUpserted).toBe(3);
    expect(result.testUserCreated).toBe(true);

    const placeCount = await PlaceModel.countDocuments();
    expect(placeCount).toBe(26);

    const stayCount = await AccommodationModel.countDocuments();
    expect(stayCount).toBe(12);

    const transportCount = await TransportOptionModel.countDocuments();
    expect(transportCount).toBe(4);

    const readyMadeCount = await ReadyMadeTripModel.countDocuments();
    expect(readyMadeCount).toBe(3);

    const testUser = await UserModel.findOne({ email: 'alex@example.com' });
    expect(testUser).not.toBeNull();
    expect(testUser?.name).toBe('Alex Traveler');
    // Ensure toJSON transformation drops passwordHash and exposes string id
    const userJson = testUser?.toJSON();
    expect(userJson?.passwordHash).toBeUndefined();
    expect(userJson?.id).toBe('user_alex_default');
    expect(userJson?._id).toBeUndefined();
  });

  it('is completely idempotent when run a second time (no duplicates)', async () => {
    const secondResult = await runSeed({ reset: false, createTestUser: true });

    expect(secondResult.placesUpserted).toBe(26);
    expect(secondResult.accommodationUpserted).toBe(12);
    expect(secondResult.transportUpserted).toBe(4);
    expect(secondResult.readyMadeTripsUpserted).toBe(3);
    expect(secondResult.testUserCreated).toBe(false); // already existed

    const placeCount = await PlaceModel.countDocuments();
    expect(placeCount).toBe(26);

    const stayCount = await AccommodationModel.countDocuments();
    expect(stayCount).toBe(12);

    const transportCount = await TransportOptionModel.countDocuments();
    expect(transportCount).toBe(4);

    const readyMadeCount = await ReadyMadeTripModel.countDocuments();
    expect(readyMadeCount).toBe(3);

    const userCount = await UserModel.countDocuments({ email: 'alex@example.com' });
    expect(userCount).toBe(1);
  });

  it('strictly refuses destructive reset operations when NODE_ENV is production', async () => {
    const originalEnv = env.nodeEnv;
    try {
      (env as { nodeEnv: string }).nodeEnv = 'production';
      await expect(runSeed({ reset: true })).rejects.toThrow(
        /Database reset is strictly prohibited in production/i,
      );
    } finally {
      (env as { nodeEnv: string }).nodeEnv = originalEnv;
    }
  });

  it('validates Place model slug uniqueness and transforms _id to id', async () => {
    const place = await PlaceModel.findOne({ id: 'place_pyramids_of_giza' });
    expect(place).not.toBeNull();
    expect(place?.slug).toBe('pyramids-of-giza');
    expect(place?.area).toBe('giza');

    const json = place?.toJSON();
    expect(json?.id).toBe('place_pyramids_of_giza');
    expect(json?._id).toBeUndefined();
    expect(json?.__v).toBeUndefined();
  });

  it('correctly saves and embeds Trip days, activities, and versioning', async () => {
    const trip = await TripModel.create({
      id: 'trip_test_001',
      userId: 'user_alex_default',
      title: 'Alex Cairo Tour',
      startDate: '2026-12-01',
      endDate: '2026-12-03',
      travelers: 2,
      budget: { amount: 15000, currency: 'EGP' },
      budgetTier: 'balanced',
      interests: ['history', 'culture'],
      preferences: { accommodationType: 'hotel', transportType: 'transfer' },
      status: 'upcoming',
      days: [
        {
          id: 'day_1',
          date: '2026-12-01',
          activities: [
            {
              id: 'act_1',
              source: { type: 'place', placeId: 'place_pyramids_of_giza' },
              startTime: '09:00',
              durationMin: 210,
              travelMin: null,
              estimatedCost: {
                amount: 700,
                currency: 'EGP',
                isEstimated: false,
                priceUpdatedAt: '2026-06-01',
              },
              order: 0,
            },
          ],
        },
      ],
      accommodationId: 'stay_grand_citadel_retreat',
      savedPlaceIds: ['place_grand_egyptian_museum'],
      version: 1,
    });

    expect(trip.id).toBe('trip_test_001');
    expect(trip.days.length).toBe(1);
    expect(trip.days[0].activities.length).toBe(1);
    expect(trip.days[0].activities[0].source.type).toBe('place');

    const tripJson = trip.toJSON();
    expect(tripJson.id).toBe('trip_test_001');
    expect(tripJson._id).toBeUndefined();
    expect(tripJson.version).toBe(1);
  });

  it('correctly saves BookingRequest with embedded statusHistory', async () => {
    const booking = await BookingRequestModel.create({
      id: 'booking_req_001',
      userId: 'user_alex_default',
      tripId: 'trip_test_001',
      kind: 'airport-transfer',
      details: {
        pickupLocation: 'Cairo International Airport (CAI)',
        dropoffLocation: 'The Grand Citadel Retreat',
        date: '2026-12-01',
        time: '14:30',
        passengers: 2,
        flightNumber: 'MS777',
      },
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          changedAt: '2026-11-23T10:00:00.000Z',
          note: 'Transfer request submitted',
        },
      ],
    });

    expect(booking.id).toBe('booking_req_001');
    expect(booking.status).toBe('pending');
    expect(booking.statusHistory.length).toBe(1);

    const bookingJson = booking.toJSON();
    expect(bookingJson.id).toBe('booking_req_001');
    expect(bookingJson._id).toBeUndefined();
  });
});
