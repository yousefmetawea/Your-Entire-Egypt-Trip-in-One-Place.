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
import type {
  Accommodation,
  AccommodationId,
  BookingRequest,
  BookingRequestId,
  Place,
  PlaceId,
  ReadyMadeTrip,
  ReadyMadeTripId,
  TransportOption,
  Trip,
  TripDayId,
  TripId,
} from '../../types';
import { apiClient } from './apiClient';
import { getDraftPlaceIds } from '../../lib/planner/draft';
import { generateItinerary } from '../../lib/planner/itinerary';

export function createApiServices(): Services {
  const places: PlaceService = {
    async list(query?: PlaceQuery): Promise<Place[]> {
      const res = await apiClient<{ places: Place[]; total: number }>('/places', {
        params: {
          search: query?.search,
          area: query?.area,
          category: query?.category,
          limit: 100,
        },
      });
      return res.places;
    },

    async getById(id: PlaceId): Promise<Place> {
      const res = await apiClient<{ place: Place }>(`/places/${id}`);
      return res.place;
    },

    async getBySlug(slug: string): Promise<Place> {
      const res = await apiClient<{ place: Place }>(`/places/slug/${slug}`);
      return res.place;
    },

    async getNearby(placeId: PlaceId, limit = 3): Promise<Place[]> {
      const res = await apiClient<{ places: Place[] }>(`/places/${placeId}/nearby`, {
        params: { limit },
      });
      return res.places;
    },
  };

  const accommodation: AccommodationService = {
    async list(query?: AccommodationQuery): Promise<Accommodation[]> {
      const res = await apiClient<{ accommodation: Accommodation[]; total: number }>(
        '/accommodation',
        {
          params: {
            type: query?.type,
            area: query?.area,
            amenity: query?.amenity,
            limit: 100,
          },
        },
      );
      return res.accommodation;
    },

    async getById(id: AccommodationId): Promise<Accommodation> {
      const res = await apiClient<{ accommodation: Accommodation }>(`/accommodation/${id}`);
      return res.accommodation;
    },
  };

  const transport: TransportService = {
    async list(query?: TransportQuery): Promise<TransportOption[]> {
      const res = await apiClient<{ transport: TransportOption[]; total: number }>('/transport', {
        params: {
          type: query?.type,
          limit: 100,
        },
      });
      return res.transport;
    },
  };

  const readyMadeTrips: ReadyMadeTripService = {
    async list(): Promise<ReadyMadeTrip[]> {
      const res = await apiClient<{ trips: ReadyMadeTrip[] }>('/ready-made-trips');
      return res.trips;
    },

    async getById(id: ReadyMadeTripId): Promise<ReadyMadeTrip> {
      const res = await apiClient<{ trip: ReadyMadeTrip }>(`/ready-made-trips/${id}`);
      return res.trip;
    },
  };

  const trips: TripService = {
    async listMine(): Promise<Trip[]> {
      const res = await apiClient<{ trips: Trip[] }>('/trips');
      return res.trips;
    },

    async getById(id: TripId): Promise<Trip> {
      const res = await apiClient<{ trip: Trip }>(`/trips/${id}`);
      return res.trip;
    },

    async create(input: CreateTripInput): Promise<Trip> {
      const res = await apiClient<{ trip: Trip }>('/trips', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return res.trip;
    },

    async createPlannedTrip(input: CreatePlannedTripInput): Promise<CreatePlannedTripResult> {
      // 1. Fetch catalog places to run deterministic planner logic
      const catalogPlaces = await places.list();

      // 2. Fetch existing trips to find drafts
      const myTrips = await this.listMine().catch(() => []);
      const existingDraft = input.replaceTripId
        ? myTrips.find((t) => t.id === input.replaceTripId)
        : myTrips.find((t) => t.status === 'draft');

      const savedPlaceIds = getDraftPlaceIds(existingDraft ?? null);
      const includeSavedPlaces = input.includeSavedPlaces ?? true;
      const tripId = existingDraft?.id ?? `trip_${crypto.randomUUID()}`;
      const title = existingDraft?.title ?? 'My Cairo trip';

      // 3. Generate planned itinerary using existing pure planner engine
      const generated = generateItinerary({
        tripId,
        userId: existingDraft?.userId ?? 'current_user',
        title,
        answers: input.answers,
        places: catalogPlaces,
        savedPlaceIds,
        includeSavedPlaces,
      });

      if (!generated.ok) {
        throw new ServiceError('VALIDATION', 'No demo places match the selected interests.');
      }

      const { trip, warnings, matchedPlaceIds, omittedPlaceIds } = generated.itinerary;

      // 4. Save or update on backend
      let savedTrip: Trip;
      if (existingDraft) {
        await this.update(existingDraft.id, {
          title: trip.title,
          travelers: trip.travelers,
          budgetTier: trip.budgetTier,
          interests: trip.interests,
          preferences: trip.preferences,
        });
        savedTrip = await this.saveItinerary(existingDraft.id, {
          title: trip.title,
          days: trip.days,
        });
      } else {
        const created = await this.create({
          title: trip.title,
          startDate: trip.startDate,
          endDate: trip.endDate,
          travelers: trip.travelers,
          budgetTier: trip.budgetTier,
          interests: trip.interests,
          preferences: trip.preferences,
        });
        savedTrip = await this.saveItinerary(created.id, {
          title: trip.title,
          days: trip.days,
        });
      }

      return {
        trip: savedTrip,
        warnings,
        matchedPlaceIds,
        omittedPlaceIds,
        createdTrip: !existingDraft,
        replacedTrip: Boolean(existingDraft),
      };
    },

    async update(id: TripId, patch: UpdateTripInput): Promise<Trip> {
      const res = await apiClient<{ trip: Trip }>(`/trips/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      return res.trip;
    },

    async remove(id: TripId): Promise<void> {
      await apiClient(`/trips/${id}`, {
        method: 'DELETE',
      });
    },

    async addPlaceToDraft(placeId: PlaceId): Promise<AddPlaceToDraftResult> {
      const res = await apiClient<AddPlaceToDraftResult>('/trips/draft/place', {
        method: 'POST',
        body: JSON.stringify({ placeId }),
      });
      return res;
    },

    async addActivity(
      tripId: TripId,
      dayId: TripDayId,
      input: CreateTripActivityInput,
    ): Promise<Trip> {
      const currentTrip = await this.getById(tripId);
      const targetDay = currentTrip.days.find((d) => d.id === dayId);
      if (!targetDay) {
        throw new Error(`Day not found: ${dayId}`);
      }

      const newActivity = {
        id: `act_${crypto.randomUUID()}`,
        source: input.source,
        startTime: input.startTime,
        durationMin: input.durationMin,
        travelMin: input.travelMin,
        estimatedCost: input.estimatedCost ?? null,
        order: targetDay.activities.length,
        notes: input.notes,
      };

      const updatedDays = currentTrip.days.map((day) =>
        day.id === dayId ? { ...day, activities: [...day.activities, newActivity] } : day,
      );

      return this.saveItinerary(tripId, { days: updatedDays });
    },

    async removeActivity(tripId: TripId, dayId: TripDayId, activityId: string): Promise<Trip> {
      const currentTrip = await this.getById(tripId);
      const updatedDays = currentTrip.days.map((day) => {
        if (day.id !== dayId) return day;
        const filtered = day.activities
          .filter((a) => a.id !== activityId)
          .map((act, index) => ({ ...act, order: index }));
        return { ...day, activities: filtered };
      });

      return this.saveItinerary(tripId, { days: updatedDays });
    },

    async reorderActivities(
      tripId: TripId,
      dayId: TripDayId,
      activityIds: string[],
    ): Promise<Trip> {
      const currentTrip = await this.getById(tripId);
      const updatedDays = currentTrip.days.map((day) => {
        if (day.id !== dayId) return day;
        const reordered = activityIds
          .map((id, index) => {
            const act = day.activities.find((a) => a.id === id);
            return act ? { ...act, order: index } : null;
          })
          .filter((a): a is NonNullable<typeof a> => a !== null);
        return { ...day, activities: reordered };
      });

      return this.saveItinerary(tripId, { days: updatedDays });
    },

    async saveItinerary(tripId: TripId, input: SaveItineraryInput): Promise<Trip> {
      const res = await apiClient<{ trip: Trip }>(`/trips/${tripId}/itinerary`, {
        method: 'PUT',
        body: JSON.stringify({
          title: input.title,
          days: input.days,
        }),
      });
      return res.trip;
    },
  };

  const bookingRequests: BookingRequestService = {
    async create(input: CreateBookingRequestInput): Promise<BookingRequest> {
      const res = await apiClient<{ booking: BookingRequest }>('/bookings', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return res.booking;
    },

    async listMine(): Promise<BookingRequest[]> {
      const res = await apiClient<{ bookings: BookingRequest[] }>('/bookings');
      return res.bookings;
    },

    async getById(id: BookingRequestId): Promise<BookingRequest> {
      const res = await apiClient<{ booking: BookingRequest }>(`/bookings/${id}`);
      return res.booking;
    },

    async cancel(id: BookingRequestId): Promise<BookingRequest> {
      const res = await apiClient<{ booking: BookingRequest }>(`/bookings/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      return res.booking;
    },

    async simulateConfirm(id: BookingRequestId): Promise<BookingRequest> {
      const res = await apiClient<{ booking: BookingRequest }>(`/bookings/${id}/simulate-confirm`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      return res.booking;
    },
  };

  return {
    places,
    accommodation,
    transport,
    readyMadeTrips,
    trips,
    bookingRequests,
    async resetLocalData(): Promise<void> {
      // No-op for remote API
    },
  };
}
