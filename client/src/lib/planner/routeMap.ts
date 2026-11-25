import type { PlaceCategory } from '../../types';

/**
 * Data behind the planner's route map. Cities and the interests they match come from the
 * demo place catalog (services/mock/seed/places.ts): a city is listed for an interest when the
 * catalog has at least one place there in that category. It is a preview of where matching
 * places are, not a promise of the generated itinerary.
 */

export type RouteCityId =
  'cairo' | 'alexandria' | 'luxor' | 'aswan' | 'siwa' | 'red-sea' | 'sinai' | 'western-desert';

export interface RouteCity {
  id: RouteCityId;
  lat: number;
  lon: number;
  interests: readonly PlaceCategory[];
  /** Label placement in map units. */
  label: { dx: number; dy: number; anchor: 'start' | 'end' | 'middle' };
}

export const ROUTE_CITIES: readonly RouteCity[] = [
  {
    id: 'cairo',
    lat: 30.04,
    lon: 31.24,
    interests: ['history', 'culture', 'adventure'],
    label: { dx: 14, dy: -10, anchor: 'start' },
  },
  {
    id: 'alexandria',
    lat: 31.2,
    lon: 29.92,
    interests: ['history', 'culture'],
    label: { dx: -12, dy: -10, anchor: 'end' },
  },
  {
    id: 'luxor',
    lat: 25.7,
    lon: 32.64,
    interests: ['history'],
    label: { dx: 14, dy: 4, anchor: 'start' },
  },
  {
    id: 'aswan',
    lat: 24.09,
    lon: 32.9,
    interests: ['history', 'adventure'],
    label: { dx: 14, dy: 12, anchor: 'start' },
  },
  {
    id: 'siwa',
    lat: 29.2,
    lon: 25.52,
    interests: ['history', 'adventure'],
    label: { dx: 0, dy: 24, anchor: 'middle' },
  },
  {
    id: 'red-sea',
    lat: 27.25,
    lon: 33.82,
    interests: ['adventure'],
    label: { dx: 14, dy: 4, anchor: 'start' },
  },
  {
    id: 'sinai',
    lat: 28.55,
    lon: 34.25,
    interests: ['adventure'],
    label: { dx: 14, dy: -4, anchor: 'start' },
  },
  {
    id: 'western-desert',
    lat: 27.25,
    lon: 28.2,
    interests: ['adventure'],
    label: { dx: 0, dy: 24, anchor: 'middle' },
  },
];

/** Map units: one degree of longitude is 50 wide, one of latitude is 56 tall. */
export const MAP_BOUNDS = { minLon: 25, maxLon: 36.6, maxLat: 31.8, minLat: 23 } as const;
export const MAP_WIDTH = (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon) * 50;
export const MAP_HEIGHT = (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat) * 56;

export function project(lat: number, lon: number): { x: number; y: number } {
  return {
    x: (lon - MAP_BOUNDS.minLon) * 50,
    y: (MAP_BOUNDS.maxLat - lat) * 56,
  };
}

/** Coarse outline of Egypt (lat, lon). Only used to place the dot grid. */
const OUTLINE: ReadonlyArray<readonly [number, number]> = [
  [31.57, 25.0],
  [31.35, 27.2],
  [31.2, 29.9],
  [31.5, 30.4],
  [31.5, 31.8],
  [31.27, 32.3],
  [31.23, 34.25],
  [29.5, 34.9],
  [28.0, 34.5],
  [27.73, 34.25],
  [29.05, 33.1],
  [29.95, 32.55],
  [29.6, 32.35],
  [28.35, 33.1],
  [27.25, 33.8],
  [26.1, 34.2],
  [24.5, 35.2],
  [23.2, 35.5],
  [22.0, 36.9],
  [22.0, 25.0],
];

/** River Nile and the start of the delta. */
export const NILE: ReadonlyArray<readonly [number, number]> = [
  [22.35, 31.6],
  [23.97, 32.88],
  [24.09, 32.9],
  [25.0, 32.8],
  [25.7, 32.64],
  [26.16, 32.72],
  [26.56, 31.7],
  [27.18, 31.18],
  [28.1, 30.75],
  [29.0, 31.1],
  [30.04, 31.24],
  [30.5, 31.1],
  [31.1, 30.4],
  [31.45, 30.35],
];

function inside(lat: number, lon: number): boolean {
  let c = false;
  for (let i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) {
    const [yi, xi] = OUTLINE[i];
    const [yj, xj] = OUTLINE[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

export interface LandDot {
  x: number;
  y: number;
}

/** Dot grid covering the land. Computed once. */
export const LAND_DOTS: readonly LandDot[] = (() => {
  const dots: LandDot[] = [];
  for (let y = 4; y < MAP_HEIGHT; y += 9) {
    for (let x = 4; x < MAP_WIDTH; x += 9) {
      const lon = MAP_BOUNDS.minLon + x / 50;
      const lat = MAP_BOUNDS.maxLat - y / 56;
      if (inside(lat, lon)) dots.push({ x, y });
    }
  }
  return dots;
})();

/** Interests that have at least one catalog place in the city. Cairo is always the hub. */
export function getRouteCities(interests: readonly PlaceCategory[]): RouteCity[] {
  return ROUTE_CITIES.filter(
    (city) =>
      city.id === 'cairo' || city.interests.some((interest) => interests.includes(interest)),
  );
}

/** A sensible loop: Cairo first, then west, then up the Nile, then the Red Sea and Sinai. */
const TOUR_ORDER: readonly RouteCityId[] = [
  'cairo',
  'alexandria',
  'siwa',
  'western-desert',
  'luxor',
  'aswan',
  'red-sea',
  'sinai',
];

/** Visit order for the selected cities. Cairo is always first. */
export function orderRoute(cities: readonly RouteCity[]): RouteCity[] {
  return [...cities].sort((a, b) => TOUR_ORDER.indexOf(a.id) - TOUR_ORDER.indexOf(b.id));
}
