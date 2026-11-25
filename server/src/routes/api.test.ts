import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app.js';
import { runSeed } from '../seed/seed.js';
import { TripModel } from '../models/Trip.js';

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

  describe('Booking requests, guests and operator workflow', () => {
    const contact = { name: 'Sara Ali', phone: '+20 100 123 4567' };
    const details = {
      pickupLocation: 'Cairo International Airport',
      dropoffLocation: 'The Grand Citadel Retreat',
      date: '2026-12-10',
      time: '14:00',
      passengers: 2,
      flightNumber: 'MS985',
    };
    let guestBooking: { id: string; referenceCode: string };
    let adminCookie: string[];

    const post = (url: string, cookie?: string[]) => {
      const r = request(app)
        .post(url)
        .set('Origin', 'http://localhost:5173')
        .set('Content-Type', 'application/json');
      return cookie ? r.set('Cookie', cookie) : r;
    };

    it('creates a pending request with a reference code and contact for a signed-in user', async () => {
      const res = await post('/api/bookings', userACookie).send({
        kind: 'airport-transfer',
        tripId: userATripId,
        contact,
        details,
      });

      expect(res.status).toBe(201);
      expect(res.body.booking.status).toBe('pending');
      expect(res.body.booking.referenceCode).toMatch(/^EG-[A-Z0-9]{6}$/);
      expect(res.body.booking.contact.phone).toBe(contact.phone);
      expect(res.body.booking.statusHistory.length).toBe(1);
      expect(res.body.booking.isDemo).toBeUndefined();
      userABookingId = res.body.booking.id;
    });

    it('requires a name and phone number', async () => {
      const res = await post('/api/bookings').send({
        kind: 'airport-transfer',
        contact: { name: '', phone: 'abc' },
        details,
      });
      expect(res.status).toBe(422);
    });

    it('accepts a guest request without an account', async () => {
      const res = await post('/api/bookings').send({
        kind: 'airport-transfer',
        contact: { ...contact, email: '' },
        details,
      });
      expect(res.status).toBe(201);
      expect(res.body.booking.userId).toBeNull();
      guestBooking = res.body.booking;
    });

    it('lets a guest track a request with reference code and phone only', async () => {
      const ok = await post('/api/bookings/track').send({
        referenceCode: guestBooking.referenceCode.toLowerCase(),
        phone: '0100 123 4567'.replace(/^0/, '+20 '),
      });
      expect(ok.status).toBe(200);
      expect(ok.body.booking.id).toBe(guestBooking.id);

      const wrong = await post('/api/bookings/track').send({
        referenceCode: guestBooking.referenceCode,
        phone: '+20 111 000 0000',
      });
      expect(wrong.status).toBe(404);
    });

    it('User B cannot view User A booking', async () => {
      const res = await request(app)
        .get(`/api/bookings/${userABookingId}`)
        .set('Cookie', userBCookie);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('no longer exposes a simulated confirmation route', async () => {
      const res = await post(`/api/bookings/${userABookingId}/simulate-confirm`, userACookie).send(
        {},
      );
      expect(res.status).toBe(404);
    });

    it('blocks non-admins from operator routes', async () => {
      const anon = await request(app).get('/api/admin/bookings');
      expect(anon.status).toBe(401);
      const user = await request(app).get('/api/admin/bookings').set('Cookie', userACookie);
      expect(user.status).toBe(403);
    });

    it('lets the operator list, confirm and decline requests with a note', async () => {
      const { UserModel } = await import('../models/User.js');
      await UserModel.updateOne({ email: 'beta@example.com' }, { role: 'admin' });
      const login = await post('/api/auth/login').send({
        email: 'beta@example.com',
        password: 'PasswordBeta123!',
      });
      adminCookie = login.headers['set-cookie'] as unknown as string[];

      const list = await request(app)
        .get('/api/admin/bookings?status=pending')
        .set('Cookie', adminCookie);
      expect(list.status).toBe(200);
      expect(list.body.bookings.length).toBeGreaterThanOrEqual(2);

      const confirm = await request(app)
        .patch(`/api/admin/bookings/${userABookingId}/status`)
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', adminCookie)
        .send({ status: 'confirmed', note: 'Driver will wait at arrivals' });
      expect(confirm.status).toBe(200);
      expect(confirm.body.booking.status).toBe('confirmed');
      expect(confirm.body.booking.statusHistory[1].note).toContain('Driver will wait');

      const decline = await request(app)
        .patch(`/api/admin/bookings/${guestBooking.id}/status`)
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', adminCookie)
        .send({ status: 'cancelled', note: 'No driver available that day' });
      expect(decline.status).toBe(200);
      expect(decline.body.booking.status).toBe('cancelled');

      const again = await request(app)
        .patch(`/api/admin/bookings/${guestBooking.id}/status`)
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', adminCookie)
        .send({ status: 'confirmed' });
      expect(again.status).toBe(400);
    });

    it('disallows the customer cancelling a request that is already confirmed', async () => {
      const res = await post(`/api/bookings/${userABookingId}/cancel`, userACookie).send({});

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('Only pending requests can be cancelled');
    });

    it('lets a guest cancel a pending request via reference code and phone', async () => {
      const created = await post('/api/bookings').send({
        kind: 'airport-transfer',
        contact,
        details,
      });
      const res = await post('/api/bookings/track/cancel').send({
        referenceCode: created.body.booking.referenceCode,
        phone: contact.phone,
      });
      expect(res.status).toBe(200);
      expect(res.body.booking.status).toBe('cancelled');
    });

    it('handles legacy records without reference code or contact', async () => {
      const { BookingRequestModel } = await import('../models/BookingRequest.js');
      const { BookingsService } = await import('../services/bookings.service.js');
      const owner = await BookingRequestModel.findOne({ id: userABookingId });
      const makeLegacy = (id: string) => ({
        id,
        userId: owner?.userId,
        tripId: null,
        kind: 'airport-transfer',
        details: {
          pickupLocation: 'A',
          dropoffLocation: 'B',
          date: '2026-12-01',
          time: '10:00',
          passengers: 1,
        },
        status: 'pending',
        isDemo: true,
        statusHistory: [{ status: 'pending', changedAt: new Date().toISOString() }],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await BookingRequestModel.collection.insertMany([
        makeLegacy('legacy-1'),
        makeLegacy('legacy-2'),
      ]);

      const mine = await request(app).get('/api/bookings').set('Cookie', userACookie);
      expect(mine.status).toBe(200);
      const old = mine.body.bookings.find((b: { id: string }) => b.id === 'legacy-1');
      expect(old).toBeDefined();
      expect(old.contact).toBeUndefined();

      expect(await BookingsService.backfillLegacyReferenceCodes()).toBe(2);
      expect(await BookingsService.backfillLegacyReferenceCodes()).toBe(0);

      const op = await request(app).get('/api/admin/bookings').set('Cookie', adminCookie);
      const fixed = op.body.bookings.find((b: { id: string }) => b.id === 'legacy-1');
      expect(fixed.referenceCode).toMatch(/^EG-[A-Z0-9]{6}$/);

      const confirm = await request(app)
        .patch('/api/admin/bookings/legacy-1/status')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', adminCookie)
        .send({ status: 'confirmed', note: 'ok' });
      expect(confirm.status).toBe(200);

      const track = await post('/api/bookings/track').send({
        referenceCode: fixed.referenceCode,
        phone: '+20 100 000 0000',
      });
      expect(track.status).toBe(404);
    });
  });
});
