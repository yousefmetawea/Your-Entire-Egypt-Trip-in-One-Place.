import { describe, expect, it } from 'vitest';
import { seedPlaces } from './places';
import fs from 'node:fs';
import path from 'node:path';

// Greater Cairo bounding box: lat ~ 29.5 to 30.5, lng ~ 30.9 to 31.6
const CAIRO_BOUNDS = {
  minLat: 29.5,
  maxLat: 30.5,
  minLng: 30.9,
  maxLng: 31.6,
};

describe('seedPlaces verification test suite', () => {
  it('has valid coordinates within Greater Cairo bounding box with lat/lng not swapped', () => {
    for (const place of seedPlaces) {
      if (place.location !== null) {
        expect(place.location.lat).toBeGreaterThanOrEqual(CAIRO_BOUNDS.minLat);
        expect(place.location.lat).toBeLessThanOrEqual(CAIRO_BOUNDS.maxLat);
        expect(place.location.lng).toBeGreaterThanOrEqual(CAIRO_BOUNDS.minLng);
        expect(place.location.lng).toBeLessThanOrEqual(CAIRO_BOUNDS.maxLng);
        // Specifically check lat is ~30 and lng is ~31, confirming not swapped
        expect(place.location.lat).toBeLessThan(place.location.lng);
      }
    }
  });

  it('validates every non-null ticket price has currency, estimated flag, and priceUpdatedAt', () => {
    for (const place of seedPlaces) {
      if (place.ticketPrice !== null) {
        expect(['EGP', 'USD']).toContain(place.ticketPrice.currency);
        expect(typeof place.ticketPrice.isEstimated).toBe('boolean');
        expect(typeof place.ticketPrice.amount).toBe('number');
        expect(place.ticketPrice.amount).toBeGreaterThan(0);
        expect(place.ticketPrice.priceUpdatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it('validates that isDemo is true on all seed places', () => {
    for (const place of seedPlaces) {
      expect(place.isDemo).toBe(true);
    }
  });

  it('validates images array is empty and nearbyPlaceIds is empty in seed', () => {
    for (const place of seedPlaces) {
      expect(place.images).toEqual([]);
      expect(place.nearbyPlaceIds).toEqual([]);
    }
  });

  it('validates placeholders array accurately reflects null fields', () => {
    for (const place of seedPlaces) {
      if (place.location === null) {
        expect(place.placeholders).toContain('location');
      } else {
        expect(place.placeholders).not.toContain('location');
      }

      if (place.ticketPrice === null) {
        expect(place.placeholders).toContain('ticketPrice');
      } else {
        expect(place.placeholders).not.toContain('ticketPrice');
      }

      if (place.avgVisitMinutes === null) {
        expect(place.placeholders).toContain('avgVisitMinutes');
      } else {
        expect(place.placeholders).not.toContain('avgVisitMinutes');
      }

      if (place.description === null) {
        expect(place.placeholders).toContain('description');
      } else {
        expect(place.placeholders).not.toContain('description');
      }
    }
  });

  it('validates every seed place is recorded in docs/data/places-research.md', () => {
    // Read the research log file
    const researchLogPath = path.resolve(__dirname, '../../../../../docs/data/places-research.md');
    expect(fs.existsSync(researchLogPath)).toBe(true);
    const logContent = fs.readFileSync(researchLogPath, 'utf-8');

    for (const place of seedPlaces) {
      expect(logContent).toContain(place.id);
      expect(logContent).toContain(place.slug);
    }
  });
});
