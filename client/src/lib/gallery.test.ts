import { describe, expect, it } from 'vitest';
import type { ImageAsset } from '../types';
import {
  GALLERY_VISIBLE_LIMIT,
  getGalleryKeyboardAction,
  getGalleryLayout,
  getNextImageIndex,
  getVisibleGalleryImages,
} from './gallery';

function image(index: number): ImageAsset {
  return {
    src: `/image-${index}.jpg`,
    alt: { en: `Image ${index}` },
  };
}

const images = [image(1), image(2), image(3), image(4)];

describe('gallery helpers', () => {
  it('chooses a layout from the image count', () => {
    expect(getGalleryLayout(0)).toBe('empty');
    expect(getGalleryLayout(1)).toBe('single');
    expect(getGalleryLayout(2)).toBe('pair');
    expect(getGalleryLayout(3)).toBe('mosaic');
    expect(getGalleryLayout(9)).toBe('mosaic');
  });

  it('shows at most the visible limit and supports explicit limits', () => {
    expect(GALLERY_VISIBLE_LIMIT).toBe(3);
    expect(getVisibleGalleryImages(images)).toHaveLength(3);
    expect(getVisibleGalleryImages(images, 2)).toEqual([images[0], images[1]]);
    expect(getVisibleGalleryImages(images, 0)).toEqual([]);
  });

  it('wraps previous and next indexes', () => {
    expect(getNextImageIndex(0, 4, 1)).toBe(1);
    expect(getNextImageIndex(3, 4, 1)).toBe(0);
    expect(getNextImageIndex(0, 4, -1)).toBe(3);
    expect(getNextImageIndex(2, 0, 1)).toBe(0);
  });

  it('maps arrow keys to LTR and RTL navigation actions', () => {
    expect(getGalleryKeyboardAction('ArrowLeft', false)).toBe('previous');
    expect(getGalleryKeyboardAction('ArrowRight', false)).toBe('next');
    expect(getGalleryKeyboardAction('ArrowLeft', true)).toBe('next');
    expect(getGalleryKeyboardAction('ArrowRight', true)).toBe('previous');
    expect(getGalleryKeyboardAction('Home', false)).toBe('first');
    expect(getGalleryKeyboardAction('End', true)).toBe('last');
    expect(getGalleryKeyboardAction('Escape', false)).toBeNull();
  });
});
