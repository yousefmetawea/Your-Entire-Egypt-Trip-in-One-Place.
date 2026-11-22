import type { PlaceId, Trip } from '../../types';

export function findDraftTrip(trips: readonly Trip[]): Trip | null {
  return trips.find((trip) => trip.status === 'draft') ?? null;
}

export function getDraftPlaceIds(trip: Trip | null): PlaceId[] {
  if (!trip) {
    return [];
  }

  const ids = new Set<PlaceId>(trip.savedPlaceIds);

  for (const day of trip.days) {
    for (const activity of day.activities) {
      if (activity.source.type === 'place') {
        ids.add(activity.source.placeId);
      }
    }
  }

  return [...ids];
}
