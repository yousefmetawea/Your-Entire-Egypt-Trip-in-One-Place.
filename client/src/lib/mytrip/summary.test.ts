import { describe, expect, it } from 'vitest';
import type { Trip } from '../../types';
import { calculateTripPhase } from '../dashboard/tripPhase';
import { computeTripStats, countTransfers, getDisplayStatus, phaseMatchesStatus } from './summary';

function trip(status: Trip['status'], start: string, end: string): Trip {
  return {
    id: 't',
    userId: 'u',
    title: 'T',
    startDate: start,
    endDate: end,
    travelers: 1,
    budget: null,
    interests: [],
    preferences: {},
    status,
    days: [
      {
        id: 'd1',
        date: start,
        activities: [
          {
            id: 'a1',
            source: { type: 'place', placeId: 'p1' },
            startTime: '09:00',
            durationMin: 60,
            travelMin: null,
            estimatedCost: null,
            order: 0,
          },
          {
            id: 'a2',
            source: { type: 'custom', title: 'Lunch' },
            startTime: null,
            durationMin: null,
            travelMin: null,
            estimatedCost: null,
            order: 1,
          },
        ],
      },
    ],
    accommodationId: null,
    savedPlaceIds: [],
    isDemo: false,
  };
}

describe('my trip status', () => {
  const now = new Date(2026, 10, 26, 12);
  it('a stored draft with past dates stays draft and does not claim completion', () => {
    const info = calculateTripPhase(trip('draft', '2026-11-01', '2026-11-03'), now);
    expect(getDisplayStatus(info)).toBe('draft');
    expect(phaseMatchesStatus(info)).toBe(false);
  });
  it('derives completed from dates when not draft', () => {
    const info = calculateTripPhase(trip('upcoming', '2026-11-01', '2026-11-03'), now);
    expect(getDisplayStatus(info)).toBe('completed');
    expect(phaseMatchesStatus(info)).toBe(true);
  });
  it('cancelled wins over dates', () => {
    const info = calculateTripPhase(trip('cancelled', '2026-11-25', '2026-11-27'), now);
    expect(getDisplayStatus(info)).toBe('cancelled');
  });
});

describe('trip stats', () => {
  it('counts only real data', () => {
    const s = computeTripStats(trip('draft', '2026-11-01', '2026-11-03'));
    expect(s).toEqual({
      days: 1,
      activities: 2,
      destinations: 1,
      timedActivities: 1,
      knownMinutes: 60,
    });
  });
  it('counts transfers by status', () => {
    expect(countTransfers([])).toEqual({ total: 0, pending: 0, confirmed: 0, cancelled: 0 });
  });
});
