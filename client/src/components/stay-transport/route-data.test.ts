import { describe, expect, it } from 'vitest';
import { buildRoute, estimateMinutes, haversineKm } from './route-data';

describe('route data', () => {
  it('builds the default circuit with no stay', () => {
    const r = buildRoute(null);
    expect(r.cities.map((c) => c.id)).toEqual(['cairo', 'luxor', 'aswan', 'redsea']);
    expect(r.legs.map((l) => l.mode)).toEqual(['flight', 'train', 'bus']);
    expect(r.stayCityId).toBeNull();
  });

  it('marks the stay city when it is on the circuit', () => {
    const r = buildRoute({ lat: 25.698, lng: 32.637 });
    expect(r.stayCityId).toBe('luxor');
    expect(r.legs).toHaveLength(3);
  });

  it('adds a branch leg from Cairo for a stay off the circuit', () => {
    const r = buildRoute({ lat: 29.195, lng: 25.525 });
    expect(r.stayCityId).toBe('siwa');
    expect(r.legs).toHaveLength(4);
    expect(r.legs[3].from.id).toBe('cairo');
    expect(r.legs[3].to.id).toBe('siwa');
    expect(r.legs[3].mode).toBe('bus');
  });

  it('computes plausible distances and times', () => {
    const r = buildRoute(null);
    expect(haversineKm(r.cities[0], r.cities[1])).toBeGreaterThan(450);
    expect(estimateMinutes('flight', 500)).toBeLessThan(estimateMinutes('bus', 500));
  });
});
