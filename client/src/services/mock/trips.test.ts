import { describe, expect, it } from 'vitest';
import type { PlaceCategory, PlannerAnswers, TripPreferences } from '../../types';
import { createMockServices } from './createMockServices';
import { MOCK_STORE_KEY } from './store';
import type { MockStoreState } from './store';
import { createMemoryStorage } from './storage';

function createServices(storage = createMemoryStorage(), now?: () => Date) {
  return createMockServices({
    latencyMs: 0,
    storage,
    ...(now ? { now } : {}),
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

  describe('addPlaceToDraft', () => {
    const now = () => new Date(2026, 10, 21, 12, 0, 0);

    it('creates a labeled draft with honest defaults and persists it', async () => {
      const storage = createMemoryStorage();
      const services = createServices(storage, now);
      const place = await services.places.getBySlug('cairo-tower');
      const result = await services.trips.addPlaceToDraft(place.id);

      expect(result.added).toBe(true);
      expect(result.createdTrip).toBe(true);
      expect(result.trip).toMatchObject({
        title: 'My Cairo trip',
        startDate: '2026-11-21',
        endDate: '2026-11-21',
        travelers: 1,
        status: 'draft',
        isDemo: true,
      });
      expect(result.trip.days).toHaveLength(1);
      expect(result.dayId).toBe(result.trip.days[0].id);
      expect(result.activity).toMatchObject({
        source: { type: 'place', placeId: place.id },
        startTime: '09:00',
        durationMin: 75,
        travelMin: null,
        estimatedCost: {
          amount: 350,
          currency: 'EGP',
          isEstimated: true,
          priceUpdatedAt: '2026-04-10',
        },
        order: 0,
      });

      const reloaded = await createServices(storage, now).trips.listMine();
      expect(reloaded).toHaveLength(1);
      expect(reloaded[0].days[0].activities).toHaveLength(1);
      expect(reloaded[0].days[0].activities[0].source).toEqual({
        type: 'place',
        placeId: place.id,
      });
    });

    it('adds to the first day of an existing draft', async () => {
      const services = createServices();
      const place = await services.places.getBySlug('cairo-tower');
      const existing = await services.trips.create({
        title: 'Existing plan',
        startDate: '2026-12-01',
        endDate: '2026-12-03',
        travelers: 2,
      });
      const result = await services.trips.addPlaceToDraft(place.id);

      expect(result.createdTrip).toBe(false);
      expect(result.added).toBe(true);
      expect(result.trip.id).toBe(existing.id);
      expect(result.trip.title).toBe('Existing plan');
      expect(result.dayId).toBe(existing.days[0].id);
      expect(result.trip.days[0].activities).toHaveLength(1);
      expect(result.trip.days[1].activities).toHaveLength(0);
    });

    it('appends a day when the draft has no days', async () => {
      const storage = createMemoryStorage();
      const seedServices = createServices(storage);
      const existing = await seedServices.trips.create({
        title: 'Empty draft',
        startDate: '2026-12-01',
        endDate: '2026-12-03',
        travelers: 1,
      });
      const raw = JSON.parse(storage.getItem(MOCK_STORE_KEY) ?? '') as MockStoreState;
      raw.trips[0].days = [];
      storage.setItem(MOCK_STORE_KEY, JSON.stringify(raw));

      const services = createServices(storage);
      const place = await services.places.getBySlug('cairo-tower');
      const result = await services.trips.addPlaceToDraft(place.id);

      expect(result.added).toBe(true);
      expect(result.createdTrip).toBe(false);
      expect(result.trip.days).toHaveLength(1);
      expect(result.trip.days[0].id).toBe(result.dayId);
      expect(result.trip.days[0].date).toBe(existing.startDate);
      expect(result.trip.days[0].activities).toHaveLength(1);
    });

    it('blocks duplicates across all days without writing', async () => {
      const services = createServices();
      const place = await services.places.getBySlug('cairo-tower');
      const first = await services.trips.addPlaceToDraft(place.id);
      const second = await services.trips.addPlaceToDraft(place.id);

      expect(second.added).toBe(false);
      expect(second.createdTrip).toBe(false);
      expect(second.dayId).toBe(first.dayId);
      expect(second.trip.days[0].activities).toHaveLength(1);
    });

    it('detects a place already scheduled on another day', async () => {
      const services = createServices();
      const place = await services.places.getBySlug('cairo-tower');
      const trip = await services.trips.create({
        title: 'Two-day plan',
        startDate: '2026-12-01',
        endDate: '2026-12-02',
        travelers: 1,
      });
      const secondDay = trip.days[1];

      await services.trips.addActivity(trip.id, secondDay.id, {
        source: { type: 'place', placeId: place.id },
        startTime: '10:00',
        durationMin: 45,
        travelMin: 0,
      });

      const result = await services.trips.addPlaceToDraft(place.id);

      expect(result.added).toBe(false);
      expect(result.dayId).toBe(secondDay.id);
      expect(result.trip.days[1].activities).toHaveLength(1);
    });

    it('creates a new draft when only non-draft trips exist', async () => {
      const services = createServices();
      const place = await services.places.getBySlug('cairo-tower');
      const existing = await services.trips.create({
        title: 'Confirmed plan',
        startDate: '2026-12-01',
        endDate: '2026-12-01',
        travelers: 1,
      });
      await services.trips.update(existing.id, { status: 'upcoming' });

      const result = await services.trips.addPlaceToDraft(place.id);
      const trips = await services.trips.listMine();

      expect(result.createdTrip).toBe(true);
      expect(result.trip.id).not.toBe(existing.id);
      expect(trips).toHaveLength(2);
      expect(trips.filter((trip) => trip.status === 'draft')).toHaveLength(1);
    });

    it('uses a supplied place snapshot for dev-only catalog records', async () => {
      const services = createServices();
      const base = await services.places.getBySlug('cairo-tower');
      const fixture = {
        ...base,
        id: 'place_layout_fixture',
        slug: 'layout-fixture',
        name: { en: 'Synthetic fixture' },
        ticketPrice: {
          amount: 1250,
          currency: 'EGP' as const,
          isEstimated: true,
          priceUpdatedAt: '2026-11-21',
        },
        avgVisitMinutes: 150,
      };

      const result = await services.trips.addPlaceToDraft(fixture.id, fixture);

      expect(result.added).toBe(true);
      expect(result.activity).toMatchObject({
        source: { type: 'place', placeId: fixture.id },
        durationMin: 150,
        estimatedCost: fixture.ticketPrice,
      });
      expect(result.activity.notes).toBeUndefined();
    });

    it('does not create a trip when the place is missing', async () => {
      const services = createServices();

      await expect(services.trips.addPlaceToDraft('missing-place')).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
      await expect(services.trips.listMine()).resolves.toEqual([]);
    });
  });

  describe('createPlannedTrip', () => {
    const answers: PlannerAnswers = {
      startDate: '2026-12-01',
      endDate: '2026-12-03',
      travelers: 2,
      budgetTier: 'balanced',
      interests: ['history'],
      accommodationType: 'any',
      transportType: 'any',
    };

    it('creates a generated draft with days and persists it', async () => {
      const storage = createMemoryStorage();
      const services = createServices(storage);
      const result = await services.trips.createPlannedTrip({ answers });

      expect(result.createdTrip).toBe(true);
      expect(result.replacedTrip).toBe(false);
      expect(result.trip).toMatchObject({
        title: 'My Cairo trip',
        startDate: '2026-12-01',
        endDate: '2026-12-03',
        travelers: 2,
        budget: null,
        budgetTier: 'balanced',
        status: 'draft',
        isDemo: true,
      });
      expect(result.trip.days).toHaveLength(3);
      expect(result.trip.days.flatMap((day) => day.activities).length).toBeGreaterThan(0);
      expect(result.trip.days[0]?.id).toBe('day-2026-12-01');

      const reloaded = await createServices(storage).trips.listMine();
      expect(reloaded).toHaveLength(1);
      expect(reloaded[0]?.days).toHaveLength(3);
      expect(reloaded[0]?.budgetTier).toBe('balanced');
    });

    it('replaces an existing draft in place and preserves its title', async () => {
      const services = createServices();
      const existing = await services.trips.create({
        title: 'Existing plan',
        startDate: '2026-12-01',
        endDate: '2026-12-02',
        travelers: 1,
      });
      const result = await services.trips.createPlannedTrip({
        answers: { ...answers, startDate: '2026-12-01', endDate: '2026-12-02' },
        replaceTripId: existing.id,
      });

      expect(result.createdTrip).toBe(false);
      expect(result.replacedTrip).toBe(true);
      expect(result.trip.id).toBe(existing.id);
      expect(result.trip.title).toBe('Existing plan');

      const trips = await services.trips.listMine();
      expect(trips).toHaveLength(1);
      expect(trips[0]?.id).toBe(existing.id);
    });

    it('includes saved draft places when requested and excludes them otherwise', async () => {
      const services = createServices();
      const pyramids = await services.places.getBySlug('pyramids-of-giza');
      await services.trips.addPlaceToDraft(pyramids.id);
      const cultureAnswers: PlannerAnswers = {
        ...answers,
        interests: ['culture'],
      };

      const included = await services.trips.createPlannedTrip({
        answers: cultureAnswers,
        includeSavedPlaces: true,
      });
      expect(included.matchedPlaceIds).toContain(pyramids.id);
      expect(included.trip.savedPlaceIds).toContain(pyramids.id);

      const excluded = await services.trips.createPlannedTrip({
        answers: cultureAnswers,
        includeSavedPlaces: false,
      });
      expect(excluded.matchedPlaceIds).not.toContain(pyramids.id);
      expect(excluded.trip.savedPlaceIds).toEqual([]);
    });

    it('rejects generation when no places match and leaves data unchanged', async () => {
      const services = createServices();

      await expect(
        services.trips.createPlannedTrip({
          answers: { ...answers, interests: ['food'] },
        }),
      ).rejects.toMatchObject({ code: 'VALIDATION' });
      await expect(services.trips.listMine()).resolves.toEqual([]);
    });

    it('validates traveler and trip-length limits', async () => {
      const services = createServices();

      await expect(
        services.trips.createPlannedTrip({
          answers: { ...answers, travelers: 13 },
        }),
      ).rejects.toMatchObject({ code: 'VALIDATION' });

      await expect(
        services.trips.createPlannedTrip({
          answers: {
            ...answers,
            startDate: '2026-12-01',
            endDate: '2026-12-15',
          },
        }),
      ).rejects.toMatchObject({ code: 'VALIDATION' });
    });

    it('regenerates the single draft without creating duplicates', async () => {
      const services = createServices();
      const first = await services.trips.createPlannedTrip({ answers });
      const second = await services.trips.createPlannedTrip({ answers });

      expect(second.trip.id).toBe(first.trip.id);
      expect(second.createdTrip).toBe(false);
      expect(second.replacedTrip).toBe(true);

      const trips = await services.trips.listMine();
      expect(trips).toHaveLength(1);
    });
  });
});
