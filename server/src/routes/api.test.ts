import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app.js';
import { runSeed } from '../seed/seed.js';
import { TripModel } from '../models/Trip.js';
import { env } from '../config/env.js';

let mongod: MongoMemoryServer;
let userACookie: string[];
let userBCookie: string[];
let userATripId: string;
let userABookingId: string;

describe('Core APIs Integration & Resource Security Tests', () => {
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

    // Seed database with places, stays, transport
    await runSeed({ reset: true, createTestUser: false });

    // Register User A
    const resA = await request(app)
      .post('/api/auth/register')
      .set('Origin', 'http://localhost:5173')
      .set('Content-Type', 'application/json')
      .send({
        name: 'User Alpha',
        email: 'alpha@example.com',
        password: 'PasswordAlpha123!',
      });
    userACookie = resA.headers['set-cookie'] as unknown as string[];

    // Register User B
    const resB = await request(app)
      .post('/api/auth/register')
      .set('Origin', 'http://localhost:5173')
      .set('Content-Type', 'application/json')
      .send({
        name: 'User Beta',
        email: 'beta@example.com',
        password: 'PasswordBeta123!',
      });
    userBCookie = resB.headers['set-cookie'] as unknown as string[];
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  describe('Places & Catalog Endpoints (Public Reads)', () => {
    it('GET /api/places returns paginated places list with category & area filtering', async () => {
      const res = await request(app).get('/api/places?area=giza&category=history');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.places)).toBe(true);
      expect(res.body.places.length).toBeGreaterThanOrEqual(1);
      expect(res.body.places[0].area).toBe('giza');
      expect(res.body.places[0].category).toBe('history');
      expect(res.body.total).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/places/slug/:slug returns place detail by slug', async () => {
      const res = await request(app).get('/api/places/slug/pyramids-of-giza');
      expect(res.status).toBe(200);
      expect(res.body.place.slug).toBe('pyramids-of-giza');
      expect(res.body.place.id).toBe('place_pyramids_of_giza');
      expect(res.body.place._id).toBeUndefined();
    });

    it('GET /api/places/slug/:slug returns 404 for unknown slug', async () => {
      const res = await request(app).get('/api/places/slug/non-existent-place');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('GET /api/places/:id/nearby returns nearby places', async () => {
      const res = await request(app).get('/api/places/place_pyramids_of_giza/nearby?limit=3');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.places)).toBe(true);
    });

    it('GET /api/accommodation returns stays list and filters by type', async () => {
      const res = await request(app).get('/api/accommodation?type=hotel');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.accommodation)).toBe(true);
      expect(res.body.accommodation.length).toBeGreaterThanOrEqual(1);
      expect(res.body.accommodation[0].type).toBe('hotel');
    });

    it('GET /api/transport returns available transport options', async () => {
      const res = await request(app).get('/api/transport');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.transport)).toBe(true);
      expect(res.body.transport.length).toBe(4);
    });
  });

  describe('Trips CRUD, Ownership & Concurrency Versioning', () => {
    it('POST /api/trips creates a new trip for User A', async () => {
      const res = await request(app)
        .post('/api/trips')
        .set('Origin', 'http://localhost:5173')
        .set('Content-Type', 'application/json')
        .set('Cookie', userACookie)
        .send({
          title: 'User A Egyptian Odyssey',
          startDate: '2026-12-10',
          endDate: '2026-12-13',
          travelers: 2,
          budget: { amount: 20000, currency: 'EGP' },
          budgetTier: 'balanced',
          interests: ['history'],
        });

      expect(res.status).toBe(201);
      expect(res.body.trip.title).toBe('User A Egyptian Odyssey');
      expect(res.body.trip.days.length).toBe(4);
      expect(res.body.trip.version).toBe(1);
      userATripId = res.body.trip.id;
    });

    it('User B is blocked with 403 Forbidden when trying to access User A trip', async () => {
      const res = await request(app).get(`/api/trips/${userATripId}`).set('Cookie', userBCookie);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('User A can save full itinerary and it increments version number', async () => {
      const initialTrip = await TripModel.findOne({ id: userATripId });
      const currentDays = initialTrip!.toJSON().days;

      const res = await request(app)
        .put(`/api/trips/${userATripId}/itinerary`)
        .set('Origin', 'http://localhost:5173')
        .set('Content-Type', 'application/json')
        .set('Cookie', userACookie)
        .send({
          title: 'User A Egyptian Odyssey (Updated)',
          days: currentDays,
          version: 1, // Matches current version
        });

      expect(res.status).toBe(200);
      expect(res.body.trip.title).toBe('User A Egyptian Odyssey (Updated)');
      expect(res.body.trip.version).toBe(2);
    });

    it('PUT /api/trips/:id/itinerary rejects stale edits with 409 Conflict', async () => {
      const initialTrip = await TripModel.findOne({ id: userATripId });
      const currentDays = initialTrip!.toJSON().days;

      const res = await request(app)
        .put(`/api/trips/${userATripId}/itinerary`)
        .set('Origin', 'http://localhost:5173')
        .set('Content-Type', 'application/json')
        .set('Cookie', userACookie)
        .send({
          title: 'Conflicting Edit',
          days: currentDays,
          version: 1, // Stale version (server is at version 2)
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
      expect(res.body.error.message).toContain('modified in another session');
    });

    it('POST /api/trips/draft/place adds a place to draft trip without duplicates', async () => {
      const res = await request(app)
        .post('/api/trips/draft/place')
        .set('Origin', 'http://localhost:5173')
        .set('Content-Type', 'application/json')
        .set('Cookie', userACookie)
        .send({ placeId: 'place_pyramids_of_giza' });

      expect(res.status).toBe(200);
      expect(res.body.added).toBe(true);

      // Attempting to add same place again returns 400 Bad Request
      const dupRes = await request(app)
        .post('/api/trips/draft/place')
        .set('Origin', 'http://localhost:5173')
        .set('Content-Type', 'application/json')
        .set('Cookie', userACookie)
        .send({ placeId: 'place_pyramids_of_giza' });

      expect(dupRes.status).toBe(400);
      expect(dupRes.body.error.message).toContain('already included');
    });
  });

  describe('Bookings & Status Machine with Gated Simulation', () => {
    it('POST /api/bookings creates a transfer request in pending status', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Origin', 'http://localhost:5173')
        .set('Content-Type', 'application/json')
        .set('Cookie', userACookie)
        .send({
          kind: 'airport-transfer',
          tripId: userATripId,
          details: {
            pickupLocation: 'Cairo International Airport',
            dropoffLocation: 'The Grand Citadel Retreat',
            date: '2026-12-10',
            time: '14:00',
            passengers: 2,
            flightNumber: 'MS985',
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.booking.status).toBe('pending');
      expect(res.body.booking.statusHistory.length).toBe(1);
      userABookingId = res.body.booking.id;
    });

    it('User B cannot view or cancel User A booking', async () => {
      const res = await request(app)
        .get(`/api/bookings/${userABookingId}`)
        .set('Cookie', userBCookie);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('POST /api/bookings/:id/simulate-confirm is rejected when ENABLE_DEMO_ACTIONS is false', async () => {
      (env as { enableDemoActions: boolean }).enableDemoActions = false;

      const res = await request(app)
        .post(`/api/bookings/${userABookingId}/simulate-confirm`)
        .set('Origin', 'http://localhost:5173')
        .set('Content-Type', 'application/json')
        .set('Cookie', userACookie)
        .send({});

      expect(res.status).toBe(403);
      expect(res.body.error.message).toContain('Simulated actions are disabled');
    });

    it('POST /api/bookings/:id/simulate-confirm succeeds when ENABLE_DEMO_ACTIONS is true', async () => {
      (env as { enableDemoActions: boolean }).enableDemoActions = true;

      const res = await request(app)
        .post(`/api/bookings/${userABookingId}/simulate-confirm`)
        .set('Origin', 'http://localhost:5173')
        .set('Content-Type', 'application/json')
        .set('Cookie', userACookie)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.booking.status).toBe('confirmed');
      expect(res.body.booking.statusHistory.length).toBe(2);
      expect(res.body.booking.statusHistory[1].note).toContain('Simulated confirmation');
    });

    it('disallows cancelling a booking that is already confirmed', async () => {
      const res = await request(app)
        .post(`/api/bookings/${userABookingId}/cancel`)
        .set('Origin', 'http://localhost:5173')
        .set('Content-Type', 'application/json')
        .set('Cookie', userACookie)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('Only pending requests can be cancelled');
    });
  });
});
