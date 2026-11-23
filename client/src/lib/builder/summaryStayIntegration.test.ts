import { describe, expect, it } from 'vitest';
import type { Trip } from '../../types';
import { computeStaySummary } from './summary';

describe('computeStaySummary logic', () => {
  const baseTrip: Trip = {
    id: 't1',
    userId: 'u1',
    title: 'Cairo Trip',
    startDate: '2026-12-01',
    endDate: '2026-12-05',
    travelers: 2,
    budget: null,
    interests: ['history'],
    preferences: {},
    status: 'draft',
    days: [
      { id: 'd1', date: '2026-12-01', activities: [] },
      { id: 'd2', date: '2026-12-02', activities: [] },
      { id: 'd3', date: '2026-12-03', activities: [] },
      { id: 'd4', date: '2026-12-04', activities: [] },
    ],
    accommodationId: 'stay_grand_citadel',
    savedPlaceIds: [],
    isDemo: true,
  };

  it('computes stay estimate with nights (4 days -> 3 nights)', () => {
    const summary = computeStaySummary(baseTrip, 'The Grand Citadel Retreat', {
      min: 3000,
      max: 4500,
      currency: 'EGP',
    });

    expect(summary).not.toBeNull();
    expect(summary?.name).toBe('The Grand Citadel Retreat');
    expect(summary?.nights).toBe(3);
    expect(summary?.nightlyMin).toBe(3000);
    expect(summary?.estimatedTotalMin).toBe(9000);
    expect(summary?.isUnpriced).toBe(false);
  });

  it('handles unpriced stay cleanly without crashing or guessing', () => {
    const summary = computeStaySummary(baseTrip, 'Babylon Courtyard Inn', null);

    expect(summary).not.toBeNull();
    expect(summary?.name).toBe('Babylon Courtyard Inn');
    expect(summary?.nights).toBe(3);
    expect(summary?.nightlyMin).toBeNull();
    expect(summary?.estimatedTotalMin).toBeNull();
    expect(summary?.isUnpriced).toBe(true);
  });

  it('returns null when trip has no accommodation attached', () => {
    const tripWithoutStay = { ...baseTrip, accommodationId: null };
    const summary = computeStaySummary(tripWithoutStay, null, null);
    expect(summary).toBeNull();
  });
});
