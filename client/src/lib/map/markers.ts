import type { Place, PlaceCategory, PlaceId, TripDay } from '../../types';

export interface MappedStop {
  activityId: string;
  order: number;
  lat: number;
  lng: number;
  title: string;
  category: PlaceCategory;
  categoryGlyph: string;
  placeId: PlaceId | null;
  placeSlug: string | null;
  startTime: string | null;
  durationMin: number | null;
}

/**
 * Returns a 1-character glyph / initial badge for each place category.
 * History: 'H', Culture: 'C', Adventure: 'A', Food: 'F', default: '•'.
 */
export function getCategoryGlyph(category: PlaceCategory): string {
  switch (category) {
    case 'history':
      return 'H';
    case 'culture':
      return 'C';
    case 'adventure':
      return 'A';
    case 'food':
      return 'F';
    default:
      return '•';
  }
}

/**
 * Extracts mapped stops with valid geographic coordinates from a trip day.
 * Pure logic: skips custom activities with no coordinates, and places with null coordinates.
 * Places with null coordinates are never turned into markers.
 */
export function extractMappedStops(
  day: TripDay,
  placesById: ReadonlyMap<PlaceId, Place>,
): MappedStop[] {
  const stops: MappedStop[] = [];

  day.activities.forEach((activity, index) => {
    if (activity.source.type !== 'place') {
      return;
    }

    const place = placesById.get(activity.source.placeId);
    if (!place || !place.location) {
      return;
    }

    // Coordinates must be valid finite numbers
    if (
      typeof place.location.lat !== 'number' ||
      typeof place.location.lng !== 'number' ||
      !Number.isFinite(place.location.lat) ||
      !Number.isFinite(place.location.lng)
    ) {
      return;
    }

    const title = place.name.en;

    stops.push({
      activityId: activity.id,
      order: index + 1,
      lat: place.location.lat,
      lng: place.location.lng,
      title,
      category: place.category,
      categoryGlyph: getCategoryGlyph(place.category),
      placeId: place.id,
      placeSlug: place.slug,
      startTime: activity.startTime,
      durationMin: activity.durationMin ?? place.avgVisitMinutes,
    });
  });

  return stops;
}

/**
 * Checks how many activities in a day lack mapped coordinates.
 */
export function countUnmappedActivities(
  day: TripDay,
  placesById: ReadonlyMap<PlaceId, Place>,
): number {
  return day.activities.filter((activity) => {
    if (activity.source.type !== 'place') {
      return true;
    }
    const place = placesById.get(activity.source.placeId);
    return !place || !place.location;
  }).length;
}
