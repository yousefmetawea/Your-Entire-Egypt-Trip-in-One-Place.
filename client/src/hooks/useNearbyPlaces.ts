import { useCallback, useEffect, useState } from 'react';
import type { Place, PlaceId } from '../types';
import { services } from '../services';

export type NearbyPlacesStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface NearbyPlacesResult {
  places: Place[];
  status: NearbyPlacesStatus;
  retry: () => void;
}

interface NearbyPlacesState {
  placeId: PlaceId | null;
  places: Place[];
  status: NearbyPlacesStatus;
}

function idleState(placeId: PlaceId | null): NearbyPlacesState {
  return { placeId, places: [], status: 'idle' };
}

export function useNearbyPlaces(place: Place | null, limit = 3): NearbyPlacesResult {
  const [state, setState] = useState<NearbyPlacesState>(() => idleState(null));
  const [attempt, setAttempt] = useState(0);
  const placeId = place?.id ?? null;
  const nearbyIdsKey = place?.nearbyPlaceIds.slice(0, limit).join('|') ?? '';
  const current =
    state.placeId === placeId
      ? state
      : {
          placeId,
          places: [],
          status: nearbyIdsKey ? ('loading' as const) : ('idle' as const),
        };

  useEffect(() => {
    if (!placeId || !nearbyIdsKey) {
      return;
    }

    let active = true;
    const ids = nearbyIdsKey.split('|');

    Promise.all(ids.map((id) => services.places.getById(id)))
      .then((places) => {
        if (active) {
          setState({ placeId, places, status: 'ready' });
        }
      })
      .catch(() => {
        if (active) {
          setState({ placeId, places: [], status: 'error' });
        }
      });

    return () => {
      active = false;
    };
  }, [attempt, nearbyIdsKey, placeId]);

  const retry = useCallback(() => {
    if (!placeId || !nearbyIdsKey) {
      return;
    }

    setState({ placeId, places: [], status: 'loading' });
    setAttempt((currentAttempt) => currentAttempt + 1);
  }, [nearbyIdsKey, placeId]);

  return { places: current.places, status: current.status, retry };
}
