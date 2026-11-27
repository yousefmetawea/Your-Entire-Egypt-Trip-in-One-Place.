import { describe, expect, it } from 'vitest';
import { seedPlaces } from '../../services/mock/seed/places';
import { buildFallbackPlan, buildLocalAnswer } from './fallback';

describe('AI fallbacks', () => {
  it('builds a non-AI plan from catalog places only', () => {
    const plan = buildFallbackPlan(seedPlaces, {
      days: 3,
      budget: 'balanced',
      interests: ['history'],
      regions: [],
      style: 'balanced',
      lang: 'en',
    });
    expect(plan).not.toBeNull();
    const ids = new Set(seedPlaces.map((place) => place.id));
    for (const day of plan?.days ?? []) {
      expect(day.stops.length).toBeLessThanOrEqual(3);
      for (const stop of day.stops) expect(ids.has(stop.placeId)).toBe(true);
    }
  });

  it('local answers use only place data', () => {
    const place = seedPlaces[0]!;
    expect(buildLocalAnswer({ place, preset: 'bestTime', lang: 'en' }).text).toBeNull();
    const expected = buildLocalAnswer({ place, preset: 'expect', lang: 'en' }).text;
    expect(expected).toBe(place.description?.en ?? null);
  });
});
