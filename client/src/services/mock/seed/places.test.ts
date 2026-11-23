import { describe, expect, it } from 'vitest';
import { seedPlaces } from './places';
import fs from 'node:fs';
import path from 'node:path';

// Egypt nationwide bounding box: lat ~ 22.0 to 31.8, lng ~ 25.0 to 36.0
const EGYPT_BOUNDS = {
  minLat: 22.0,
  maxLat: 31.8,
  minLng: 25.0,
  maxLng: 36.0,
};

describe('seedPlaces verification test suite', () => {
  it('has valid coordinates within Egypt bounding box with lat/lng not swapped', () => {
    for (const place of seedPlaces) {
      if (place.location !== null) {
        expect(place.location.lat).toBeGreaterThanOrEqual(EGYPT_BOUNDS.minLat);
        expect(place.location.lat).toBeLessThanOrEqual(EGYPT_BOUNDS.maxLat);
        expect(place.location.lng).toBeGreaterThanOrEqual(EGYPT_BOUNDS.minLng);
        expect(place.location.lng).toBeLessThanOrEqual(EGYPT_BOUNDS.maxLng);
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

  it('validates images array is populated with valid ImageAssets and nearbyPlaceIds is empty in seed', () => {
    for (const place of seedPlaces) {
      expect(place.images.length).toBeGreaterThan(0);
      for (const img of place.images) {
        expect(img.src).toMatch(/^https:\/\//);
        expect(img.alt.en).toBeTruthy();
        expect(img.width).toBeGreaterThan(0);
        expect(img.height).toBeGreaterThan(0);
      }
      expect(place.nearbyPlaceIds).toEqual([]);
    }
  });

  it('validates placeholders array accurately reflects null fields', () => {
    for (const place of seedPlaces) {
      if (place.images.length === 0) {
        expect(place.placeholders).toContain('images');
      } else {
        expect(place.placeholders).not.toContain('images');
      }
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
