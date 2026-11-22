import type { GeoPoint, Place, PlaceId } from '../../types';

export const NEARBY_RADIUS_KM = 1.0;

export interface NearbyPlaceDistance {
  place: Place;
  distanceKm: number;
}

/**
 * Computes great-circle distance between two geographic points using Haversine formula.
 * Pure function, tested, no external side-effects.
 */
export function calculateHaversineDistanceKm(p1: GeoPoint, p2: GeoPoint): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Formats straight-line distance in kilometers.
 * e.g. 0.4 km, 1.2 km
 */
export function formatStraightLineDistance(distanceKm: number): string {
  if (distanceKm < 0.1) {
    return '< 0.1 km';
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Finds nearby places based on Option C:
 * 1. If place has non-empty nearbyPlaceIds, map them in that order.
 * 2. Otherwise, if the place has verified location coordinates, compute straight-line
 *    distances to all other places with verified coordinates within NEARBY_RADIUS_KM (1 km),
 *    sorted ascending by straight-line distance.
 */
export function findNearbyPlaces(
  targetPlace: Place,
  allPlaces: readonly Place[],
  radiusKm: number = NEARBY_RADIUS_KM,
): NearbyPlaceDistance[] {
  // If explicitly authored nearby IDs exist, resolve them
  if (targetPlace.nearbyPlaceIds.length > 0) {
    const byId = new Map<PlaceId, Place>(allPlaces.map((p) => [p.id, p]));
    const results: NearbyPlaceDistance[] = [];

    for (const id of targetPlace.nearbyPlaceIds) {
      const found = byId.get(id);
      if (found) {
        const distanceKm =
          targetPlace.location && found.location
            ? calculateHaversineDistanceKm(targetPlace.location, found.location)
            : 0;
        results.push({ place: found, distanceKm });
      }
    }
    return results;
  }

  // Otherwise compute straight-line distance if target place has coordinates
  if (!targetPlace.location) {
    return [];
  }

  const matches: NearbyPlaceDistance[] = [];

  for (const place of allPlaces) {
    if (place.id === targetPlace.id || !place.location) {
      continue;
    }

    const distanceKm = calculateHaversineDistanceKm(targetPlace.location, place.location);
    if (distanceKm <= radiusKm) {
      matches.push({ place, distanceKm });
    }
  }

  matches.sort((a, b) => a.distanceKm - b.distanceKm);
  return matches;
}
