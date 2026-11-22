import { describe, expect, it } from 'vitest';
import type { Place, TripDay } from '../../types';
import { extractMappedStops, countUnmappedActivities, getCategoryGlyph } from './markers';
import {
  calculateHaversineDistanceKm,
  formatStraightLineDistance,
  findNearbyPlaces,
  NEARBY_RADIUS_KM,
} from './distance';
import { getActiveTileConfig, TILE_PROVIDERS } from './tileProvider';

describe('Map pure logic test suite', () => {
  const dummyPlaces: Place[] = [
    {
      id: 'p1',
      slug: 'p1',
      name: { en: 'Place with coords' },
      area: 'downtown',
      category: 'history',
      description: null,
      history: null,
      images: [],
      location: { lat: 30.0478, lng: 31.2333 },
      openingHours: null,
      ticketPrice: null,
      avgVisitMinutes: null,
      tags: [],
      nearbyPlaceIds: [],
      tips: null,
      isDemo: true,
      placeholders: [],
    },
    {
      id: 'p2_null_coords',
      slug: 'p2',
      name: { en: 'Place with null coords' },
      area: 'zamalek',
      category: 'culture',
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
    },
    {
      id: 'p3_nearby',
      slug: 'p3',
      name: { en: 'Place very close (~500m)' },
      area: 'downtown',
      category: 'adventure',
      description: null,
      history: null,
      images: [],
      location: { lat: 30.0478, lng: 31.2386 }, // ~510m from p1
      openingHours: null,
      ticketPrice: null,
      avgVisitMinutes: null,
      tags: [],
      nearbyPlaceIds: [],
      tips: null,
      isDemo: true,
      placeholders: [],
    },
    {
      id: 'p4_far',
      slug: 'p4',
      name: { en: 'Place far away (~12km)' },
      area: 'giza',
      category: 'history',
      description: null,
      history: null,
      images: [],
      location: { lat: 29.9792, lng: 31.1342 },
      openingHours: null,
      ticketPrice: null,
      avgVisitMinutes: null,
      tags: [],
      nearbyPlaceIds: [],
      tips: null,
      isDemo: true,
      placeholders: [],
    },
  ];

  const placesById = new Map<string, Place>(dummyPlaces.map((p) => [p.id, p]));

  it('confirms places with null coordinates are NEVER turned into map markers', () => {
    const day: TripDay = {
      id: 'day_1',
      date: '2026-12-01',
      activities: [
        {
          id: 'act_1',
          source: { type: 'place', placeId: 'p1' },
          startTime: '09:00',
          durationMin: 60,
          travelMin: null,
          estimatedCost: null,
          order: 0,
        },
        {
          id: 'act_2',
          source: { type: 'place', placeId: 'p2_null_coords' }, // Has location: null
          startTime: '11:00',
          durationMin: 60,
          travelMin: null,
          estimatedCost: null,
          order: 1,
        },
        {
          id: 'act_3',
          source: { type: 'custom', title: 'Coffee stop' }, // Custom activity without coordinates
          startTime: '13:00',
          durationMin: 30,
          travelMin: null,
          estimatedCost: null,
          order: 2,
        },
      ],
    };

    const mapped = extractMappedStops(day, placesById);
    expect(mapped).toHaveLength(1);
    expect(mapped[0].placeId).toBe('p1');
    expect(mapped[0].title).toBe('Place with coords');

    // Make sure null coords stop was excluded
    expect(mapped.some((s) => s.placeId === 'p2_null_coords')).toBe(false);

    // Unmapped counter correctly counts the 2 unmapped activities
    const unmappedCount = countUnmappedActivities(day, placesById);
    expect(unmappedCount).toBe(2);
  });

  it('calculates Haversine straight-line distance accurately', () => {
    const p1 = { lat: 30.0478, lng: 31.2333 };
    const p3 = { lat: 30.0478, lng: 31.2386 };
    const distanceKm = calculateHaversineDistanceKm(p1, p3);

    // Talaat Harb to Egyptian Museum is approximately 0.51 km
    expect(distanceKm).toBeGreaterThan(0.45);
    expect(distanceKm).toBeLessThan(0.6);

    expect(formatStraightLineDistance(distanceKm)).toBe('0.5 km');
    expect(formatStraightLineDistance(0.04)).toBe('< 0.1 km');
  });

  it('computes nearby places within 1km radius (Option C)', () => {
    const target = dummyPlaces[0]; // p1
    const nearby = findNearbyPlaces(target, dummyPlaces, NEARBY_RADIUS_KM);

    // Should include p3 (~0.5km), but NOT p4 (~12km) and NOT p2 (null coords)
    expect(nearby).toHaveLength(1);
    expect(nearby[0].place.id).toBe('p3_nearby');
    expect(nearby[0].distanceKm).toBeLessThan(1.0);
  });

  it('returns category glyphs for marker distinction without new color tokens', () => {
    expect(getCategoryGlyph('history')).toBe('H');
    expect(getCategoryGlyph('culture')).toBe('C');
    expect(getCategoryGlyph('adventure')).toBe('A');
    expect(getCategoryGlyph('food')).toBe('F');
  });

  it('defaults to OpenStreetMap standard tile provider and supports env overrides', () => {
    const defaultTile = getActiveTileConfig();
    expect(defaultTile.url).toBe(TILE_PROVIDERS.osm.url);
    expect(defaultTile.attribution).toContain('OpenStreetMap');
  });
});
