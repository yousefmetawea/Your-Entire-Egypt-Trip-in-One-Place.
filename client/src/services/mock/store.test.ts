import { describe, expect, it } from 'vitest';
import type { Trip } from '../../types';
import {
  createMockStore,
  LEGACY_MOCK_STORE_KEY,
  MOCK_STORE_KEY,
  MOCK_STORE_VERSION,
} from './store';
import type { MockStoreEnvelope } from './store';
import { createMemoryStorage } from './storage';
import type { MockStorage } from './storage';

function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: 'trip-1',
    userId: 'demo-user',
    title: 'Cairo',
    startDate: '2026-12-01',
    endDate: '2026-12-01',
    travelers: 2,
    budget: null,
    budgetTier: 'balanced',
    interests: ['history'],
    preferences: {},
    status: 'draft',
    days: [
      {
        id: 'day-2026-12-01',
        date: '2026-12-01',
        activities: [
          {
            id: 'activity-1',
            source: { type: 'custom', title: 'Morning walk' },
            startTime: null,
            durationMin: 60,
            travelMin: null,
            estimatedCost: null,
            order: 0,
          },
        ],
      },
    ],
    accommodationId: null,
    savedPlaceIds: [],
    isDemo: true,
    ...overrides,
  };
}

function v2Envelope(trips: unknown[], bookingRequests: unknown[] = []): MockStoreEnvelope {
  return {
    version: MOCK_STORE_VERSION,
    trips: trips as Trip[],
    bookingRequests: bookingRequests as MockStoreEnvelope['bookingRequests'],
  };
}

function readEnvelope(storage: MockStorage): MockStoreEnvelope {
  const raw = storage.getItem(MOCK_STORE_KEY);
  expect(raw).not.toBeNull();
  return JSON.parse(raw ?? '') as MockStoreEnvelope;
}

describe('mock store v2', () => {
  it('migrates a valid v1 store and writes the v2 envelope', () => {
    const storage = createMemoryStorage();
    storage.setItem(
      LEGACY_MOCK_STORE_KEY,
      JSON.stringify({ trips: [makeTrip()], bookingRequests: [] }),
    );

    const store = createMockStore(storage);

    expect(store.getState().trips).toHaveLength(1);
    expect(store.getDiagnostics()).toMatchObject({ source: 'migrated' });
    expect(readEnvelope(storage)).toMatchObject({
      version: MOCK_STORE_VERSION,
      trips: [{ id: 'trip-1' }],
    });
  });

  it('keeps valid records and reports malformed ones as recovered', () => {
    const storage = createMemoryStorage();
    storage.setItem(
      MOCK_STORE_KEY,
      JSON.stringify(
        v2Envelope([
          makeTrip(),
          makeTrip({ id: 'trip-2', startDate: 'not-a-date' }),
          makeTrip({ id: 'trip-3' }),
        ]),
      ),
    );

    const store = createMockStore(storage);

    expect(store.getState().trips.map((trip) => trip.id)).toEqual(['trip-1', 'trip-3']);
    expect(store.getDiagnostics()).toEqual({
      source: 'recovered',
      invalidTrips: 1,
      invalidBookingRequests: 0,
    });
  });

  it('accepts a numeric trip budget without estimate-only fields', () => {
    const storage = createMemoryStorage();
    storage.setItem(
      MOCK_STORE_KEY,
      JSON.stringify(v2Envelope([makeTrip({ budget: { amount: 1000, currency: 'EGP' } })])),
    );

    const store = createMockStore(storage);

    expect(store.getState().trips[0]?.budget).toEqual({ amount: 1000, currency: 'EGP' });
    expect(store.getDiagnostics()).toMatchObject({ source: 'stored', invalidTrips: 0 });
  });

  it('accepts nullable start times and rejects malformed times', () => {
    const storage = createMemoryStorage();
    const valid = makeTrip();
    const invalid = makeTrip({ id: 'trip-2' });
    invalid.days[0].activities[0].startTime = '9:00';

    storage.setItem(MOCK_STORE_KEY, JSON.stringify(v2Envelope([valid, invalid])));

    const store = createMockStore(storage);

    expect(store.getState().trips).toHaveLength(1);
    expect(store.getState().trips[0].days[0].activities[0].startTime).toBeNull();
    expect(store.getDiagnostics().invalidTrips).toBe(1);
  });

  it('starts empty and reports recovery when stored JSON cannot be parsed', () => {
    const storage = createMemoryStorage();
    storage.setItem(MOCK_STORE_KEY, '{not-json');
    storage.setItem(LEGACY_MOCK_STORE_KEY, '{also-not-json');

    const store = createMockStore(storage);

    expect(store.getState()).toEqual({ trips: [], bookingRequests: [] });
    expect(store.getDiagnostics()).toMatchObject({ source: 'recovered' });
  });

  it('reset clears both store versions and returns an empty stored source', () => {
    const storage = createMemoryStorage();
    storage.setItem(LEGACY_MOCK_STORE_KEY, JSON.stringify({ trips: [makeTrip()] }));

    const store = createMockStore(storage);
    store.reset();

    expect(store.getState()).toEqual({ trips: [], bookingRequests: [] });
    expect(store.getDiagnostics()).toMatchObject({ source: 'empty' });
    expect(storage.getItem(MOCK_STORE_KEY)).toBeNull();
    expect(storage.getItem(LEGACY_MOCK_STORE_KEY)).toBeNull();
  });
});
