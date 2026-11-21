import { describe, expect, it } from 'vitest';
import type { Place } from '../types';
import {
  EMPTY_DISCOVER_CONTEXT,
  EMPTY_DISCOVER_FILTERS,
  createDiscoverHref,
  filterPlaces,
  hasActiveFilters,
  matchesDuration,
  normalizeContext,
  parseDiscoverState,
  serializeDiscoverState,
} from './discover';

function makePlace(
  overrides: Partial<Place> & Pick<Place, 'id' | 'slug' | 'name' | 'area' | 'category'>,
): Place {
  return {
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
    ...overrides,
  };
}

const places: Place[] = [
  makePlace({
    id: 'place_pyramids',
    slug: 'pyramids-of-giza',
    name: { en: 'Pyramids of Giza' },
    area: 'giza',
    category: 'history',
    avgVisitMinutes: 240,
  }),
  makePlace({
    id: 'place_museum',
    slug: 'grand-egyptian-museum',
    name: { en: 'Grand Egyptian Museum' },
    area: 'giza',
    category: 'history',
    avgVisitMinutes: 180,
  }),
  makePlace({
    id: 'place_khan',
    slug: 'khan-el-khalili',
    name: { en: 'Khan el-Khalili' },
    area: 'islamic-cairo',
    category: 'culture',
    avgVisitMinutes: 90,
  }),
  makePlace({
    id: 'place_tower',
    slug: 'cairo-tower',
    name: { en: 'Cairo Tower' },
    area: 'zamalek',
    category: 'adventure',
    avgVisitMinutes: null,
  }),
];

describe('discover URL state', () => {
  it('returns empty defaults for an empty query string', () => {
    expect(parseDiscoverState(new URLSearchParams())).toEqual({
      filters: EMPTY_DISCOVER_FILTERS,
      context: EMPTY_DISCOVER_CONTEXT,
    });
  });

  it('parses and trims valid filters', () => {
    const state = parseDiscoverState(
      new URLSearchParams(
        'q=%20museum%20&category=history&area=giza&duration=2-4h&from=2026-10-14&to=2026-10-22&travelers=2',
      ),
    );

    expect(state).toEqual({
      filters: {
        q: 'museum',
        category: 'history',
        area: 'giza',
        duration: '2-4h',
      },
      context: {
        from: '2026-10-14',
        to: '2026-10-22',
        travelers: 2,
      },
    });
  });

  it('ignores invalid and repeated filter values safely', () => {
    const state = parseDiscoverState(
      new URLSearchParams(
        'q=first&q=second&category=invalid&area=invalid&duration=invalid&travelers=0',
      ),
    );

    expect(state.filters).toEqual({
      q: 'first',
      category: null,
      area: null,
      duration: null,
    });
    expect(state.context.travelers).toBeNull();
  });

  it('validates ISO dates and date order', () => {
    expect(normalizeContext({ from: '2026-02-30', to: '2026-03-02' })).toEqual({
      from: null,
      to: '2026-03-02',
      travelers: null,
    });

    expect(normalizeContext({ from: '2026-10-22', to: '2026-10-14' })).toEqual({
      from: '2026-10-22',
      to: null,
      travelers: null,
    });

    expect(normalizeContext({ from: '2026-10-14', to: '2026-10-22' })).toEqual({
      from: '2026-10-14',
      to: '2026-10-22',
      travelers: null,
    });
  });

  it('accepts only positive safe-integer traveler counts', () => {
    expect(normalizeContext({ travelers: '2' }).travelers).toBe(2);
    expect(normalizeContext({ travelers: 2 }).travelers).toBe(2);
    expect(normalizeContext({ travelers: '0' }).travelers).toBeNull();
    expect(normalizeContext({ travelers: '-1' }).travelers).toBeNull();
    expect(normalizeContext({ travelers: '1.5' }).travelers).toBeNull();
    expect(normalizeContext({ travelers: 'not-a-number' }).travelers).toBeNull();
    expect(normalizeContext({ travelers: '9007199254740992' }).travelers).toBeNull();
  });

  it('serializes values in a stable order and omits defaults', () => {
    const params = serializeDiscoverState({
      filters: {
        q: 'islamic cairo',
        category: 'culture',
        area: 'islamic-cairo',
        duration: 'under-2h',
      },
      context: {
        from: '2026-10-14',
        to: '2026-10-22',
        travelers: 2,
      },
    });

    expect(params.toString()).toBe(
      'q=islamic+cairo&category=culture&area=islamic-cairo&duration=under-2h&from=2026-10-14&to=2026-10-22&travelers=2',
    );
  });

  it('round-trips parsed state through serialization', () => {
    const original = parseDiscoverState(
      new URLSearchParams(
        'q=museum&category=history&area=giza&duration=2-4h&from=2026-10-14&to=2026-10-22&travelers=3',
      ),
    );
    const roundTripped = parseDiscoverState(serializeDiscoverState(original));

    expect(roundTripped).toEqual(original);
  });

  it('builds Discover links with sanitized filters and context', () => {
    expect(createDiscoverHref()).toBe('/discover');
    expect(
      createDiscoverHref({
        filters: { q: ' museum ', category: 'history' },
        context: { from: '2026-10-14', to: '2026-10-22', travelers: '2' },
      }),
    ).toBe('/discover?q=museum&category=history&from=2026-10-14&to=2026-10-22&travelers=2');
    expect(
      createDiscoverHref({
        context: { from: '2026-10-22', to: '2026-10-14' },
      }),
    ).toBe('/discover?from=2026-10-22');
  });

  it('detects active filters', () => {
    expect(hasActiveFilters(EMPTY_DISCOVER_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...EMPTY_DISCOVER_FILTERS, q: 'museum' })).toBe(true);
    expect(hasActiveFilters({ ...EMPTY_DISCOVER_FILTERS, category: 'history' })).toBe(true);
  });
});

describe('discover filtering', () => {
  it('searches names and area labels case-insensitively', () => {
    expect(filterPlaces(places, { ...EMPTY_DISCOVER_FILTERS, q: 'MUSEUM' })).toHaveLength(1);
    expect(filterPlaces(places, { ...EMPTY_DISCOVER_FILTERS, q: 'khan el-khalili' })).toEqual([
      places[2],
    ]);
    expect(filterPlaces(places, { ...EMPTY_DISCOVER_FILTERS, q: 'khan el khalili' })).toEqual([
      places[2],
    ]);
    expect(filterPlaces(places, { ...EMPTY_DISCOVER_FILTERS, q: 'islamic cairo' })).toEqual([
      places[2],
    ]);
    expect(filterPlaces(places, { ...EMPTY_DISCOVER_FILTERS, q: 'islamic-cairo' })).toEqual([
      places[2],
    ]);
    expect(filterPlaces(places, { ...EMPTY_DISCOVER_FILTERS, q: 'giza' })).toEqual([
      places[0],
      places[1],
    ]);
  });

  it('filters by category and area together', () => {
    expect(
      filterPlaces(places, {
        ...EMPTY_DISCOVER_FILTERS,
        category: 'history',
        area: 'giza',
      }),
    ).toEqual([places[0], places[1]]);

    expect(
      filterPlaces(places, {
        ...EMPTY_DISCOVER_FILTERS,
        category: 'culture',
        area: 'giza',
      }),
    ).toEqual([]);
  });

  it('keeps unknown durations only when no duration filter is selected', () => {
    expect(filterPlaces(places, EMPTY_DISCOVER_FILTERS)).toHaveLength(4);
    expect(filterPlaces(places, { ...EMPTY_DISCOVER_FILTERS, duration: 'under-2h' })).toEqual([
      places[2],
    ]);
    expect(filterPlaces(places, { ...EMPTY_DISCOVER_FILTERS, duration: '2-4h' })).toEqual([
      places[0],
      places[1],
    ]);
    expect(filterPlaces(places, { ...EMPTY_DISCOVER_FILTERS, duration: 'over-4h' })).toEqual([]);
  });

  it('applies duration boundaries exactly', () => {
    expect(matchesDuration(119, 'under-2h')).toBe(true);
    expect(matchesDuration(120, 'under-2h')).toBe(false);
    expect(matchesDuration(120, '2-4h')).toBe(true);
    expect(matchesDuration(240, '2-4h')).toBe(true);
    expect(matchesDuration(241, '2-4h')).toBe(false);
    expect(matchesDuration(241, 'over-4h')).toBe(true);
    expect(matchesDuration(null, 'over-4h')).toBe(false);
    expect(matchesDuration(null, null)).toBe(true);
  });

  it('preserves catalog order and tolerates null metadata', () => {
    const result = filterPlaces(places, { ...EMPTY_DISCOVER_FILTERS, q: 'a' });

    expect(result.map((place) => place.id)).toEqual([
      'place_pyramids',
      'place_museum',
      'place_khan',
      'place_tower',
    ]);
    expect(result.every((place) => place.description === null)).toBe(true);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterPlaces(places, { ...EMPTY_DISCOVER_FILTERS, q: 'nothing here' })).toEqual([]);
  });
});
