import { describe, expect, it } from 'vitest';
import { getPlaceImageSources, PLACE_LOCAL_IMAGES } from './placeImages';

describe('placeImages', () => {
  it('resolves primary local image path for known place slug', () => {
    const sources = getPlaceImageSources(
      { slug: 'pyramids-of-giza' },
      'https://images.unsplash.com/remote.jpg',
    );
    expect(sources.primary).toBe('/images/places/pyramids-of-giza.jpg');
    expect(sources.fallback).toBe('https://images.unsplash.com/remote.jpg');
  });

  it('resolves primary local image path when given place id', () => {
    const sources = getPlaceImageSources(
      { id: 'place_grand_egyptian_museum' },
      'https://images.unsplash.com/remote.jpg',
    );
    expect(sources.primary).toBe('/images/places/grand-egyptian-museum.jpg');
    expect(sources.fallback).toBe('https://images.unsplash.com/remote.jpg');
  });

  it('resolves hero deck IDs correctly', () => {
    const sources = getPlaceImageSources({ id: 'luxor-karnak' });
    expect(sources.primary).toBe('/images/places/karnak-temple.jpg');
  });

  it('falls back to remoteSrc or placeholder for unknown places', () => {
    const withRemote = getPlaceImageSources({ slug: 'unknown-place' }, 'https://example.com/test.jpg');
    expect(withRemote.primary).toBe('https://example.com/test.jpg');
    expect(withRemote.fallback).toBe('/images/placeholder.svg');

    const empty = getPlaceImageSources();
    expect(empty.primary).toBe('/images/placeholder.svg');
    expect(empty.fallback).toBe('/images/placeholder.svg');
  });

  it('ensures all 26 places in catalog have valid mappings', () => {
    expect(Object.keys(PLACE_LOCAL_IMAGES)).toHaveLength(26);
    for (const [slug, path] of Object.entries(PLACE_LOCAL_IMAGES)) {
      expect(path).toBe(`/images/places/${slug}.jpg`);
    }
  });
});
