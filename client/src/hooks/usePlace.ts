import { useCallback, useEffect, useState } from 'react';
import type { Place } from '../types';
import { isServiceError, services } from '../services';

export type PlaceStatus = 'loading' | 'ready' | 'not-found' | 'error';

export interface PlaceResult {
  place: Place | null;
  status: PlaceStatus;
  isFixture: boolean;
  retry: () => void;
}

interface PlaceState {
  slug: string;
  place: Place | null;
  status: PlaceStatus;
  isFixture: boolean;
}

interface LoadedPlace {
  place: Place;
  isFixture: boolean;
}

async function loadPlace(slug: string): Promise<LoadedPlace> {
  if (import.meta.env.DEV) {
    const { DEV_PLACE_FIXTURE_SLUG, getDevPlaceFixture } = await import('../dev/placeFixture');

    if (slug === DEV_PLACE_FIXTURE_SLUG) {
      return { place: getDevPlaceFixture(), isFixture: true };
    }
  }

  return { place: await services.places.getBySlug(slug), isFixture: false };
}

export function usePlace(slug: string): PlaceResult {
  const [state, setState] = useState<PlaceState>({
    slug,
    place: null,
    status: 'loading',
    isFixture: false,
  });
  const [attempt, setAttempt] = useState(0);
  const current =
    state.slug === slug
      ? state
      : { slug, place: null, status: 'loading' as const, isFixture: false };

  useEffect(() => {
    let active = true;

    loadPlace(slug)
      .then(({ place, isFixture }) => {
        if (active) {
          setState({ slug, place, status: 'ready', isFixture });
        }
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }

        const status = isServiceError(error) && error.code === 'NOT_FOUND' ? 'not-found' : 'error';

        setState({ slug, place: null, status, isFixture: false });
      });

    return () => {
      active = false;
    };
  }, [attempt, slug]);

  const retry = useCallback(() => {
    setState({ slug, place: null, status: 'loading', isFixture: false });
    setAttempt((currentAttempt) => currentAttempt + 1);
  }, [slug]);

  return {
    place: current.place,
    status: current.status,
    isFixture: current.isFixture,
    retry,
  };
}
