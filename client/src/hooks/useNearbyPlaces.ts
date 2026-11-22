import { useCallback, useEffect, useState } from 'react';
import type { Place } from '../types';
import { services } from '../services';
import { findNearbyPlaces, type NearbyPlaceDistance } from '../lib/map/distance';

export type NearbyPlacesStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface NearbyPlacesResult {
  placesWithDistance: NearbyPlaceDistance[];
  status: NearbyPlacesStatus;
  retry: () => void;
}

interface NearbyPlacesState {
  placeId: string | null;
  placesWithDistance: NearbyPlaceDistance[];
  status: NearbyPlacesStatus;
}

export function useNearbyPlaces(place: Place | null, limit = 6): NearbyPlacesResult {
  const [state, setState] = useState<NearbyPlacesState>({
    placeId: null,
    placesWithDistance: [],
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
          status: 'ready',
        });
      })
      .catch(() => {
        if (!active) return;
        setState({
          placeId: place.id,
          placesWithDistance: [],
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
    status: state.placeId === placeId ? state.status : 'loading',
    retry,
  };
}
