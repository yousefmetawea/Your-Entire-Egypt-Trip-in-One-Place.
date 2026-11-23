import { describe, expect, it } from 'vitest';
import { seedAccommodation } from './accommodation';
import { seedTransport } from './transport';

const EGYPT_BOUNDS = {
  minLat: 22.0,
  maxLat: 31.8,
  minLng: 25.0,
  maxLng: 36.0,
};

describe('Demo Catalogs (Accommodation & Transport) verification tests', () => {
  it('verifies all accommodations have isDemo: true and valid properties', () => {
    expect(seedAccommodation.length).toBe(12);

    for (const acc of seedAccommodation) {
      expect(acc.isDemo).toBe(true);
      expect(['hotel', 'hostel']).toContain(acc.type);
      expect(acc.externalUrl?.startsWith('https://example.com/')).toBe(true);
      expect(acc.images.length).toBeGreaterThan(0);

      if (acc.location) {
        expect(acc.location.lat).toBeGreaterThanOrEqual(EGYPT_BOUNDS.minLat);
        expect(acc.location.lat).toBeLessThanOrEqual(EGYPT_BOUNDS.maxLat);
        expect(acc.location.lng).toBeGreaterThanOrEqual(EGYPT_BOUNDS.minLng);
        expect(acc.location.lng).toBeLessThanOrEqual(EGYPT_BOUNDS.maxLng);
      }

      if (acc.priceRange) {
        expect(['EGP', 'USD']).toContain(acc.priceRange.currency);
        expect(acc.priceRange.isEstimated).toBe(true);
        expect(acc.priceRange.min).toBeGreaterThan(0);
        expect(acc.priceRange.max).toBeGreaterThanOrEqual(acc.priceRange.min);
        expect(acc.priceRange.priceUpdatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it('verifies incomplete accommodations exist for testing edge cases', () => {
    const unpriced = seedAccommodation.filter((a) => a.priceRange === null);
    expect(unpriced.length).toBeGreaterThanOrEqual(1);

    const noAmenities = seedAccommodation.filter((a) => a.amenities.length === 0);
    expect(noAmenities.length).toBeGreaterThanOrEqual(1);
  });

  it('verifies all transport options have isDemo: true and valid properties', () => {
    expect(seedTransport.length).toBe(4);

    for (const opt of seedTransport) {
      expect(opt.isDemo).toBe(true);
      expect(['transfer', 'private-car', 'bus', 'metro']).toContain(opt.type);
      expect(['internal', 'external']).toContain(opt.bookable);

      if (opt.externalUrl) {
        expect(opt.externalUrl.startsWith('https://example.com/')).toBe(true);
      }

      if (opt.estimatedPrice) {
        expect(['EGP', 'USD']).toContain(opt.estimatedPrice.currency);
        expect(opt.estimatedPrice.isEstimated).toBe(true);
        expect(opt.estimatedPrice.amount).toBeGreaterThan(0);
        expect(opt.estimatedPrice.priceUpdatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });
});
