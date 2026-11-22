import { useCallback, useEffect, useState } from 'react';
import type { Place, Trip } from '../types';
import { isServiceError, services } from '../services';

export type TripLoadStatus = 'loading' | 'ready' | 'not-found' | 'error';

export interface TripResult {
  trip: Trip | null;
  places: Place[];
  status: TripLoadStatus;
  retry: () => void;
}

interface TripState {
  id: string;
  trip: Trip | null;
  places: Place[];
  status: TripLoadStatus;
}

function emptyState(id: string, status: TripLoadStatus): TripState {
  return { id, trip: null, places: [], status };
}

export function useTrip(id: string): TripResult {
  const [state, setState] = useState<TripState>(() => emptyState(id, 'loading'));
  const [attempt, setAttempt] = useState(0);
  const current = state.id === id ? state : emptyState(id, 'loading');

  useEffect(() => {
    let active = true;

    Promise.all([services.trips.getById(id), services.places.list()])
      .then(([trip, places]) => {
        if (active) {
          setState({ id, trip, places, status: 'ready' });
        }
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }

        const status: TripLoadStatus =
          isServiceError(error) && error.code === 'NOT_FOUND' ? 'not-found' : 'error';

        setState(emptyState(id, status));
      });

    return () => {
      active = false;
    };
  }, [attempt, id]);

  const retry = useCallback(() => {
    setState(emptyState(id, 'loading'));
    setAttempt((currentAttempt) => currentAttempt + 1);
  }, [id]);

  return {
    trip: current.trip,
    places: current.places,
    status: current.status,
    retry,
  };
}
