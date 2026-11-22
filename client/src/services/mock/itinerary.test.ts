import { describe, expect, it } from 'vitest';
import type { PriceQuote, TripDay } from '../../types';
import { createMockServices } from './createMockServices';
import { createMemoryStorage } from './storage';

function createServices(storage = createMemoryStorage(), currentUserId = 'demo-user') {
  return createMockServices({
    latencyMs: 0,
    storage,
    currentUserId,
  });
}

const customCost: PriceQuote = {
  amount: 250,
  currency: 'EGP',
  isEstimated: true,
  priceUpdatedAt: '2026-11-22',
};

describe('mock itinerary editing', () => {
  it('saves edited days, preserves nullable times, and updates the date range', async () => {
    const storage = createMemoryStorage();
    const services = createServices(storage);
    const trip = await services.trips.create({
      title: 'Editable Cairo',
      startDate: '2026-12-01',
      endDate: '2026-12-01',
      travelers: 2,
    });
    const places = await services.places.list();
    const place = places[0];
    const days: TripDay[] = [
      {
        id: 'day-2026-12-01',
        date: '2026-12-01',
        activities: [
          {
            id: 'custom-1',
            source: { type: 'custom', title: 'Slow breakfast' },
            startTime: null,
            durationMin: 45,
            travelMin: null,
            estimatedCost: customCost,
            order: 7,
          },
        ],
      },
      {
        id: 'day-2026-12-02',
        date: '2026-12-02',
        activities: [
          {
            id: 'place-1',
            source: { type: 'place', placeId: place.id },
            startTime: '10:30',
            durationMin: null,
            travelMin: null,
            estimatedCost: null,
            order: 3,
          },
        ],
      },
    ];

    const saved = await services.trips.saveItinerary(trip.id, {
      title: '  Editable Cairo, revised  ',
      days,
    });

    expect(saved.title).toBe('Editable Cairo, revised');
    expect(saved.startDate).toBe('2026-12-01');
    expect(saved.endDate).toBe('2026-12-02');
    expect(saved.days).toHaveLength(2);
    expect(saved.days[0].activities[0]).toMatchObject({
      startTime: null,
      order: 0,
      estimatedCost: customCost,
    });
    expect(saved.days[1].activities[0].order).toBe(0);

    const reloaded = await createServices(storage).trips.getById(trip.id);
    expect(reloaded.days[1].date).toBe('2026-12-02');
    expect(reloaded.days[1].activities[0].source).toEqual({
      type: 'place',
      placeId: place.id,
    });
  });

  it('rejects invalid itineraries without changing stored data', async () => {
    const services = createServices();
    const trip = await services.trips.create({
      title: 'Cairo',
      startDate: '2026-12-01',
      endDate: '2026-12-01',
      travelers: 1,
    });
    const baseDay: TripDay = {
      id: 'day-2026-12-01',
      date: '2026-12-01',
      activities: [
        {
          id: 'custom-1',
          source: { type: 'custom', title: 'Walk' },
          startTime: '09:00',
          durationMin: 30,
          travelMin: null,
          estimatedCost: null,
          order: 0,
        },
      ],
    };

    await expect(services.trips.saveItinerary(trip.id, { days: [] })).rejects.toMatchObject({
      code: 'VALIDATION',
    });
    await expect(
      services.trips.saveItinerary(trip.id, {
        days: [{ ...baseDay, activities: [{ ...baseDay.activities[0], startTime: '25:00' }] }],
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION' });
    await expect(
      services.trips.saveItinerary(trip.id, {
        days: [
          baseDay,
          {
            id: 'day-2026-12-03',
            date: '2026-12-03',
            activities: [],
          },
        ],
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION' });

    const reloaded = await services.trips.getById(trip.id);
    expect(reloaded.days).toHaveLength(1);
    expect(reloaded.days[0].activities).toEqual([]);
  });

  it('rejects unknown places and duplicate activity identifiers', async () => {
    const services = createServices();
    const trip = await services.trips.create({
      title: 'Cairo',
      startDate: '2026-12-01',
      endDate: '2026-12-01',
      travelers: 1,
    });
    const activity = {
      id: 'custom-1',
      source: { type: 'custom' as const, title: 'Walk' },
      startTime: null,
      durationMin: null,
      travelMin: null,
      estimatedCost: null,
      order: 0,
    };

    await expect(
      services.trips.saveItinerary(trip.id, {
        days: [
          {
            id: 'day-2026-12-01',
            date: '2026-12-01',
            activities: [
              {
                ...activity,
                source: { type: 'place', placeId: 'missing-place' },
              },
            ],
          },
        ],
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION' });

    await expect(
      services.trips.saveItinerary(trip.id, {
        days: [
          {
            id: 'day-2026-12-01',
            date: '2026-12-01',
            activities: [activity, { ...activity, order: 1 }],
          },
        ],
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION' });
  });

  it('prevents another demo user from editing the trip', async () => {
    const storage = createMemoryStorage();
    const trip = await createServices(storage).trips.create({
      title: 'Cairo',
      startDate: '2026-12-01',
      endDate: '2026-12-01',
      travelers: 1,
    });

    await expect(
      createServices(storage, 'another-user').trips.saveItinerary(trip.id, {
        days: [
          {
            id: 'day-2026-12-01',
            date: '2026-12-01',
            activities: [],
          },
        ],
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('resets all local demo data', async () => {
    const services = createServices();
    const trip = await services.trips.create({
      title: 'Cairo',
      startDate: '2026-12-01',
      endDate: '2026-12-01',
      travelers: 1,
    });

    await services.resetLocalData();

    await expect(services.trips.listMine()).resolves.toEqual([]);
    await expect(services.trips.getById(trip.id)).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
