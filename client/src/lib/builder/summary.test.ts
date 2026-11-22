import { describe, expect, it } from 'vitest';
import type { PriceQuote, Trip, TripActivity, TripDay } from '../../types';
import { getBudgetStatus, getDayTiming, summarizeItinerary } from './summary';

function quote(amount: number, currency: 'USD' | 'EGP' = 'EGP'): PriceQuote {
  return {
    amount,
    currency,
    isEstimated: true,
    priceUpdatedAt: '2026-11-22',
  };
}

function activity(id: string, overrides: Partial<TripActivity> = {}): TripActivity {
  return {
    id,
    source: { type: 'custom', title: id },
    startTime: '09:00',
    durationMin: 60,
    travelMin: null,
    estimatedCost: null,
    order: 0,
    ...overrides,
  };
}

function makeTrip(days: TripDay[], travelers = 2): Trip {
  return {
    id: 'trip-1',
    userId: 'demo-user',
    title: 'Cairo',
    startDate: days[0]?.date ?? '2026-12-01',
    endDate: days[days.length - 1]?.date ?? '2026-12-01',
    travelers,
    budget: null,
    budgetTier: 'balanced',
    interests: ['history'],
    preferences: {},
    status: 'draft',
    days,
    accommodationId: null,
    savedPlaceIds: [],
    isDemo: true,
  };
}

describe('builder day timing', () => {
  it('reports missing starts, out-of-order times, and overlaps', () => {
    const day: TripDay = {
      id: 'day-2026-12-01',
      date: '2026-12-01',
      activities: [
        activity('a1', { startTime: '10:00', durationMin: 120 }),
        activity('a2', { startTime: null, durationMin: 30 }),
        activity('a3', { startTime: '09:00', durationMin: 30 }),
      ],
    };

    expect(getDayTiming(day)).toEqual({
      missingStartCount: 1,
      hasOrderIssue: true,
      hasOverlap: true,
    });
  });

  it('does not report a schedule issue for ordered times without durations', () => {
    const day: TripDay = {
      id: 'day-2026-12-01',
      date: '2026-12-01',
      activities: [
        activity('a1', { startTime: '09:00', durationMin: null }),
        activity('a2', { startTime: '11:00', durationMin: null }),
      ],
    };

    expect(getDayTiming(day)).toEqual({
      missingStartCount: 0,
      hasOrderIssue: false,
      hasOverlap: false,
    });
  });
});

describe('itinerary summary', () => {
  it('groups costs by currency, separates traveler totals, and counts missing data', () => {
    const summary = summarizeItinerary(
      makeTrip(
        [
          {
            id: 'day-2026-12-01',
            date: '2026-12-01',
            activities: [
              activity('a1', {
                source: { type: 'place', placeId: 'place-1' },
                estimatedCost: quote(100, 'USD'),
                durationMin: 90,
                startTime: null,
              }),
              activity('a2', {
                source: { type: 'place', placeId: 'place-1' },
                estimatedCost: quote(450, 'EGP'),
                durationMin: null,
                startTime: '11:00',
              }),
              activity('a3', { estimatedCost: null, durationMin: 30 }),
            ],
          },
          {
            id: 'day-2026-12-02',
            date: '2026-12-02',
            activities: [],
          },
        ],
        3,
      ),
    );

    expect(summary).toMatchObject({
      activityCount: 3,
      placeCount: 1,
      customActivityCount: 1,
      emptyDayCount: 1,
      unpricedActivityCount: 1,
      missingDurationCount: 1,
      missingStartCount: 1,
      totalKnownDurationMin: 120,
    });
    expect(summary.costs).toEqual([
      {
        currency: 'EGP',
        perTraveler: 450,
        groupTotal: 1350,
        activityCount: 1,
      },
      {
        currency: 'USD',
        perTraveler: 100,
        groupTotal: 300,
        activityCount: 1,
      },
    ]);
  });

  it('rounds totals to two decimals', () => {
    const summary = summarizeItinerary(
      makeTrip(
        [
          {
            id: 'day-2026-12-01',
            date: '2026-12-01',
            activities: [
              activity('a1', { estimatedCost: quote(0.105, 'USD') }),
              activity('a2', { estimatedCost: quote(0.105, 'USD') }),
            ],
          },
        ],
        3,
      ),
    );

    expect(summary.costs[0]).toMatchObject({
      perTraveler: 0.21,
      groupTotal: 0.63,
    });
  });
});

describe('budget status', () => {
  const costs = [{ currency: 'EGP' as const, perTraveler: 400, groupTotal: 800, activityCount: 2 }];

  it('returns near and over thresholds for a matching numeric budget', () => {
    expect(getBudgetStatus(costs, { amount: 1000, currency: 'EGP' })).toMatchObject({
      level: 'near',
      ratio: 0.8,
    });
    expect(getBudgetStatus(costs, { amount: 800, currency: 'EGP' })).toMatchObject({
      level: 'over',
      ratio: 1,
    });
  });

  it('returns null without a matching budget currency', () => {
    expect(getBudgetStatus(costs, { amount: 100, currency: 'USD' })).toBeNull();
    expect(getBudgetStatus(costs, null)).toBeNull();
  });
});
