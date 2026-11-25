/**
 * Presentational data for the animated route map.
 * Cities, legs and modes are illustrative. Distances come from the real
 * coordinates, and times are rough estimates from typical speeds. Nothing
 * here reads or changes the catalog, trips or server.
 */
export type RouteMode = 'flight' | 'train' | 'bus';

export interface RouteCity {
  id: string;
  name: { en: string; ar: string };
  lat: number;
  lng: number;
}

export const CITIES: Record<string, RouteCity> = {
  cairo: { id: 'cairo', name: { en: 'Cairo', ar: 'القاهرة' }, lat: 30.0444, lng: 31.2357 },
  luxor: { id: 'luxor', name: { en: 'Luxor', ar: 'الأقصر' }, lat: 25.6872, lng: 32.6396 },
  aswan: { id: 'aswan', name: { en: 'Aswan', ar: 'أسوان' }, lat: 24.0889, lng: 32.8998 },
  redsea: { id: 'redsea', name: { en: 'Red Sea', ar: 'البحر الأحمر' }, lat: 27.228, lng: 33.845 },
  siwa: { id: 'siwa', name: { en: 'Siwa', ar: 'سيوة' }, lat: 29.2, lng: 25.52 },
};

export const DEFAULT_ROUTE = ['cairo', 'luxor', 'aswan', 'redsea'];

const LEG_MODE: Record<string, RouteMode> = {
  'cairo>luxor': 'flight',
  'luxor>aswan': 'train',
  'aswan>redsea': 'bus',
  'cairo>siwa': 'bus',
};

export interface RouteLeg {
  index: number;
  from: RouteCity;
  to: RouteCity;
  mode: RouteMode;
  km: number;
  minutes: number;
  points: [number, number][];
}

export interface BuiltRoute {
  cities: RouteCity[];
  legs: RouteLeg[];
  stayCityId: string | null;
}

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function estimateMinutes(mode: RouteMode, km: number) {
  if (mode === 'flight') return Math.round(50 + (km / 700) * 60);
  if (mode === 'train') return Math.round((km / 70) * 60);
  return Math.round((km / 65) * 60);
}

/** Quadratic arc between two cities, bulging to one side for a clear curve. */
export function arcPoints(a: RouteCity, b: RouteCity, bulge: number, n = 64): [number, number][] {
  const mx = (a.lat + b.lat) / 2;
  const my = (a.lng + b.lng) / 2;
  const dx = b.lat - a.lat;
  const dy = b.lng - a.lng;
  let px = -dy;
  let py = dx;
  if (px + py < 0) {
    px = -px;
    py = -py;
  }
  const cx = mx + px * bulge;
  const cy = my + py * bulge;
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    pts.push([
      u * u * a.lat + 2 * u * t * cx + t * t * b.lat,
      u * u * a.lng + 2 * u * t * cy + t * t * b.lng,
    ]);
  }
  return pts;
}

export function nearestCity(loc: { lat: number; lng: number }) {
  let best = CITIES.cairo;
  let bestD = Infinity;
  for (const c of Object.values(CITIES)) {
    const d = haversineKm(loc, c);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}

export function buildRoute(stayLocation: { lat: number; lng: number } | null): BuiltRoute {
  const ids = [...DEFAULT_ROUTE];
  let stayCityId: string | null = null;
  if (stayLocation) {
    stayCityId = nearestCity(stayLocation).id;
    // A stay outside the default circuit becomes a branch leg from Cairo.
    if (!ids.includes(stayCityId)) ids.push(stayCityId);
  }
  const cities = ids.map((id) => CITIES[id]);
  const legs: RouteLeg[] = [];
  for (let i = 1; i < ids.length; i++) {
    const isBranch = !DEFAULT_ROUTE.includes(ids[i]);
    const from = isBranch ? CITIES.cairo : cities[i - 1];
    const to = cities[i];
    const mode = LEG_MODE[`${from.id}>${to.id}`] ?? 'bus';
    const km = Math.round(haversineKm(from, to));
    legs.push({
      index: legs.length,
      from,
      to,
      mode,
      km,
      minutes: estimateMinutes(mode, km),
      points: arcPoints(from, to, mode === 'flight' ? 0.22 : 0.12),
    });
  }
  return { cities, legs, stayCityId };
}
