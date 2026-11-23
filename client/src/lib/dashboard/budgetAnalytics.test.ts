import { describe, expect, it } from 'vitest';
import type { Accommodation, AirportTransferBookingRequest, Trip } from '../../types';
import { calculateBudgetAnalytics } from './budgetAnalytics';

describe('budgetAnalytics', () => {
  const baseTrip: Trip = {
    id: 'trip_analytics_1',
    userId: 'demo-user',
    title: 'Cairo Odyssey',
    startDate: '2026-11-20',
    endDate: '2026-11-23',
    travelers: 2,
    budget: { amount: 15000, currency: 'EGP' },
    budgetTier: 'balanced',
    interests: ['history'],
    preferences: {},
    status: 'draft',
    days: [
      {
        id: 'day_1',
        date: '2026-11-20',
        activities: [
          {
            id: 'act_1',
            source: { type: 'place', placeId: 'gem' },
            startTime: '09:00',
            durationMin: 120,
            travelMin: null,
            estimatedCost: {
              amount: 500,
              currency: 'EGP',
              isEstimated: true,
              priceUpdatedAt: '2026-11-20',
            },
            order: 0,
          },
          {
            id: 'act_2',
            source: { type: 'custom', title: 'Stroll' },
            startTime: '14:00',
            durationMin: 60,
            travelMin: null,
            estimatedCost: null, // unpriced activity
            order: 1,
          },
        ],
      },
    ],
    accommodationId: 'stay_citadel',
    savedPlaceIds: [],
    isDemo: true,
  };

  const mockAccommodation: Accommodation = {
    id: 'stay_citadel',
    name: { en: 'The Grand Citadel Retreat' },
    type: 'hotel',
    priceRange: {
      min: 3200,
      max: 4800,
      currency: 'EGP',
      isEstimated: true,
      priceUpdatedAt: '2026-11-20',
    },
    amenities: ['Wi-Fi'],
    images: [],
    location: { lat: 30.02, lng: 31.25 },
    externalUrl: 'https://example.com/stay',
    isDemo: true,
    placeholders: [],
  };

  const mockTransferRequest: AirportTransferBookingRequest = {
    id: 'req_1',
    userId: 'demo-user',
    tripId: 'trip_analytics_1',
    kind: 'airport-transfer',
    status: 'pending',
    createdAt: '2026-11-20T10:00:00Z',
    statusHistory: [],
    isDemo: true,
    details: {
      pickupLocation: 'CAI Airport',
      dropoffLocation: 'Citadel Hotel',
      date: '2026-11-20',
      time: '12:00',
      passengers: 2,
    },
  };

  it('aggregates activities, stay, and transport with correct percentages', () => {
    const result = calculateBudgetAnalytics(baseTrip, mockAccommodation, [mockTransferRequest]);

    // Activities: 500 * 2 travelers = 1000 EGP
    // Stay: 3 nights * 3200 = 9600 EGP (trip is Nov 20-23 = 4 days -> 3 nights)
    // Wait, let's verify nights: days.length = 1 in baseTrip.days array!
    // In computeStaySummary: if days.length === 1, nights = 1 -> 3200 * 1 = 3200 EGP!
    // Transport: 1 transfer = 650 EGP
    // Total utilized = 1000 + 3200 + 650 = 4850 EGP
    expect(result.currency).toBe('EGP');
    expect(result.totalUtilized).toBe(4850);
    expect(result.unpricedActivitiesCount).toBe(1);
    expect(result.unpricedItemsTotal).toBe(1);
    expect(result.isStayUnpriced).toBe(false);

    // Budget Cap: 15000 EGP, ratio = 4850 / 15000 = 0.3233...
    expect(result.budgetCap?.amount).toBe(15000);
    expect(result.budgetLevel).toBe('under');
    expect(result.remainingReserve).toBe(10150);

    // Slices count
    expect(result.slices.length).toBe(3);
    const staySlice = result.slices.find((s) => s.id === 'stay');
    const actSlice = result.slices.find((s) => s.id === 'activities');
    const transSlice = result.slices.find((s) => s.id === 'transport');

    expect(staySlice?.amount).toBe(3200);
    expect(actSlice?.amount).toBe(1000);
    expect(transSlice?.amount).toBe(650);
  });

  it('handles unpriced stay and unpriced activities without inventing numbers', () => {
    const unpricedAcc: Accommodation = {
      ...mockAccommodation,
      priceRange: null,
    };
    const result = calculateBudgetAnalytics(baseTrip, unpricedAcc, []);

    expect(result.isStayUnpriced).toBe(true);
    expect(result.unpricedItemsTotal).toBe(2); // 1 unpriced activity + 1 unpriced stay
    expect(result.totalUtilized).toBe(1000); // activities only
  });

  it('handles empty trip without stay or requests gracefully', () => {
    const emptyTrip: Trip = {
      ...baseTrip,
      days: [],
      accommodationId: null,
      budget: null,
    };
    const result = calculateBudgetAnalytics(emptyTrip, null, []);

    expect(result.totalUtilized).toBe(0);
    expect(result.slices).toEqual([]);
    expect(result.budgetCap).toBeNull();
    expect(result.unpricedItemsTotal).toBe(0);
  });
});
