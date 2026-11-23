import { beforeEach, describe, expect, it } from 'vitest';
import { createMockServices } from './createMockServices';
import { createMemoryStorage } from './storage';
import { MOCK_STORE_KEY } from './store';

describe('Dashboard Service Layer Integration', () => {
  let storage: ReturnType<typeof createMemoryStorage>;
  let services: ReturnType<typeof createMockServices>;

  beforeEach(() => {
    storage = createMemoryStorage();
    services = createMockServices({ storage });
  });

  it('lists trips for the current user and handles zero trips', async () => {
    const trips = await services.trips.listMine();
    expect(trips).toEqual([]);
  });

  it('persists and retrieves savedPlaceIds on trip updates', async () => {
    const created = await services.trips.create({
      title: 'Grand Tour',
      startDate: '2026-11-25',
      endDate: '2026-11-28',
      travelers: 2,
    });

    expect(created.savedPlaceIds).toEqual([]);

    const updated = await services.trips.update(created.id, {
      savedPlaceIds: ['pyramids-of-giza', 'grand-egyptian-museum'],
    });

    expect(updated.savedPlaceIds).toEqual(['pyramids-of-giza', 'grand-egyptian-museum']);

    // Check persistence from store
    const retrieved = await services.trips.getById(created.id);
    expect(retrieved.savedPlaceIds).toEqual(['pyramids-of-giza', 'grand-egyptian-museum']);

    // Remove one saved place
    const updatedAgain = await services.trips.update(created.id, {
      savedPlaceIds: ['pyramids-of-giza'],
    });
    expect(updatedAgain.savedPlaceIds).toEqual(['pyramids-of-giza']);
  });

  it('updates trip status to cancelled and retains itinerary days', async () => {
    const created = await services.trips.create({
      title: 'Winter Trip',
      startDate: '2026-12-01',
      endDate: '2026-12-03',
      travelers: 1,
    });

    const cancelled = await services.trips.update(created.id, {
      status: 'cancelled',
    });

    expect(cancelled.status).toBe('cancelled');
    expect(cancelled.days.length).toBe(3);

    const mine = await services.trips.listMine();
    expect(mine[0]?.status).toBe('cancelled');
  });

  it('cancels pending booking requests with an audit entry in statusHistory', async () => {
    const req = await services.bookingRequests.create({
      kind: 'airport-transfer',
      details: {
        pickupLocation: 'Cairo International Airport',
        dropoffLocation: 'Marriott Mena House',
        date: '2026-11-25',
        time: '14:00',
        passengers: 2,
      },
    });

    expect(req.status).toBe('pending');
    expect(req.statusHistory.length).toBe(1);

    const cancelled = await services.bookingRequests.cancel(req.id);
    expect(cancelled.status).toBe('cancelled');
    expect(cancelled.statusHistory.length).toBe(2);
    expect(cancelled.statusHistory[1]?.status).toBe('cancelled');
  });

  it('recovers from corrupted storage and allows resetting local data', async () => {
    // Inject corrupt JSON into storage
    storage.setItem(MOCK_STORE_KEY, '{"version": 2, "trips": "corrupt}');

    const corruptServices = createMockServices({ storage });
    const trips = await corruptServices.trips.listMine();
    expect(trips).toEqual([]); // recovers gracefully to empty state

    await corruptServices.resetLocalData();
    const afterReset = await corruptServices.trips.listMine();
    expect(afterReset).toEqual([]);
  });
});
