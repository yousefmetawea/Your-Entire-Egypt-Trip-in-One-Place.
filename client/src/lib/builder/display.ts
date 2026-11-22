import type { Place, PlaceId, TripActivity } from '../../types';

export function getActivityTitle(activity: TripActivity, place?: Place | null): string | null {
  if (activity.source.type === 'custom') {
    return activity.source.title;
  }

  return place?.name.en ?? null;
}

export function getActivityPlace(
  activity: TripActivity,
  placesById: ReadonlyMap<PlaceId, Place>,
): Place | undefined {
  return activity.source.type === 'place' ? placesById.get(activity.source.placeId) : undefined;
}
