import { describe, expect, it } from 'vitest';
import type { Place, PriceQuote } from '../../types';
import { createCustomActivity, createPlaceActivity } from './activities';

const price: PriceQuote = {
  amount: 450,
  currency: 'EGP',
  isEstimated: true,
  priceUpdatedAt: '2026-11-22',
};

const place: Place = {
  id: 'cairo-tower',
  slug: 'cairo-tower',
  name: { en: 'Cairo Tower' },
  area: 'zamalek',
  category: 'culture',
  description: null,
  history: null,
  images: [],
  location: null,
  openingHours: null,
  ticketPrice: price,
  avgVisitMinutes: 90,
  tags: [],
  nearbyPlaceIds: [],
  tips: null,
  isDemo: true,
  placeholders: [],
};

describe('builder activity factories', () => {
  it('creates a place activity from stored place data without inventing a time', () => {
    const activity = createPlaceActivity(place, { id: 'activity-1' });

    expect(activity).toEqual({
      id: 'activity-1',
      source: { type: 'place', placeId: 'cairo-tower' },
      startTime: null,
      durationMin: 90,
      travelMin: null,
      estimatedCost: price,
      order: 0,
    });
  });

  it('keeps a supplied start time for a place activity', () => {
    const activity = createPlaceActivity(place, { id: 'activity-1', startTime: '10:15' });

    expect(activity.startTime).toBe('10:15');
  });

  it('creates a trimmed custom activity and omits an empty note', () => {
    const activity = createCustomActivity({
      id: 'custom-1',
      title: '  Rooftop dinner  ',
      startTime: '19:30',
      durationMin: 75,
      estimatedCost: null,
      notes: '   ',
    });

    expect(activity).toEqual({
      id: 'custom-1',
      source: { type: 'custom', title: 'Rooftop dinner' },
      startTime: '19:30',
      durationMin: 75,
      travelMin: null,
      estimatedCost: null,
      order: 0,
    });
  });
});
