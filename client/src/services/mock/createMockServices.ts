import type {
  BookingRequest,
  IsoDate,
  Money,
  Place,
  PriceQuote,
  Trip,
  TripActivity,
  TripDay,
  TripDayId,
  TripId,
  UserId,
} from '../../types';
import { enumerateDates, getTodayIsoDate, isIsoDate } from '../../lib/date';
import { getDraftPlaceIds } from '../../lib/planner/draft';
import { generateItinerary } from '../../lib/planner/itinerary';
import {
  isAccommodationPreference,
  isBudgetTier,
  isSelectableInterest,
  isTransportPreference,
  MAX_TRAVELERS,
  MAX_TRIP_DAYS,
} from '../../lib/planner/options';
import type {
  AccommodationQuery,
  AccommodationService,
  AddPlaceToDraftResult,
  BookingRequestService,
  CreateBookingRequestInput,
  CreatePlannedTripInput,
  CreatePlannedTripResult,
  CreateTripActivityInput,
  CreateTripInput,
  PlaceQuery,
  PlaceService,
  ReadyMadeTripService,
  SaveItineraryInput,
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
  now?: () => Date;
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

function assertNullableTime(value: string | null, field: string): void {
  if (value !== null) {
    assertTime(value, field);
  }
}

function assertPriceQuote(value: PriceQuote, field: string): void {
  if (!Number.isFinite(value.amount) || value.amount < 0) {
    throw new ServiceError('VALIDATION', `${field} must be zero or greater.`);
  }

  if (value.currency !== 'USD' && value.currency !== 'EGP') {
    throw new ServiceError('VALIDATION', `${field} currency is invalid.`);
  }

  if (!value.isEstimated) {
    throw new ServiceError('VALIDATION', `${field} must be marked as estimated.`);
  }

  assertDate(value.priceUpdatedAt, `${field} last updated date`);
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

function assertBudgetTier(value: string | null | undefined): void {
  if (value !== null && value !== undefined && !isBudgetTier(value)) {
    throw new ServiceError('VALIDATION', 'Budget tier is invalid.');
  }
}

function assertPlannerAnswers(input: CreatePlannedTripInput): void {
  const { answers } = input;

  assertDate(answers.startDate, 'Start date');
  assertDate(answers.endDate, 'End date');
  assertPositiveInteger(answers.travelers, 'Travelers');

  if (answers.travelers > MAX_TRAVELERS) {
    throw new ServiceError('VALIDATION', `Travelers must be ${MAX_TRAVELERS} or fewer.`);
  }

  if (!isBudgetTier(answers.budgetTier)) {
    throw new ServiceError('VALIDATION', 'Select a budget tier.');
  }

  if (
    answers.interests.length === 0 ||
    !answers.interests.every((interest) => isSelectableInterest(interest))
  ) {
    throw new ServiceError('VALIDATION', 'Select at least one available interest.');
  }

  if (!isAccommodationPreference(answers.accommodationType)) {
    throw new ServiceError('VALIDATION', 'Accommodation preference is invalid.');
  }

  if (!isTransportPreference(answers.transportType)) {
    throw new ServiceError('VALIDATION', 'Transport preference is invalid.');
  }

  let dates: IsoDate[];

  try {
    dates = enumerateDates(answers.startDate, answers.endDate);
  } catch (error) {
    if (error instanceof RangeError) {
      throw new ServiceError('VALIDATION', error.message);
    }

    throw error;
  }

  if (dates.length > MAX_TRIP_DAYS) {
    throw new ServiceError('VALIDATION', `Trips can cover at most ${MAX_TRIP_DAYS} days.`);
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
  const now = options.now ?? (() => new Date());
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

  function assertItineraryDays(days: TripDay[]): void {
    if (!Array.isArray(days) || days.length === 0) {
      throw new ServiceError('VALIDATION', 'An itinerary must contain at least one day.');
    }

    if (days.length > MAX_TRIP_DAYS) {
      throw new ServiceError('VALIDATION', `Trips can cover at most ${MAX_TRIP_DAYS} days.`);
    }

    const firstDate = days[0]?.date;
    const lastDate = days[days.length - 1]?.date;

    if (!firstDate || !lastDate) {
      throw new ServiceError('VALIDATION', 'Every day must have a date.');
    }

    assertDate(firstDate, 'Day date');
    assertDate(lastDate, 'Day date');

    let expectedDates: IsoDate[];

    try {
      expectedDates = enumerateDates(firstDate, lastDate);
    } catch (error) {
      if (error instanceof RangeError) {
        throw new ServiceError('VALIDATION', error.message);
      }

      throw error;
    }

    if (
      expectedDates.length !== days.length ||
      days.some((day, index) => day.date !== expectedDates[index])
    ) {
      throw new ServiceError('VALIDATION', 'Itinerary days must be consecutive and in order.');
    }

    const dayIds = new Set<string>();
    const activityIds = new Set<string>();

    for (const day of days) {
      assertNonEmpty(day.id, 'Day ID');

      if (dayIds.has(day.id)) {
        throw new ServiceError('VALIDATION', `Day ID "${day.id}" is duplicated.`);
      }

      dayIds.add(day.id);

      if (!Array.isArray(day.activities)) {
        throw new ServiceError('VALIDATION', 'Every day must contain an activity list.');
      }

      for (const activity of day.activities) {
        assertNonEmpty(activity.id, 'Activity ID');

        if (activityIds.has(activity.id)) {
          throw new ServiceError('VALIDATION', `Activity ID "${activity.id}" is duplicated.`);
        }

        activityIds.add(activity.id);
        assertNullableTime(activity.startTime, 'Start time');

        if (activity.durationMin !== null) {
          assertNonNegative(activity.durationMin, 'Duration');
        }

        if (activity.travelMin !== null) {
          assertNonNegative(activity.travelMin, 'Travel time');
        }

        if (activity.estimatedCost !== null) {
          assertPriceQuote(activity.estimatedCost, 'Estimated cost');
        }

        if (activity.notes !== undefined && typeof activity.notes !== 'string') {
          throw new ServiceError('VALIDATION', 'Activity notes must be text.');
        }

        if (activity.source.type === 'place') {
          try {
            findPlaceById(activity.source.placeId);
          } catch (error) {
            if (error instanceof ServiceError) {
              throw new ServiceError('VALIDATION', error.message);
            }

            throw error;
          }
        } else if (activity.source.type === 'custom') {
          assertNonEmpty(activity.source.title, 'Activity title');
        } else {
          throw new ServiceError('VALIDATION', 'Activity source is invalid.');
        }
      }
    }
  }

  function saveTrip(trip: Trip): Trip {
    store.update((state) => ({
      ...state,
      trips: state.trips.map((item) => (item.id === trip.id ? trip : item)),
    }));

    return trip;
  }

  function createDraftTrip(today: IsoDate): Trip {
    return {
      id: crypto.randomUUID(),
      userId: currentUserId,
      title: 'My Cairo trip',
      startDate: today,
      endDate: today,
      travelers: 1,
      budget: null,
      budgetTier: null,
      interests: [],
      preferences: {},
      status: 'draft',
      days: [
        {
          id: crypto.randomUUID(),
          date: today,
          activities: [],
        },
      ],
      accommodationId: null,
      savedPlaceIds: [],
      isDemo: true,
    };
  }

  function findDraftPlaceActivity(
    trip: Trip,
    placeId: string,
  ): { day: TripDay; activity: TripActivity } | null {
    for (const day of trip.days) {
      const activity = day.activities.find(
        (item) => item.source.type === 'place' && item.source.placeId === placeId,
      );

      if (activity) {
        return { day, activity };
      }
    }

    return null;
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
      return run(() =>
        seedAccommodation.filter((item) => {
          if (query.type && item.type !== query.type) return false;
          if (
            query.amenity &&
            !item.amenities.some((a) => a.toLowerCase().includes(query.amenity!.toLowerCase()))
          )
            return false;
          return true;
        }),
      );
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
        assertBudgetTier(input.budgetTier);

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
          budgetTier: input.budgetTier ?? null,
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
    createPlannedTrip(input: CreatePlannedTripInput) {
      return run(() => {
        assertPlannerAnswers(input);

        let existing: Trip | null;

        if (input.replaceTripId) {
          existing = findTrip(input.replaceTripId);

          if (existing.userId !== currentUserId) {
            throw new ServiceError('NOT_FOUND', `Trip "${input.replaceTripId}" was not found.`);
          }

          if (existing.status !== 'draft') {
            throw new ServiceError('VALIDATION', 'Only draft trips can be regenerated.');
          }
        } else {
          existing =
            store
              .getState()
              .trips.find((trip) => trip.userId === currentUserId && trip.status === 'draft') ??
            null;
        }

        const savedPlaceIds = getDraftPlaceIds(existing);
        const includeSavedPlaces = input.includeSavedPlaces ?? true;
        const tripId = existing?.id ?? crypto.randomUUID();
        const title = existing?.title ?? 'My Cairo trip';
        const generated = generateItinerary({
          tripId,
          userId: currentUserId,
          title,
          answers: input.answers,
          places: seedPlaces,
          savedPlaceIds,
          includeSavedPlaces,
        });

        if (!generated.ok) {
          throw new ServiceError('VALIDATION', 'No demo places match the selected interests.');
        }

        const { trip, warnings, matchedPlaceIds, omittedPlaceIds } = generated.itinerary;

        if (existing) {
          saveTrip(trip);
        } else {
          store.update((state) => ({
            ...state,
            trips: [...state.trips, trip],
          }));
        }

        const result: CreatePlannedTripResult = {
          trip,
          warnings,
          matchedPlaceIds,
          omittedPlaceIds,
          createdTrip: !existing,
          replacedTrip: Boolean(existing),
        };

        return result;
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

        if (patch.budgetTier !== undefined) {
          assertBudgetTier(patch.budgetTier);
        }

        const updated: Trip = {
          ...trip,
          ...(patch.title !== undefined ? { title: patch.title.trim() } : {}),
          ...(patch.travelers !== undefined ? { travelers: patch.travelers } : {}),
          ...(patch.budget !== undefined ? { budget: patch.budget } : {}),
          ...(patch.budgetTier !== undefined ? { budgetTier: patch.budgetTier } : {}),
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
    addPlaceToDraft(placeId, placeSnapshot) {
      return run(() => {
        const place =
          placeSnapshot && placeSnapshot.id === placeId ? placeSnapshot : findPlaceById(placeId);
        const mine = store.getState().trips.filter((trip) => trip.userId === currentUserId);
        let trip = mine.find((item) => item.status === 'draft') ?? null;
        let createdTrip = false;

        if (!trip) {
          trip = createDraftTrip(getTodayIsoDate(now()));
          createdTrip = true;
        }

        const existing = findDraftPlaceActivity(trip, placeId);

        if (existing) {
          const result: AddPlaceToDraftResult = {
            trip,
            dayId: existing.day.id,
            activity: existing.activity,
            added: false,
            createdTrip: false,
          };

          return result;
        }

        const firstDay = trip.days[0];
        const day: TripDay = firstDay ?? {
          id: crypto.randomUUID(),
          date: trip.startDate,
          activities: [],
        };
        const activity: TripActivity = {
          id: crypto.randomUUID(),
          source: { type: 'place', placeId },
          startTime: '09:00',
          durationMin: place.avgVisitMinutes,
          travelMin: null,
          estimatedCost: place.ticketPrice,
          order: day.activities.length,
          ...(place.avgVisitMinutes === null ? { notes: 'Visit duration is not yet listed.' } : {}),
        };
        const updatedTrip: Trip = {
          ...trip,
          days: firstDay
            ? trip.days.map((item) =>
                item.id === day.id ? { ...item, activities: [...item.activities, activity] } : item,
              )
            : [{ ...day, activities: [activity] }],
        };

        if (createdTrip) {
          store.update((state) => ({
            ...state,
            trips: [...state.trips, updatedTrip],
          }));
        } else {
          saveTrip(updatedTrip);
        }

        const result: AddPlaceToDraftResult = {
          trip: updatedTrip,
          dayId: day.id,
          activity,
          added: true,
          createdTrip,
        };

        return result;
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
    saveItinerary(tripId: TripId, input: SaveItineraryInput) {
      return run(() => {
        const trip = findTrip(tripId);

        if (trip.userId !== currentUserId) {
          throw new ServiceError('NOT_FOUND', `Trip "${tripId}" was not found.`);
        }

        if (input.title !== undefined) {
          assertNonEmpty(input.title, 'Title');
        }

        assertItineraryDays(input.days);

        const days: TripDay[] = input.days.map((day) => ({
          id: day.id,
          date: day.date,
          activities: day.activities.map((activity, index) => ({
            id: activity.id,
            source: activity.source,
            startTime: activity.startTime,
            durationMin: activity.durationMin,
            travelMin: activity.travelMin,
            estimatedCost: activity.estimatedCost,
            order: index,
            ...(activity.notes !== undefined ? { notes: activity.notes } : {}),
          })),
        }));
        const firstDay = days[0];
        const lastDay = days[days.length - 1];

        if (!firstDay || !lastDay) {
          throw new ServiceError('VALIDATION', 'An itinerary must contain at least one day.');
        }

        const updated: Trip = {
          ...trip,
          ...(input.title !== undefined ? { title: input.title.trim() } : {}),
          startDate: firstDay.date,
          endDate: lastDay.date,
          days,
        };

        return saveTrip(updated);
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
    cancel(id) {
      return run(() => {
        const request = store.getState().bookingRequests.find((c) => c.id === id);
        if (!request) {
          throw new ServiceError('NOT_FOUND', `Booking request "${id}" was not found.`);
        }
        if (request.status !== 'pending') {
          throw new ServiceError(
            'VALIDATION',
            `Cannot cancel request in "${request.status}" status.`,
          );
        }
        const now = new Date().toISOString();
        const updated: BookingRequest = {
          ...request,
          status: 'cancelled',
          statusHistory: [
            ...request.statusHistory,
            { status: 'cancelled', changedAt: now, note: 'Cancelled by user request.' },
          ],
        };
        store.update((state) => ({
          ...state,
          bookingRequests: state.bookingRequests.map((r) => (r.id === id ? updated : r)),
        }));
        return updated;
      });
    },
    simulateConfirm(id) {
      return run(() => {
        const request = store.getState().bookingRequests.find((c) => c.id === id);
        if (!request) {
          throw new ServiceError('NOT_FOUND', `Booking request "${id}" was not found.`);
        }
        if (request.status !== 'pending') {
          throw new ServiceError(
            'VALIDATION',
            `Cannot confirm request in "${request.status}" status.`,
          );
        }
        const now = new Date().toISOString();
        const updated: BookingRequest = {
          ...request,
          status: 'confirmed',
          statusHistory: [
            ...request.statusHistory,
            { status: 'confirmed', changedAt: now, note: 'Simulated provider confirmation.' },
          ],
        };
        store.update((state) => ({
          ...state,
          bookingRequests: state.bookingRequests.map((r) => (r.id === id ? updated : r)),
        }));
        return updated;
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
    async resetLocalData() {
      await wait();
      store.reset();
    },
  };
}
