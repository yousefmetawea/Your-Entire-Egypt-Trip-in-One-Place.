import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { Place, Trip, TripDayId } from '../types';
import { createCustomActivity, createPlaceActivity } from '../lib/builder/activities';
import type { ActivityPatch, ItineraryEditorState } from '../lib/builder/editor';
import { createEditorState, getNextTripDay, itineraryEditorReducer } from '../lib/builder/editor';
import { MAX_TRIP_DAYS } from '../lib/planner/options';
import { services } from '../services';

export type ItinerarySaveStatus = 'saved' | 'saving' | 'error';

export interface CustomActivityFields {
  title: string;
  startTime: string | null;
  durationMin: number | null;
  estimatedCost: Parameters<typeof createCustomActivity>[0]['estimatedCost'];
  notes: string;
}

export interface TripEditorResult {
  trip: Trip;
  canUndo: boolean;
  canRedo: boolean;
  atDayLimit: boolean;
  saveStatus: ItinerarySaveStatus;
  retrySave: () => void;
  addPlace: (dayId: TripDayId, place: Place) => boolean;
  addCustomActivity: (dayId: TripDayId, fields: CustomActivityFields) => void;
  updateActivity: (dayId: TripDayId, activityId: string, patch: ActivityPatch) => void;
  removeActivity: (dayId: TripDayId, activityId: string) => void;
  moveActivity: (
    activityId: string,
    fromDayId: TripDayId,
    toDayId: TripDayId,
    toIndex: number,
  ) => void;
  renameTrip: (title: string) => void;
  addDay: () => string | null;
  removeLastDay: () => void;
  undo: () => void;
  redo: () => void;
}

function createInitialState(trip: Trip): ItineraryEditorState {
  return createEditorState(trip);
}

export function useTripEditor(initialTrip: Trip): TripEditorResult {
  const [state, dispatch] = useReducer(itineraryEditorReducer, initialTrip, createInitialState);
  const [saveStatus, setSaveStatus] = useState<ItinerarySaveStatus>('saved');
  const latestTripRef = useRef(initialTrip);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const saveSequenceRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const save = useCallback((trip: Trip): void => {
    latestTripRef.current = trip;
    const sequence = saveSequenceRef.current + 1;
    saveSequenceRef.current = sequence;
    setSaveStatus('saving');

    const run = saveQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        await services.trips.saveItinerary(trip.id, {
          title: trip.title,
          days: trip.days,
        });
      });

    saveQueueRef.current = run.catch(() => undefined);

    void run.then(
      () => {
        if (mountedRef.current && sequence === saveSequenceRef.current) {
          setSaveStatus('saved');
        }
      },
      () => {
        if (mountedRef.current && sequence === saveSequenceRef.current) {
          setSaveStatus('error');
        }
      },
    );
  }, []);

  const lastRequestedSaveRef = useRef(initialTrip);

  useEffect(() => {
    latestTripRef.current = state.present;

    if (lastRequestedSaveRef.current === state.present) {
      return;
    }

    lastRequestedSaveRef.current = state.present;
    save(state.present);
  }, [save, state.present]);

  const retrySave = useCallback(() => {
    save(latestTripRef.current);
  }, [save]);

  const addPlace = useCallback(
    (dayId: TripDayId, place: Place): boolean => {
      const alreadyAdded = state.present.days.some((day) =>
        day.activities.some(
          (activity) => activity.source.type === 'place' && activity.source.placeId === place.id,
        ),
      );

      if (alreadyAdded) {
        return false;
      }

      dispatch({
        type: 'addActivity',
        dayId,
        activity: createPlaceActivity(place, { id: crypto.randomUUID() }),
      });
      return true;
    },
    [state.present.days],
  );

  const addCustomActivity = useCallback((dayId: TripDayId, fields: CustomActivityFields): void => {
    dispatch({
      type: 'addActivity',
      dayId,
      activity: createCustomActivity({
        id: crypto.randomUUID(),
        title: fields.title,
        startTime: fields.startTime,
        durationMin: fields.durationMin,
        estimatedCost: fields.estimatedCost,
        notes: fields.notes,
      }),
    });
  }, []);

  const updateActivity = useCallback(
    (dayId: TripDayId, activityId: string, patch: ActivityPatch): void => {
      dispatch({ type: 'updateActivity', dayId, activityId, patch });
    },
    [],
  );

  const removeActivity = useCallback((dayId: TripDayId, activityId: string): void => {
    dispatch({ type: 'removeActivity', dayId, activityId });
  }, []);

  const moveActivity = useCallback(
    (activityId: string, fromDayId: TripDayId, toDayId: TripDayId, toIndex: number): void => {
      dispatch({
        type: 'moveActivity',
        activityId,
        fromDayId,
        toDayId,
        toIndex,
      });
    },
    [],
  );

  return {
    trip: state.present,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    atDayLimit: state.present.days.length >= MAX_TRIP_DAYS,
    saveStatus,
    retrySave,
    renameTrip: (title: string) => dispatch({ type: 'renameTrip', title }),
    addPlace,
    addCustomActivity,
    updateActivity,
    removeActivity,
    moveActivity,
    removeLastDay: () => dispatch({ type: 'removeLastDay' }),
    undo: () => dispatch({ type: 'undo' }),
    redo: () => dispatch({ type: 'redo' }),
    addDay: () => {
      const nextDay = getNextTripDay(state.present);

      if (!nextDay) {
        return null;
      }

      dispatch({ type: 'addDay' });
      return nextDay.id;
    },
  };
}
