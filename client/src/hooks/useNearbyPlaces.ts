import { useCallback, useEffect, useState } from 'react';
import type { Place } from '../types';
import { services } from '../services';
import { findNearbyPlaces, type NearbyPlaceDistance } from '../lib/map/distance';

export type NearbyPlacesStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface NearbyPlacesResult {
  placesWithDistance: NearbyPlaceDistance[];
  /** Other places in the same area, used when nothing is within the radius. */
  areaPlaces: Place[];
  status: NearbyPlacesStatus;
  retry: () => void;
}

interface NearbyPlacesState {
  placeId: string | null;
  placesWithDistance: NearbyPlaceDistance[];
  areaPlaces: Place[];
  status: NearbyPlacesStatus;
}

export function useNearbyPlaces(place: Place | null, limit = 6): NearbyPlacesResult {
  const [state, setState] = useState<NearbyPlacesState>({
    placeId: null,
    placesWithDistance: [],
    areaPlaces: [],
    status: 'idle',
  });
  const [attempt, setAttempt] = useState(0);
  const placeId = place?.id ?? null;

  useEffect(() => {
    if (!place) {
      return;
    }

    let active = true;

    // Load full catalog to find nearby straight-line or authored places
    services.places
      .list()
      .then((allPlaces) => {
        if (!active) return;
        const matches = findNearbyPlaces(place, allPlaces).slice(0, limit);
        setState({
          placeId: place.id,
          placesWithDistance: matches,
          areaPlaces: allPlaces
            .filter((p) => p.id !== place.id && p.area === place.area)
            .slice(0, 3),
          status: 'ready',
        });
      })
      .catch(() => {
        if (!active) return;
        setState({
          placeId: place.id,
          placesWithDistance: [],
          areaPlaces: [],
          status: 'error',
        });
      });

    return () => {
      active = false;
    };
  }, [attempt, place, limit]);

  const retry = useCallback(() => {
    if (!placeId) return;
    setState((prev) => ({ ...prev, status: 'loading' }));
    setAttempt((c) => c + 1);
  }, [placeId]);

  return {
    placesWithDistance: state.placeId === placeId ? state.placesWithDistance : [],
    areaPlaces: state.placeId === placeId ? state.areaPlaces : [],
    status: state.placeId === placeId ? state.status : 'loading',
    retry,
  };
}
