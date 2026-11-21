import { describe, expect, it } from 'vitest';
import type { PlaceCategory, TripPreferences } from '../../types';
import { createMockServices } from './createMockServices';
import { createMemoryStorage } from './storage';

function createServices(storage = createMemoryStorage()) {
  return createMockServices({
    latencyMs: 0,
    storage,
  });
}

describe('mock trip service', () => {
  it('creates a draft trip with one day per date and persists it', async () => {
    const storage = createMemoryStorage();
    const services = createServices(storage);
    const trip = await services.trips.create({
      title: 'Cairo in December',
      startDate: '2026-12-01',
      endDate: '2026-12-03',
      travelers: 2,
    });

    expect(trip.status).toBe('draft');
    expect(trip.isDemo).toBe(true);
    expect(trip.days.map((day) => day.date)).toEqual(['2026-12-01', '2026-12-02', '2026-12-03']);

    const reloaded = await createServices(storage).trips.getById(trip.id);
    expect(reloaded.title).toBe('Cairo in December');
  });

  it('does not retain references to caller-owned trip inputs', async () => {
    const services = createServices();
    const interests: PlaceCategory[] = ['history'];
    const preferences: TripPreferences = { transportType: 'private-car' };
    const trip = await services.trips.create({
      title: 'Cairo',
      startDate: '2026-12-01',
      endDate: '2026-12-01',
      travelers: 1,
      interests,
      preferences,
    });

    interests.push('food');
    preferences.transportType = 'any';

    const reloaded = await services.trips.getById(trip.id);
    expect(reloaded.interests).toEqual(['history']);
    expect(reloaded.preferences).toEqual({ transportType: 'private-car' });
  });

  it('validates trip dates and traveler counts', async () => {
    const services = createServices();

    await expect(
      services.trips.create({
        title: 'Reversed',
        startDate: '2026-12-03',
        endDate: '2026-12-01',
        travelers: 1,
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION' });

    await expect(
      services.trips.create({
        title: 'No travelers',
        startDate: '2026-12-01',
        endDate: '2026-12-01',
        travelers: 0,
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION' });
  });

  it('adds, reorders, and removes activities in a day', async () => {
    const services = createServices();
    const trip = await services.trips.create({
      title: 'Cairo',
      startDate: '2026-12-01',
      endDate: '2026-12-01',
      travelers: 1,
    });
    const dayId = trip.days[0].id;

    await services.trips.addActivity(trip.id, dayId, {
      source: { type: 'custom', title: 'Morning walk' },
      startTime: '09:00',
      durationMin: 60,
      travelMin: 0,
    });
    const second = await services.trips.addActivity(trip.id, dayId, {
      source: { type: 'custom', title: 'Museum visit' },
      startTime: '11:00',
      durationMin: 120,
      travelMin: 15,
    });

    expect(second.days[0].activities.map((activity) => activity.order)).toEqual([0, 1]);

    const reordered = await services.trips.reorderActivities(trip.id, dayId, [
      second.days[0].activities[1].id,
      second.days[0].activities[0].id,
    ]);
    expect(reordered.days[0].activities.map((activity) => activity.source)).toEqual([
      { type: 'custom', title: 'Museum visit' },
      { type: 'custom', title: 'Morning walk' },
    ]);

    const removed = await services.trips.removeActivity(
      trip.id,
      dayId,
      reordered.days[0].activities[0].id,
    );
    expect(removed.days[0].activities).toHaveLength(1);
    expect(removed.days[0].activities[0].order).toBe(0);
  });
});
