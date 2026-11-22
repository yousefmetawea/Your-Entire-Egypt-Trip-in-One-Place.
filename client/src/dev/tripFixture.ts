import type { Place, Trip } from '../types';

export const DEV_PERF_TRIP_ID = 'trip_dev_perf_6x8';

/**
 * Creates 6 days x 8 markers synthetic trip fixture for map performance stress-testing.
 * Uses synthetic coordinates across Cairo. Excluded from production builds.
 */
export function createSyntheticPerformanceTrip(basePlaces: readonly Place[]): {
  trip: Trip;
  places: Place[];
} {
  const syntheticPlaces: Place[] = [];
  const days = [];

  // Generate 48 synthetic places with distinct coords around Greater Cairo
  for (let d = 1; d <= 6; d++) {
    const activities = [];
    for (let a = 1; a <= 8; a++) {
      const idx = (d - 1) * 8 + a;
      const id = `place_perf_synth_${idx}`;
      const lat = 29.98 + d * 0.015 + a * 0.003;
      const lng = 31.12 + d * 0.01 + a * 0.004;

      const place: Place = {
        id,
        slug: `perf-synth-${idx}`,
        name: { en: `Synthetic Benchmark Stop ${idx} (Day ${d})` },
        area: 'downtown',
        category: a % 2 === 0 ? 'history' : 'culture',
        description: { en: `Synthetic performance test place ${idx}.` },
        history: null,
        images: [],
        location: { lat, lng },
        openingHours: null,
        ticketPrice: null,
        avgVisitMinutes: 60,
        tags: ['synthetic', 'perf'],
        nearbyPlaceIds: [],
        tips: null,
        isDemo: true,
        placeholders: ['history', 'images', 'ticketPrice', 'nearbyPlaceIds', 'tips'],
      };

      syntheticPlaces.push(place);

      activities.push({
        id: `act_perf_${idx}`,
        source: { type: 'place' as const, placeId: id },
        startTime: `${String(8 + a).padStart(2, '0')}:00`,
        durationMin: 60,
        travelMin: null,
        estimatedCost: null,
        order: a - 1,
      });
    }

    days.push({
      id: `day_perf_${d}`,
      date: `2026-12-0${d}`,
      activities,
    });
  }

  const trip: Trip = {
    id: DEV_PERF_TRIP_ID,
    userId: 'user_dev_perf',
    title: '6 Days x 8 Markers Map Benchmark Trip',
    startDate: '2026-12-01',
    endDate: '2026-12-06',
    travelers: 2,
    budget: null,
    interests: ['history', 'culture'],
    preferences: {},
    status: 'draft',
    days,
    accommodationId: null,
    savedPlaceIds: [],
    isDemo: true,
  };

  return { trip, places: [...basePlaces, ...syntheticPlaces] };
}
