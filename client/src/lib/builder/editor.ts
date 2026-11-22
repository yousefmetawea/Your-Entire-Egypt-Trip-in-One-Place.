import type {
  PriceQuote,
  Trip,
  TripActivity,
  TripActivitySource,
  TripDay,
  TripDayId,
} from '../../types';
import { MAX_TRIP_DAYS } from '../planner/options';

export const MAX_EDITOR_HISTORY = 30;

const DAY_IN_MS = 86_400_000;

export interface ItineraryEditorState {
  present: Trip;
  past: Trip[];
  future: Trip[];
}

export interface ActivityPatch {
  startTime?: string | null;
  durationMin?: number | null;
  estimatedCost?: PriceQuote | null;
  notes?: string | null;
  source?: TripActivitySource;
}

export type ItineraryEditorAction =
  | {
      type: 'addActivity';
      dayId: TripDayId;
      activity: TripActivity;
    }
  | {
      type: 'updateActivity';
      dayId: TripDayId;
      activityId: string;
      patch: ActivityPatch;
    }
  | {
      type: 'removeActivity';
      dayId: TripDayId;
      activityId: string;
    }
  | {
      type: 'moveActivity';
      activityId: string;
      fromDayId: TripDayId;
      toDayId: TripDayId;
      toIndex: number;
    }
  | { type: 'renameTrip'; title: string }
  | { type: 'addDay' }
  | { type: 'removeLastDay' }
  | { type: 'undo' }
  | { type: 'redo' };

export function createEditorState(trip: Trip): ItineraryEditorState {
  return {
    present: trip,
    past: [],
    future: [],
  };
}

function pushHistory(state: ItineraryEditorState, nextTrip: Trip): ItineraryEditorState {
  if (nextTrip === state.present) {
    return state;
  }

  return {
    present: nextTrip,
    past: [...state.past, state.present].slice(-MAX_EDITOR_HISTORY),
    future: [],
  };
}

function reindex(activities: readonly TripActivity[]): TripActivity[] {
  return activities.map((activity, index) =>
    activity.order === index ? activity : { ...activity, order: index },
  );
}

function replaceDay(trip: Trip, nextDay: TripDay): Trip {
  return {
    ...trip,
    days: trip.days.map((day) => (day.id === nextDay.id ? nextDay : day)),
  };
}

function sameSource(left: TripActivitySource, right: TripActivitySource): boolean {
  if (left.type === 'place' && right.type === 'place') {
    return left.placeId === right.placeId;
  }

  if (left.type === 'custom' && right.type === 'custom') {
    return left.title === right.title;
  }

  return false;
}

function sameCost(left: PriceQuote | null, right: PriceQuote | null): boolean {
  if (left === null || right === null) {
    return left === right;
  }

  return (
    left.amount === right.amount &&
    left.currency === right.currency &&
    left.isEstimated === right.isEstimated &&
    left.priceUpdatedAt === right.priceUpdatedAt
  );
}

function normalizeNotes(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed ? trimmed : null;
}

function updateActivity(
  trip: Trip,
  dayId: TripDayId,
  activityId: string,
  patch: ActivityPatch,
): Trip {
  const day = trip.days.find((item) => item.id === dayId);

  if (!day) {
    return trip;
  }

  let changed = false;
  const activities = day.activities.map((activity) => {
    if (activity.id !== activityId) {
      return activity;
    }

    const nextStartTime = patch.startTime === undefined ? activity.startTime : patch.startTime;
    const nextDuration = patch.durationMin === undefined ? activity.durationMin : patch.durationMin;
    const nextCost =
      patch.estimatedCost === undefined ? activity.estimatedCost : patch.estimatedCost;
    const currentNotes = activity.notes ?? null;
    const nextNotes = patch.notes === undefined ? currentNotes : normalizeNotes(patch.notes);
    const nextSource = patch.source === undefined ? activity.source : patch.source;

    if (
      nextStartTime === activity.startTime &&
      nextDuration === activity.durationMin &&
      sameCost(nextCost, activity.estimatedCost) &&
      nextNotes === currentNotes &&
      sameSource(nextSource, activity.source)
    ) {
      return activity;
    }

    changed = true;

    return {
      ...activity,
      source: nextSource,
      startTime: nextStartTime,
      durationMin: nextDuration,
      estimatedCost: nextCost,
      ...(nextNotes === null ? { notes: undefined } : { notes: nextNotes }),
    };
  });

  if (!changed) {
    return trip;
  }

  return replaceDay(trip, {
    ...day,
    activities,
  });
}

function addActivity(trip: Trip, dayId: TripDayId, activity: TripActivity): Trip {
  const day = trip.days.find((item) => item.id === dayId);

  if (!day) {
    return trip;
  }

  return replaceDay(trip, {
    ...day,
    activities: [...day.activities, { ...activity, order: day.activities.length }],
  });
}

function removeActivity(trip: Trip, dayId: TripDayId, activityId: string): Trip {
  const day = trip.days.find((item) => item.id === dayId);

  if (!day || !day.activities.some((activity) => activity.id === activityId)) {
    return trip;
  }

  return replaceDay(trip, {
    ...day,
    activities: reindex(day.activities.filter((activity) => activity.id !== activityId)),
  });
}

function moveActivity(
  trip: Trip,
  activityId: string,
  fromDayId: TripDayId,
  toDayId: TripDayId,
  toIndex: number,
): Trip {
  const fromDay = trip.days.find((day) => day.id === fromDayId);
  const toDay = trip.days.find((day) => day.id === toDayId);
  const activity = fromDay?.activities.find((item) => item.id === activityId);

  if (!fromDay || !toDay || !activity) {
    return trip;
  }

  const fromIndex = fromDay.activities.findIndex((item) => item.id === activityId);

  if (fromDay.id === toDay.id) {
    const targetIndex = Math.max(0, Math.min(toIndex, fromDay.activities.length - 1));

    if (fromIndex === targetIndex) {
      return trip;
    }

    const activities = [...fromDay.activities];
    activities.splice(fromIndex, 1);
    activities.splice(targetIndex, 0, activity);

    return replaceDay(trip, {
      ...fromDay,
      activities: reindex(activities),
    });
  }

  const remaining = fromDay.activities.filter((item) => item.id !== activityId);
  const targetActivities = [...toDay.activities];
  const targetIndex = Math.max(0, Math.min(toIndex, targetActivities.length));
  targetActivities.splice(targetIndex, 0, activity);

  return {
    ...trip,
    days: trip.days.map((day) => {
      if (day.id === fromDay.id) {
        return { ...day, activities: reindex(remaining) };
      }

      if (day.id === toDay.id) {
        return { ...day, activities: reindex(targetActivities) };
      }

      return day;
    }),
  };
}

function getNextDate(date: string): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + DAY_IN_MS).toISOString().slice(0, 10);
}

export function getNextTripDay(trip: Trip): TripDay | null {
  const lastDay = trip.days[trip.days.length - 1];

  if (!lastDay || trip.days.length >= MAX_TRIP_DAYS) {
    return null;
  }

  const date = getNextDate(lastDay.date);

  return {
    id: `day-${date}`,
    date,
    activities: [],
  };
}

function addDay(trip: Trip): Trip {
  const nextDay = getNextTripDay(trip);

  if (!nextDay) {
    return trip;
  }

  return {
    ...trip,
    endDate: nextDay.date,
    days: [...trip.days, nextDay],
  };
}

function removeLastDay(trip: Trip): Trip {
  if (trip.days.length <= 1) {
    return trip;
  }

  const days = trip.days.slice(0, -1);
  const lastDay = days[days.length - 1];

  if (!lastDay) {
    return trip;
  }

  return {
    ...trip,
    endDate: lastDay.date,
    days,
  };
}

export function itineraryEditorReducer(
  state: ItineraryEditorState,
  action: ItineraryEditorAction,
): ItineraryEditorState {
  switch (action.type) {
    case 'addActivity':
      return pushHistory(state, addActivity(state.present, action.dayId, action.activity));
    case 'updateActivity':
      return pushHistory(
        state,
        updateActivity(state.present, action.dayId, action.activityId, action.patch),
      );
    case 'removeActivity':
      return pushHistory(state, removeActivity(state.present, action.dayId, action.activityId));
    case 'moveActivity':
      return pushHistory(
        state,
        moveActivity(
          state.present,
          action.activityId,
          action.fromDayId,
          action.toDayId,
          action.toIndex,
        ),
      );
    case 'renameTrip': {
      const title = action.title.trim();

      if (!title || title === state.present.title) {
        return state;
      }

      return pushHistory(state, { ...state.present, title });
    }
    case 'addDay':
      return pushHistory(state, addDay(state.present));
    case 'removeLastDay':
      return pushHistory(state, removeLastDay(state.present));
    case 'undo': {
      const previous = state.past[state.past.length - 1];

      if (!previous) {
        return state;
      }

      return {
        present: previous,
        past: state.past.slice(0, -1),
        future: [state.present, ...state.future].slice(0, MAX_EDITOR_HISTORY),
      };
    }
    case 'redo': {
      const next = state.future[0];

      if (!next) {
        return state;
      }

      return {
        present: next,
        past: [...state.past, state.present].slice(-MAX_EDITOR_HISTORY),
        future: state.future.slice(1),
      };
    }
    default:
      return state;
  }
}
