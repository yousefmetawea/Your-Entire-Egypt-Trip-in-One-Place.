import type {
  BookingRequest,
  IsoDate,
  Money,
  Place,
  Trip,
  TripActivity,
  TripDay,
  TripDayId,
  TripId,
  UserId,
} from '../../types';
import { enumerateDates, isIsoDate } from '../../lib/date';
import type {
  AccommodationQuery,
  AccommodationService,
  BookingRequestService,
  CreateBookingRequestInput,
  CreateTripActivityInput,
  CreateTripInput,
  PlaceQuery,
  PlaceService,
  ReadyMadeTripService,
  Services,
  TransportQuery,
  TransportService,
  TripService,
  UpdateTripInput,
} from '../contracts';
import { ServiceError } from '../errors';
import { seedAccommodation, seedPlaces, seedReadyMadeTrips, seedTransport } from './seed';
import { createMockStore } from './store';
import { createBrowserStorage } from './storage';
import type { MockStorage } from './storage';

const DEFAULT_LATENCY_MS = 120;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const DEMO_USER_ID = 'demo-user';

export interface MockServiceOptions {
  latencyMs?: number;
  storage?: MockStorage;
  currentUserId?: UserId;
}

function assertNonEmpty(value: string, field: string): void {
  if (!value.trim()) {
    throw new ServiceError('VALIDATION', `${field} is required.`);
  }
}

function assertPositiveInteger(value: number, field: string): void {
  if (!Number.isInteger(value) || value < 1) {
    throw new ServiceError('VALIDATION', `${field} must be a positive integer.`);
  }
}

function assertNonNegative(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new ServiceError('VALIDATION', `${field} must be zero or greater.`);
  }
}

function assertTime(value: string, field: string): void {
  if (!TIME_PATTERN.test(value)) {
    throw new ServiceError('VALIDATION', `${field} must use HH:mm.`);
  }
}

function assertDate(value: string, field: string): void {
  if (!isIsoDate(value)) {
    throw new ServiceError('VALIDATION', `${field} must use YYYY-MM-DD.`);
  }
}

function assertBudget(budget: Money | null | undefined): void {
  if (budget && (!Number.isFinite(budget.amount) || budget.amount < 0)) {
    throw new ServiceError('VALIDATION', 'Budget must be zero or greater.');
  }
}

function filterPlaces(items: readonly Place[], query: PlaceQuery): Place[] {
  const search = query.search?.trim().toLowerCase();

  return items.filter((place) => {
    if (query.area && place.area !== query.area) {
      return false;
    }

    if (query.category && place.category !== query.category) {
      return false;
    }

    if (!search) {
      return true;
    }

    return (
      place.name.en.toLowerCase().includes(search) ||
      place.tags.some((tag) => tag.toLowerCase().includes(search))
    );
  });
}

export function createMockServices(options: MockServiceOptions = {}): Services {
  const latencyMs = options.latencyMs ?? DEFAULT_LATENCY_MS;
  const currentUserId = options.currentUserId ?? DEMO_USER_ID;
  const storage = options.storage ?? createBrowserStorage();
  const store = createMockStore(storage);

  function wait(): Promise<void> {
    if (latencyMs <= 0) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      setTimeout(resolve, latencyMs);
    });
  }

  async function run<T>(action: () => T): Promise<T> {
    await wait();
    return structuredClone(action());
  }

  function findPlaceById(id: string): Place {
    const place = seedPlaces.find((item) => item.id === id);

    if (!place) {
      throw new ServiceError('NOT_FOUND', `Place "${id}" was not found.`);
    }

    return place;
  }

  function findTrip(tripId: TripId): Trip {
    const trip = store.getState().trips.find((item) => item.id === tripId);

    if (!trip) {
      throw new ServiceError('NOT_FOUND', `Trip "${tripId}" was not found.`);
    }

    return trip;
  }

  function findDay(trip: Trip, dayId: TripDayId): TripDay {
    const day = trip.days.find((item) => item.id === dayId);

    if (!day) {
      throw new ServiceError('NOT_FOUND', `Trip day "${dayId}" was not found.`);
    }

    return day;
  }

  function saveTrip(trip: Trip): Trip {
    store.update((state) => ({
      ...state,
      trips: state.trips.map((item) => (item.id === trip.id ? trip : item)),
    }));

    return trip;
  }

  const places: PlaceService = {
    list(query = {}) {
      return run(() => filterPlaces(seedPlaces, query));
    },
    getById(id) {
      return run(() => findPlaceById(id));
    },
    getBySlug(slug) {
      return run(() => {
        const place = seedPlaces.find((item) => item.slug === slug);

        if (!place) {
          throw new ServiceError('NOT_FOUND', `Place with slug "${slug}" was not found.`);
        }

        return place;
      });
    },
    getNearby(placeId, limit = 4) {
      return run(() => {
        const place = findPlaceById(placeId);
        const nearby = place.nearbyPlaceIds
          .map((id) => seedPlaces.find((item) => item.id === id))
          .filter((item): item is Place => Boolean(item));

        return nearby.slice(0, Math.max(0, limit));
      });
    },
  };

  const accommodation: AccommodationService = {
    list(query: AccommodationQuery = {}) {
      return run(() => seedAccommodation.filter((item) => !query.type || item.type === query.type));
    },
    getById(id) {
      return run(() => {
        const item = seedAccommodation.find((candidate) => candidate.id === id);

        if (!item) {
          throw new ServiceError('NOT_FOUND', `Accommodation "${id}" was not found.`);
        }

        return item;
      });
    },
  };

  const transport: TransportService = {
    list(query: TransportQuery = {}) {
      return run(() => seedTransport.filter((item) => !query.type || item.type === query.type));
    },
  };

  const readyMadeTrips: ReadyMadeTripService = {
    list() {
      return run(() => [...seedReadyMadeTrips]);
    },
    getById(id) {
      return run(() => {
        const item = seedReadyMadeTrips.find((candidate) => candidate.id === id);

        if (!item) {
          throw new ServiceError('NOT_FOUND', `Ready-made trip "${id}" was not found.`);
        }

        return item;
      });
    },
  };

  const trips: TripService = {
    listMine() {
      return run(() => store.getState().trips.filter((trip) => trip.userId === currentUserId));
    },
    getById(id) {
      return run(() => findTrip(id));
    },
    create(input: CreateTripInput) {
      return run(() => {
        assertNonEmpty(input.title, 'Title');
        assertDate(input.startDate, 'Start date');
        assertDate(input.endDate, 'End date');
        assertPositiveInteger(input.travelers, 'Travelers');
        assertBudget(input.budget);

        let dates: IsoDate[];

        try {
          dates = enumerateDates(input.startDate, input.endDate);
        } catch (error) {
          if (error instanceof RangeError) {
            throw new ServiceError('VALIDATION', error.message);
          }

          throw error;
        }

        const trip: Trip = {
          id: crypto.randomUUID(),
          userId: currentUserId,
          title: input.title.trim(),
          startDate: input.startDate,
          endDate: input.endDate,
          travelers: input.travelers,
          budget: input.budget ?? null,
          interests: input.interests ?? [],
          preferences: input.preferences ?? {},
          status: 'draft',
          days: dates.map((date) => ({
            id: crypto.randomUUID(),
            date,
            activities: [],
          })),
          accommodationId: input.accommodationId ?? null,
          savedPlaceIds: [],
          isDemo: true,
        };

        store.update((state) => ({
          ...state,
          trips: [...state.trips, trip],
        }));

        return trip;
      });
    },
    update(id, patch: UpdateTripInput) {
      return run(() => {
        const trip = findTrip(id);

        if (patch.title !== undefined) {
          assertNonEmpty(patch.title, 'Title');
        }

        if (patch.travelers !== undefined) {
          assertPositiveInteger(patch.travelers, 'Travelers');
        }

        if (patch.budget !== undefined) {
          assertBudget(patch.budget);
        }

        const updated: Trip = {
          ...trip,
          ...(patch.title !== undefined ? { title: patch.title.trim() } : {}),
          ...(patch.travelers !== undefined ? { travelers: patch.travelers } : {}),
          ...(patch.budget !== undefined ? { budget: patch.budget } : {}),
          ...(patch.interests !== undefined ? { interests: patch.interests } : {}),
          ...(patch.preferences !== undefined ? { preferences: patch.preferences } : {}),
          ...(patch.status !== undefined ? { status: patch.status } : {}),
          ...(patch.accommodationId !== undefined
            ? { accommodationId: patch.accommodationId }
            : {}),
          ...(patch.savedPlaceIds !== undefined ? { savedPlaceIds: patch.savedPlaceIds } : {}),
        };

        return saveTrip(updated);
      });
    },
    remove(id) {
      return run(() => {
        findTrip(id);
        store.update((state) => ({
          ...state,
          trips: state.trips.filter((trip) => trip.id !== id),
        }));
        return undefined;
      });
    },
    addActivity(tripId, dayId, input: CreateTripActivityInput) {
      return run(() => {
        const trip = findTrip(tripId);
        const day = findDay(trip, dayId);

        assertTime(input.startTime, 'Start time');
        assertNonNegative(input.durationMin, 'Duration');
        assertNonNegative(input.travelMin, 'Travel time');

        if (input.source.type === 'place') {
          findPlaceById(input.source.placeId);
        } else {
          assertNonEmpty(input.source.title, 'Activity title');
        }

        const activity: TripActivity = {
          id: crypto.randomUUID(),
          source: input.source,
          startTime: input.startTime,
          durationMin: input.durationMin,
          travelMin: input.travelMin,
          estimatedCost: input.estimatedCost ?? null,
          order: day.activities.length,
          ...(input.notes !== undefined ? { notes: input.notes } : {}),
        };

        day.activities = [...day.activities, activity];

        return saveTrip(trip);
      });
    },
    removeActivity(tripId, dayId, activityId) {
      return run(() => {
        const trip = findTrip(tripId);
        const day = findDay(trip, dayId);
        const exists = day.activities.some((activity) => activity.id === activityId);

        if (!exists) {
          throw new ServiceError('NOT_FOUND', `Activity "${activityId}" was not found.`);
        }

        day.activities = day.activities
          .filter((activity) => activity.id !== activityId)
          .map((activity, index) => ({ ...activity, order: index }));

        return saveTrip(trip);
      });
    },
    reorderActivities(tripId, dayId, activityIds) {
      return run(() => {
        const trip = findTrip(tripId);
        const day = findDay(trip, dayId);
        const currentIds = day.activities.map((activity) => activity.id);
        const requestedIds = new Set(activityIds);
        const isValidOrder =
          activityIds.length === currentIds.length &&
          requestedIds.size === currentIds.length &&
          currentIds.every((id) => requestedIds.has(id));

        if (!isValidOrder) {
          throw new ServiceError(
            'VALIDATION',
            'Activity order must contain each activity exactly once.',
          );
        }

        const activitiesById = new Map(
          day.activities.map((activity) => [activity.id, activity] as const),
        );

        day.activities = activityIds.map((id, index) => {
          const activity = activitiesById.get(id);

          if (!activity) {
            throw new ServiceError('VALIDATION', `Activity "${id}" was not found.`);
          }

          return { ...activity, order: index };
        });

        return saveTrip(trip);
      });
    },
  };

  const bookingRequests: BookingRequestService = {
    create(input: CreateBookingRequestInput) {
      return run(() => {
        assertDate(input.details.date, 'Date');
        assertTime(input.details.time, 'Time');

        const now = new Date().toISOString();
        const base = {
          id: crypto.randomUUID(),
          userId: currentUserId,
          tripId: input.tripId ?? null,
          status: 'pending' as const,
          createdAt: now,
          statusHistory: [{ status: 'pending' as const, changedAt: now }],
          isDemo: true,
        };

        let request: BookingRequest;

        if (input.kind === 'airport-transfer') {
          assertNonEmpty(input.details.pickupLocation, 'Pickup location');
          assertNonEmpty(input.details.dropoffLocation, 'Drop-off location');
          assertPositiveInteger(input.details.passengers, 'Passengers');

          request = {
            ...base,
            kind: 'airport-transfer',
            details: input.details,
          };
        } else {
          findPlaceById(input.details.placeId);
          assertPositiveInteger(input.details.groupSize, 'Group size');

          request = {
            ...base,
            kind: 'guided-tour',
            details: input.details,
          };
        }

        store.update((state) => ({
          ...state,
          bookingRequests: [...state.bookingRequests, request],
        }));

        return request;
      });
    },
    listMine() {
      return run(() =>
        store.getState().bookingRequests.filter((request) => request.userId === currentUserId),
      );
    },
    getById(id) {
      return run(() => {
        const request = store.getState().bookingRequests.find((candidate) => candidate.id === id);

        if (!request) {
          throw new ServiceError('NOT_FOUND', `Booking request "${id}" was not found.`);
        }

        return request;
      });
    },
  };

  return {
    places,
    accommodation,
    transport,
    readyMadeTrips,
    trips,
    bookingRequests,
  };
}
