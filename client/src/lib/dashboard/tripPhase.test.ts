import { describe, expect, it } from 'vitest';
import type { Trip } from '../../types';
import { calculateTripPhase, formatLocalIsoDate, parseLocalCalendarDate } from './tripPhase';

describe('tripPhase', () => {
  const baseTrip: Trip = {
    id: 'trip_test_1',
    userId: 'demo-user',
    title: 'Autumn in Cairo',
    startDate: '2026-10-14',
    endDate: '2026-10-18',
    travelers: 2,
    budget: null,
    budgetTier: 'balanced',
    interests: ['history', 'culture'],
    preferences: {},
    status: 'draft',
    days: [
      { id: 'day_1', date: '2026-10-14', activities: [] },
      { id: 'day_2', date: '2026-10-15', activities: [] },
      { id: 'day_3', date: '2026-10-16', activities: [] },
      { id: 'day_4', date: '2026-10-17', activities: [] },
      { id: 'day_5', date: '2026-10-18', activities: [] },
    ],
    accommodationId: null,
    savedPlaceIds: [],
    isDemo: true,
  };

  it('correctly handles before trip phase with countdown and Day 1 preview', () => {
    // 14 days before start date at 10:00:00 local time
    const testNow = new Date(2026, 9, 1, 10, 0, 0, 0); // 2026-10-01 (month is 0-indexed: 9 = Oct)
    const result = calculateTripPhase(baseTrip, testNow);

    expect(result.phase).toBe('before');
    expect(result.effectiveStatus).toBe('draft'); // stored status preserved
    expect(result.dayNumber).toBe(1);
    expect(result.activeDay?.id).toBe('day_1');
    expect(result.daysRemaining).toBe(13); // 2026-10-14 vs 2026-10-01
    expect(result.countdown).not.toBeNull();
    expect(result.countdown?.days).toBe(12); // from 10:00 on Oct 1 to 00:00 on Oct 14 is 12 days, 14 hours
    expect(result.countdown?.hours).toBe(14);
  });

  it('marks effectiveStatus as upcoming when stored status is upcoming and today is before start', () => {
    const upcomingTrip = { ...baseTrip, status: 'upcoming' as const };
    const testNow = new Date(2026, 9, 10, 0, 0, 0);
    const result = calculateTripPhase(upcomingTrip, testNow);

    expect(result.phase).toBe('before');
    expect(result.effectiveStatus).toBe('upcoming');
    expect(result.daysRemaining).toBe(4);
  });

  it('identifies during trip phase correctly and selects the matching day', () => {
    // Day 2: Oct 15, 2026
    const testNow = new Date(2026, 9, 15, 14, 30, 0);
    const trip = { ...baseTrip, status: 'upcoming' as const };
    const result = calculateTripPhase(trip, testNow);

    expect(result.phase).toBe('during');
    expect(result.effectiveStatus).toBe('active');
    expect(result.dayNumber).toBe(2);
    expect(result.activeDay?.id).toBe('day_2');
    expect(result.countdown).toBeNull();
    expect(result.daysRemaining).toBe(0);
  });

  it('identifies after trip phase and reports days since end', () => {
    // 3 days after Oct 18: Oct 21, 2026
    const testNow = new Date(2026, 9, 21, 12, 0, 0);
    const trip = { ...baseTrip, status: 'upcoming' as const };
    const result = calculateTripPhase(trip, testNow);

    expect(result.phase).toBe('after');
    expect(result.effectiveStatus).toBe('completed');
    expect(result.dayNumber).toBeNull();
    expect(result.daysSinceEnd).toBe(3);
    expect(result.activeDay?.id).toBe('day_5'); // last day
  });

  it('preserves cancelled status even during or after dates', () => {
    const cancelledTrip = { ...baseTrip, status: 'cancelled' as const };
    const testNow = new Date(2026, 9, 15, 12, 0, 0);
    const result = calculateTripPhase(cancelledTrip, testNow);

    expect(result.phase).toBe('during');
    expect(result.effectiveStatus).toBe('cancelled');
  });

  it('handles missing or invalid dates gracefully without throwing', () => {
    const invalidTrip = {
      ...baseTrip,
      startDate: 'not-a-date',
      endDate: 'invalid',
    };
    const result = calculateTripPhase(invalidTrip);

    expect(result.phase).toBe('no-dates');
    expect(result.countdown).toBeNull();
    expect(result.activeDay?.id).toBe('day_1');
  });

  it('formats and parses local dates consistently without UTC day shift', () => {
    const parsed = parseLocalCalendarDate('2026-11-23');
    expect(parsed).not.toBeNull();
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(10);
    expect(parsed?.getDate()).toBe(23);

    expect(formatLocalIsoDate(parsed!)).toBe('2026-11-23');
  });
});
