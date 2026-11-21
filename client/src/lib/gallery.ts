import type { ImageAsset } from '../types';

export type GalleryLayout = 'empty' | 'single' | 'pair' | 'mosaic';

export type GalleryKeyboardAction = 'previous' | 'next' | 'first' | 'last';

export const GALLERY_VISIBLE_LIMIT = 3;

export function getGalleryLayout(count: number): GalleryLayout {
  if (count <= 0) {
    return 'empty';
  }

  if (count === 1) {
    return 'single';
  }

  if (count === 2) {
    return 'pair';
  }

  return 'mosaic';
}

export function getVisibleGalleryImages(
  images: readonly ImageAsset[],
  limit = GALLERY_VISIBLE_LIMIT,
): ImageAsset[] {
  return images.slice(0, Math.max(0, limit));
}

export function getNextImageIndex(index: number, count: number, step: 1 | -1): number {
  if (count <= 0) {
    return 0;
  }

  return (index + step + count) % count;
}

export function getGalleryKeyboardAction(
  key: string,
  isRtl: boolean,
): GalleryKeyboardAction | null {
  if (key === 'Home') {
    return 'first';
  }

  if (key === 'End') {
    return 'last';
  }

  if (key === 'ArrowLeft') {
    return isRtl ? 'next' : 'previous';
  }

  if (key === 'ArrowRight') {
    return isRtl ? 'previous' : 'next';
  }

  return null;
}
