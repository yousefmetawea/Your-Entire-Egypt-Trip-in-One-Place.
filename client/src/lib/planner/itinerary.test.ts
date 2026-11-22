import { describe, expect, it } from 'vitest';
import type {
  CairoArea,
  GenerateItineraryInput,
  Place,
  PlaceCategory,
  PlannerAnswers,
  PriceQuote,
} from '../../types';
import { generateItinerary } from './itinerary';

function createPlace(overrides: Partial<Place> & Pick<Place, 'id' | 'area' | 'category'>): Place {
  return {
    slug: overrides.id,
    name: { en: overrides.id },
    description: null,
    history: null,
    images: [],
    location: null,
    openingHours: null,
    ticketPrice: null,
    avgVisitMinutes: null,
    tags: [],
    nearbyPlaceIds: [],
    tips: null,
    isDemo: true,
    placeholders: [],
    ...overrides,
  };
}

function place(
  id: string,
  area: CairoArea,
  category: PlaceCategory = 'history',
  overrides: Partial<Place> = {},
): Place {
  return createPlace({ id, area, category, ...overrides });
}

const answers: PlannerAnswers = {
  startDate: '2026-12-01',
  endDate: '2026-12-03',
  travelers: 2,
  budgetTier: 'balanced',
  interests: ['history'],
  accommodationType: 'any',
  transportType: 'any',
};

function input(patch: Partial<GenerateItineraryInput> = {}): GenerateItineraryInput {
  return {
    tripId: 'trip-1',
    userId: 'user-1',
    title: 'Test trip',
    answers,
    places: [],
    savedPlaceIds: [],
    includeSavedPlaces: true,
    ...patch,
  };
}

describe('generateItinerary', () => {
  it('builds deterministic days grouped by area', () => {
    const places = [
      place('giza-a', 'giza', 'history', { name: { en: 'Giza A' } }),
      place('giza-b', 'giza', 'history', { name: { en: 'Giza B' } }),
      place('downtown-a', 'downtown'),
      place('islamic-a', 'islamic-cairo'),
    ];
    const result = generateItinerary(
      input({
        places,
        answers: { ...answers, endDate: '2026-12-02' },
      }),
    );

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.itinerary.trip).toMatchObject({
      id: 'trip-1',
      userId: 'user-1',
      title: 'Test trip',
      startDate: '2026-12-01',
      endDate: '2026-12-02',
      travelers: 2,
      budget: null,
      budgetTier: 'balanced',
      interests: ['history'],
      preferences: {},
      status: 'draft',
      accommodationId: null,
      savedPlaceIds: [],
      isDemo: true,
    });
    expect(result.itinerary.trip.days.map((day) => day.id)).toEqual([
      'day-2026-12-01',
      'day-2026-12-02',
    ]);
    expect(
      result.itinerary.trip.days[0]?.activities.map((activity) => ({
        id: activity.id,
        startTime: activity.startTime,
        source: activity.source,
      })),
    ).toEqual([
      {
        id: 'activity-2026-12-01-giza-a',
        startTime: '09:00',
        source: { type: 'place', placeId: 'giza-a' },
      },
      {
        id: 'activity-2026-12-01-giza-b',
        startTime: '11:30',
        source: { type: 'place', placeId: 'giza-b' },
      },
    ]);
    expect(result.itinerary.trip.days[1]?.activities).toHaveLength(1);
    expect(result.itinerary.matchedPlaceIds).toEqual(['giza-a', 'giza-b', 'downtown-a']);
    expect(result.itinerary.omittedPlaceIds).toEqual(['islamic-a']);
    expect(result.itinerary.candidateCount).toBe(4);
    expect(result.itinerary.warnings).toContainEqual({
      code: 'omitted-areas',
      count: 1,
      areas: ['islamic-cairo'],
      placeIds: ['islamic-a'],
    });
  });

  it('returns no-matches when no places match', () => {
    const result = generateItinerary(
      input({
        places: [place('giza-a', 'giza')],
        answers: { ...answers, interests: ['food'] },
      }),
    );

    expect(result).toEqual({
      ok: false,
      warnings: [{ code: 'no-matches' }, { code: 'unmatched-interests', categories: ['food'] }],
    });
  });

  it('includes saved places and respects the exclusion option', () => {
    const saved = place('saved-giza', 'giza');
    const culture = place('downtown-culture', 'downtown', 'culture');
    const cultureAnswers: PlannerAnswers = {
      ...answers,
      endDate: '2026-12-01',
      interests: ['culture'],
    };

    const included = generateItinerary(
      input({
        places: [saved, culture],
        answers: cultureAnswers,
        savedPlaceIds: ['saved-giza'],
      }),
    );
    expect(included.ok).toBe(true);

    if (included.ok) {
      expect(included.itinerary.matchedPlaceIds).toEqual(['saved-giza']);
      expect(included.itinerary.trip.savedPlaceIds).toEqual(['saved-giza']);
      expect(included.itinerary.warnings).toContainEqual({
        code: 'saved-places-included',
        count: 1,
      });
    }

    const excluded = generateItinerary(
      input({
        places: [saved, culture],
        answers: cultureAnswers,
        savedPlaceIds: ['saved-giza'],
        includeSavedPlaces: false,
      }),
    );
    expect(excluded.ok).toBe(true);

    if (excluded.ok) {
      expect(excluded.itinerary.matchedPlaceIds).toEqual(['downtown-culture']);
      expect(excluded.itinerary.trip.savedPlaceIds).toEqual([]);
      expect(excluded.itinerary.warnings).toContainEqual({
        code: 'saved-places-excluded',
        count: 1,
      });
    }
  });

  it('caps days at three activities and uses the fixed start times', () => {
    const places = Array.from({ length: 6 }, (_, index) => place(`giza-${index}`, 'giza'));
    const result = generateItinerary(
      input({
        places,
        answers: { ...answers, endDate: '2026-12-02' },
      }),
    );

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    for (const day of result.itinerary.trip.days) {
      expect(day.activities).toHaveLength(3);
      expect(day.activities.map((activity) => activity.startTime)).toEqual([
        '09:00',
        '11:30',
        '14:00',
      ]);
    }
  });

  it('adds empty days and warns when places run out', () => {
    const result = generateItinerary(
      input({
        places: [place('giza-a', 'giza'), place('giza-b', 'giza')],
        answers: { ...answers, endDate: '2026-12-04' },
      }),
    );

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.itinerary.trip.days).toHaveLength(4);
    expect(result.itinerary.trip.days[2]?.activities).toEqual([]);
    expect(result.itinerary.trip.days[3]?.activities).toEqual([]);
    expect(result.itinerary.warnings).toContainEqual({
      code: 'empty-days',
      count: 2,
      dates: ['2026-12-03', '2026-12-04'],
    });
  });

  it('keeps missing durations and prices null and warns about them', () => {
    const price: PriceQuote = {
      amount: 450,
      currency: 'EGP',
      isEstimated: true,
      priceUpdatedAt: '2026-01-01',
    };
    const result = generateItinerary(
      input({
        places: [
          place('giza-a', 'giza', 'history', { avgVisitMinutes: 90, ticketPrice: price }),
          place('giza-b', 'giza'),
        ],
        answers: { ...answers, endDate: '2026-12-01' },
      }),
    );

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    const [first, second] = result.itinerary.trip.days[0]?.activities ?? [];
    expect(first).toMatchObject({
      durationMin: 90,
      travelMin: null,
      estimatedCost: price,
    });
    expect(second).toMatchObject({
      durationMin: null,
      travelMin: null,
      estimatedCost: null,
    });
    expect(result.itinerary.warnings).toContainEqual({
      code: 'missing-durations',
      count: 1,
    });
    expect(result.itinerary.warnings).toContainEqual({
      code: 'missing-travel-times',
      count: 2,
    });
    expect(result.itinerary.warnings).toContainEqual({
      code: 'missing-prices',
      count: 1,
    });
  });

  it('reports unmatched interests and missing saved places', () => {
    const result = generateItinerary(
      input({
        places: [place('giza-a', 'giza')],
        answers: { ...answers, interests: ['history', 'food'] },
        savedPlaceIds: ['missing-place'],
      }),
    );

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.itinerary.warnings).toContainEqual({
      code: 'unmatched-interests',
      categories: ['food'],
    });
    expect(result.itinerary.warnings).toContainEqual({
      code: 'saved-places-missing',
      count: 1,
      placeIds: ['missing-place'],
    });
    expect(result.itinerary.trip.savedPlaceIds).toEqual([]);
  });

  it('keeps only explicit preferences on the trip', () => {
    const result = generateItinerary(
      input({
        places: [place('giza-a', 'giza')],
        answers: {
          ...answers,
          accommodationType: 'hotel',
          transportType: 'any',
        },
      }),
    );

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.itinerary.trip.preferences).toEqual({
      accommodationType: 'hotel',
    });
  });

  it('is deterministic and does not mutate its inputs', () => {
    const places = Object.freeze([
      Object.freeze(place('giza-a', 'giza')),
      Object.freeze(place('giza-b', 'giza')),
    ]);
    const savedPlaceIds = Object.freeze(['giza-a']);
    const base = input({ places, savedPlaceIds });
    const first = generateItinerary(base);
    const second = generateItinerary(base);

    expect(first).toEqual(second);
    expect(places).toHaveLength(2);
    expect(savedPlaceIds).toEqual(['giza-a']);
    expect(base.answers.interests).toEqual(['history']);
  });
});
