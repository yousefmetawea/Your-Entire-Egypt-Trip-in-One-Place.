import { describe, expect, it } from 'vitest';
import { seedPlaces } from '../services/mock/seed';
import { FEATURED_PLACE_SLUGS, selectFeaturedPlaces } from './featured';

describe('featured places', () => {
  it('returns the approved allowlist in order', () => {
    const featured = selectFeaturedPlaces(seedPlaces);

    expect(FEATURED_PLACE_SLUGS).toEqual([
      'pyramids-of-giza',
      'karnak-temple',
      'grand-egyptian-museum',
      'philae-temple',
      'siwa-salt-lakes',
      'citadel-of-qaitbay',
    ]);
    expect(featured.map((place) => place.slug)).toEqual([...FEATURED_PLACE_SLUGS]);
  });

  it('skips missing slugs without failing', () => {
    const featured = selectFeaturedPlaces(
      seedPlaces.filter((place) => place.slug !== 'karnak-temple'),
    );

    expect(featured.map((place) => place.slug)).toEqual([
      'pyramids-of-giza',
      'grand-egyptian-museum',
      'philae-temple',
      'siwa-salt-lakes',
      'citadel-of-qaitbay',
    ]);
  });

  it('returns an empty list for an empty catalog', () => {
    expect(selectFeaturedPlaces([])).toEqual([]);
  });

  it('does not mutate the source collection', () => {
    const source = [...seedPlaces];
    const snapshot = [...source];

    selectFeaturedPlaces(source);

    expect(source).toEqual(snapshot);
  });
});
