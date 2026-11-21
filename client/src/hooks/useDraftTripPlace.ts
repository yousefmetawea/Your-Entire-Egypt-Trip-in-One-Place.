import { useCallback, useEffect, useRef, useState } from 'react';
import type { IsoDate, Place, PlaceId, Trip, TripDay } from '../types';
import { services } from '../services';

export type DraftTripPlaceStatus = 'checking' | 'idle' | 'adding' | 'added' | 'in-trip' | 'error';

export interface DraftTripPlaceState {
  status: DraftTripPlaceStatus;
  tripTitle: string | null;
  dayNumber: number | null;
  dayDate: IsoDate | null;
  createdTrip: boolean;
}

export interface DraftTripPlaceResult extends DraftTripPlaceState {
  add: () => Promise<void>;
}

interface DraftTripPlaceStateWithKey extends DraftTripPlaceState {
  placeId: PlaceId;
}

function findPlaceDay(trip: Trip, placeId: PlaceId): { day: TripDay; index: number } | null {
  for (const [index, day] of trip.days.entries()) {
    const exists = day.activities.some(
      (activity) => activity.source.type === 'place' && activity.source.placeId === placeId,
    );

    if (exists) {
      return { day, index };
    }
  }

  return null;
}

function emptyState(status: DraftTripPlaceStatus): DraftTripPlaceState {
  return {
    status,
    tripTitle: null,
    dayNumber: null,
    dayDate: null,
    createdTrip: false,
  };
}

function initialState(placeId: PlaceId, status: DraftTripPlaceStatus): DraftTripPlaceStateWithKey {
  return { placeId, ...emptyState(status) };
}

export function useDraftTripPlace(place: Place): DraftTripPlaceResult {
  const placeId = place.id;
  const [state, setState] = useState<DraftTripPlaceStateWithKey>(() =>
    initialState(placeId, 'checking'),
  );
  const inFlightRef = useRef(false);
  const activePlaceRef = useRef(placeId);
  const current = state.placeId === placeId ? state : initialState(placeId, 'checking');

  useEffect(() => {
    let active = true;

    activePlaceRef.current = placeId;
    inFlightRef.current = false;

    services.trips
      .listMine()
      .then((trips) => {
        if (!active) {
          return;
        }

        const draft = trips.find((trip) => trip.status === 'draft');
        const existing = draft ? findPlaceDay(draft, placeId) : null;

        setState({
          placeId,
          status: existing ? 'in-trip' : 'idle',
          tripTitle: draft?.title ?? null,
          dayNumber: existing ? existing.index + 1 : null,
          dayDate: existing?.day.date ?? null,
          createdTrip: false,
        });
      })
      .catch(() => {
        if (active) {
          setState(initialState(placeId, 'idle'));
        }
      });

    return () => {
      active = false;
    };
  }, [placeId]);

  const add = useCallback(async () => {
    if (inFlightRef.current) {
      return;
    }

    inFlightRef.current = true;
    setState((currentState) =>
      currentState.placeId === placeId
        ? { ...currentState, status: 'adding', createdTrip: false }
        : initialState(placeId, 'adding'),
    );

    try {
      const result = await services.trips.addPlaceToDraft(placeId, place);

      if (activePlaceRef.current !== placeId) {
        return;
      }

      const dayIndex = result.trip.days.findIndex((day) => day.id === result.dayId);
      const day = dayIndex >= 0 ? result.trip.days[dayIndex] : undefined;

      setState({
        placeId,
        status: result.added ? 'added' : 'in-trip',
        tripTitle: result.trip.title,
        dayNumber: dayIndex >= 0 ? dayIndex + 1 : null,
        dayDate: day?.date ?? null,
        createdTrip: result.added && result.createdTrip,
      });
    } catch {
      if (activePlaceRef.current === placeId) {
        setState((currentState) =>
          currentState.placeId === placeId
            ? { ...currentState, status: 'error', createdTrip: false }
            : currentState,
        );
      }
    } finally {
      inFlightRef.current = false;
    }
  }, [place, placeId]);

  return {
    status: current.status,
    tripTitle: current.tripTitle,
    dayNumber: current.dayNumber,
    dayDate: current.dayDate,
    createdTrip: current.createdTrip,
    add,
  };
}
