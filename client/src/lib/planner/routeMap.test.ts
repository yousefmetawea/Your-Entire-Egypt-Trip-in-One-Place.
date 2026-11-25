import { describe, expect, it } from 'vitest';
import { getRouteCities, LAND_DOTS, orderRoute } from './routeMap';

describe('routeMap', () => {
  it('always includes Cairo and starts the route there', () => {
    const cities = getRouteCities([]);
    expect(cities.map((city) => city.id)).toEqual(['cairo']);
    expect(orderRoute(getRouteCities(['history']))[0].id).toBe('cairo');
  });

  it('adds cities that have catalog places for the chosen interests', () => {
    const ids = getRouteCities(['culture']).map((city) => city.id);
    expect(ids).toEqual(['cairo', 'alexandria']);
    expect(getRouteCities(['adventure']).map((city) => city.id)).toContain('red-sea');
  });

  it('visits every selected city exactly once', () => {
    const cities = getRouteCities(['history', 'culture', 'adventure']);
    const route = orderRoute(cities);
    expect(route).toHaveLength(cities.length);
    expect(new Set(route.map((city) => city.id)).size).toBe(cities.length);
  });

  it('builds a land dot grid', () => {
    expect(LAND_DOTS.length).toBeGreaterThan(500);
    expect(LAND_DOTS.length).toBeLessThan(4000);
  });
});
