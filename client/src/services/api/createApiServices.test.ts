import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createApiServices } from './createApiServices';
import type { Place } from '../../types';

describe('createApiServices', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('places.list calls /api/places with query parameters and credentials', async () => {
    const mockPlaces: Place[] = [
      {
        id: 'place-1',
        slug: 'great-pyramid',
        name: { en: 'Great Pyramid of Giza' },
        area: 'giza',
        category: 'history',
        description: { en: 'Ancient wonder' },
        history: null,
        images: [],
        location: { lat: 29.9792, lng: 31.1342 },
        openingHours: null,
        ticketPrice: null,
        avgVisitMinutes: 180,
        tags: ['history'],
        nearbyPlaceIds: [],
        tips: null,
        isDemo: true,
        placeholders: [],
      },
    ];

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ places: mockPlaces, total: 1 }),
    });
    globalThis.fetch = fetchMock;

    const services = createApiServices();
    const result = await services.places.list({ area: 'giza', category: 'history' });

    expect(result).toEqual(mockPlaces);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/api/places');
    expect(url).toContain('area=giza');
    expect(url).toContain('category=history');
    expect(options.credentials).toBe('include');
  });

  it('trips.saveItinerary sends PUT with credentials and custom CSRF header', async () => {
    const mockTrip = {
      id: 'trip_123',
      userId: 'user_1',
      title: 'Updated Cairo Expedition',
      startDate: '2026-11-25',
      endDate: '2026-11-28',
      travelers: 2,
      status: 'draft',
      days: [],
      savedPlaceIds: [],
      version: 2,
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ trip: mockTrip }),
    });
    globalThis.fetch = fetchMock;

    const services = createApiServices();
    const result = await services.trips.saveItinerary('trip_123', {
      title: 'Updated Cairo Expedition',
      days: [],
    });

    expect(result).toEqual(mockTrip);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/api/trips/trip_123/itinerary');
    expect(options.method).toBe('PUT');
    expect(options.credentials).toBe('include');
    expect(options.headers['X-Requested-With']).toBe('XMLHttpRequest');
  });

  it('bookingRequests.create posts booking payload', async () => {
    const mockBooking = {
      id: 'book_123',
      userId: 'user_1',
      kind: 'airport-transfer',
      tripId: 'trip_123',
      status: 'pending',
      details: {
        pickupLocation: 'Cairo International Airport (CAI)',
        dropoffLocation: 'Downtown Cairo Hotel',
        date: '2026-11-25',
        time: '10:00',
        passengers: 2,
        flightNumber: 'MS777',
      },
      statusHistory: [],
      version: 1,
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ booking: mockBooking }),
    });
    globalThis.fetch = fetchMock;

    const services = createApiServices();
    const result = await services.bookingRequests.create({
      kind: 'airport-transfer',
      tripId: 'trip_123',
      details: {
        pickupLocation: 'Cairo International Airport (CAI)',
        dropoffLocation: 'Downtown Cairo Hotel',
        date: '2026-11-25',
        time: '10:00',
        passengers: 2,
        flightNumber: 'MS777',
      },
    });

    expect(result).toEqual(mockBooking);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/api/bookings');
    expect(options.method).toBe('POST');
  });
});
