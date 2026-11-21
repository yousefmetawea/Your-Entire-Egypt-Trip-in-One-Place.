import { useCallback, useEffect, useState } from 'react';
import type { Place, ReadyMadeTrip } from '../types';
import { services } from '../services';

export type CatalogStatus = 'loading' | 'ready' | 'error';

export interface CatalogResult<T> {
  data: T[];
  status: CatalogStatus;
  retry: () => void;
}

function loadPlaces(): Promise<Place[]> {
  return services.places.list();
}

function loadReadyMadeTrips(): Promise<ReadyMadeTrip[]> {
  return services.readyMadeTrips.list();
}

function useCatalog<T>(load: () => Promise<T[]>): CatalogResult<T> {
  const [state, setState] = useState<{ data: T[]; status: CatalogStatus }>({
    data: [],
    status: 'loading',
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    load()
      .then((data) => {
        if (active) {
          setState({ data, status: 'ready' });
        }
      })
      .catch(() => {
        if (active) {
          setState({ data: [], status: 'error' });
        }
      });

    return () => {
      active = false;
    };
  }, [attempt, load]);

  const retry = useCallback(() => {
    setState({ data: [], status: 'loading' });
    setAttempt((current) => current + 1);
  }, []);

  return { ...state, retry };
}

export function usePlaces(): CatalogResult<Place> {
  return useCatalog(loadPlaces);
}

export function useReadyMadeTrips(): CatalogResult<ReadyMadeTrip> {
  return useCatalog(loadReadyMadeTrips);
}
