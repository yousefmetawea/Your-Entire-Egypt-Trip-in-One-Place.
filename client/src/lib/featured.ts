import type { Place } from '../types';

export const FEATURED_PLACE_SLUGS = [
  'pyramids-of-giza',
  'grand-egyptian-museum',
  'khan-el-khalili',
  'hanging-church',
  'cairo-tower',
] as const;

export function selectFeaturedPlaces(places: readonly Place[]): Place[] {
  const placesBySlug = new Map(places.map((place) => [place.slug, place] as const));

  return FEATURED_PLACE_SLUGS.flatMap((slug) => {
    const place = placesBySlug.get(slug);
    return place ? [place] : [];
  });
}
