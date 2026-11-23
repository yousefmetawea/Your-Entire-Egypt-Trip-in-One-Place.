import crypto from 'crypto';
import { TripModel, type ITrip, type ITripDay, type ITripActivity } from '../models/Trip.js';
import { PlaceModel } from '../models/Place.js';
import { ApiError } from '../errors/ApiError.js';

export interface CreateTripDto {
  title: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget?: { amount: number; currency: 'USD' | 'EGP' } | null;
  budgetTier?: 'essential' | 'balanced' | 'signature' | null;
  interests?: Array<'history' | 'culture' | 'adventure' | 'food'>;
  preferences?: {
    accommodationType?: 'hotel' | 'hostel' | 'any';
    transportType?: 'transfer' | 'private-car' | 'bus' | 'metro' | 'any';
  };
  accommodationId?: string | null;
}

export interface UpdateTripDto {
  title?: string;
  travelers?: number;
  budget?: { amount: number; currency: 'USD' | 'EGP' } | null;
  budgetTier?: 'essential' | 'balanced' | 'signature' | null;
  interests?: Array<'history' | 'culture' | 'adventure' | 'food'>;
  preferences?: {
    accommodationType?: 'hotel' | 'hostel' | 'any';
    transportType?: 'transfer' | 'private-car' | 'bus' | 'metro' | 'any';
  };
  status?: 'draft' | 'upcoming' | 'active' | 'completed' | 'cancelled';
  accommodationId?: string | null;
  savedPlaceIds?: string[];
}

export interface SaveItineraryDto {
  title?: string;
  days: ITripDay[];
  version?: number;
}

export class TripsService {
  static async listUserTrips(userId: string): Promise<ITrip[]> {
    return TripModel.find({ userId }).sort({ updatedAt: -1 });
  }

  static async getUserTripById(tripId: string, userId: string): Promise<ITrip> {
    const trip = await TripModel.findOne({ id: tripId });
    if (!trip) {
      throw ApiError.notFound(`Trip not found: ${tripId}`);
    }

    // Ownership check: User A cannot access User B's trip
    if (trip.userId !== userId) {
      throw ApiError.forbidden('You do not have permission to access this trip');
    }

    return trip;
  }

  static async createTrip(userId: string, input: CreateTripDto): Promise<ITrip> {
    const tripId = `trip_${crypto.randomUUID()}`;

    // Generate initial days between startDate and endDate
    const start = new Date(input.startDate);
    const end = new Date(input.endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);

    const days: ITripDay[] = [];
    for (let i = 0; i < Math.min(diffDays, 14); i++) {
      const dayDate = new Date(start);
      dayDate.setDate(dayDate.getDate() + i);
      const isoDate = dayDate.toISOString().slice(0, 10);
      days.push({
        id: `day_${crypto.randomUUID()}`,
        date: isoDate,
        activities: [],
      });
    }

    const trip = await TripModel.create({
      id: tripId,
      userId,
      title: input.title,
      startDate: input.startDate,
      endDate: input.endDate,
      travelers: input.travelers,
      budget: input.budget ?? null,
      budgetTier: input.budgetTier ?? null,
      interests: input.interests ?? [],
      preferences: input.preferences ?? { accommodationType: 'any', transportType: 'any' },
      status: 'draft',
      days,
      accommodationId: input.accommodationId ?? null,
      savedPlaceIds: [],
      isDemo: false,
      version: 1,
    });

    return trip;
  }

  static async updateTrip(tripId: string, userId: string, patch: UpdateTripDto): Promise<ITrip> {
    const trip = await this.getUserTripById(tripId, userId);

    if (patch.title !== undefined) trip.title = patch.title;
    if (patch.travelers !== undefined) trip.travelers = patch.travelers;
    if (patch.budget !== undefined) trip.budget = patch.budget;
    if (patch.budgetTier !== undefined) trip.budgetTier = patch.budgetTier;
    if (patch.interests !== undefined) trip.interests = patch.interests;
    if (patch.preferences !== undefined) trip.preferences = patch.preferences;
    if (patch.status !== undefined) trip.status = patch.status;
    if (patch.accommodationId !== undefined) trip.accommodationId = patch.accommodationId;
    if (patch.savedPlaceIds !== undefined) trip.savedPlaceIds = patch.savedPlaceIds;

    trip.version += 1;
    await trip.save();
    return trip;
  }

  static async saveItinerary(
    tripId: string,
    userId: string,
    input: SaveItineraryDto,
  ): Promise<ITrip> {
    const trip = await this.getUserTripById(tripId, userId);

    // Conflict detection (optimistic locking)
    if (input.version !== undefined && input.version !== trip.version) {
      throw ApiError.conflict(
        'This trip was modified in another session. Please reload to see the latest changes.',
      );
    }

    if (input.title) {
      trip.title = input.title;
    }

    trip.days = input.days;
    trip.version += 1;

    await trip.save();
    return trip;
  }

  static async deleteTrip(tripId: string, userId: string): Promise<void> {
    const trip = await this.getUserTripById(tripId, userId);
    await trip.deleteOne();
  }

  static async addPlaceToDraft(
    userId: string,
    placeId: string,
  ): Promise<{
    trip: ITrip;
    dayId: string;
    activity: ITripActivity;
    added: boolean;
    createdTrip: boolean;
  }> {
    let trip = await TripModel.findOne({ userId, status: 'draft' });
    let createdTrip = false;

    if (!trip) {
      const today = new Date().toISOString().slice(0, 10);
      await this.createTrip(userId, {
        title: 'My Cairo Trip',
        startDate: today,
        endDate: today,
        travelers: 1,
      });
      trip = await TripModel.findOne({ userId, status: 'draft' });
      createdTrip = true;
    }

    if (!trip) {
      throw ApiError.internal('Failed to create or load draft trip');
    }

    const place = await PlaceModel.findOne({ id: placeId });
    if (!place) {
      throw ApiError.notFound(`Place not found: ${placeId}`);
    }

    // Check if place is already added to any day
    const alreadyExists = trip.days.some((day) =>
      day.activities.some((act) => act.source.type === 'place' && act.source.placeId === placeId),
    );

    if (alreadyExists) {
      throw ApiError.badRequest('This place is already included in your itinerary.');
    }

    if (trip.days.length === 0) {
      trip.days.push({
        id: `day_${crypto.randomUUID()}`,
        date: trip.startDate,
        activities: [],
      });
    }

    const targetDay = trip.days[0];
    const newActivity: ITripActivity = {
      id: `act_${crypto.randomUUID()}`,
      source: { type: 'place', placeId },
      startTime: '09:00',
      durationMin: place.avgVisitMinutes ?? null,
      travelMin: null,
      estimatedCost: place.ticketPrice ?? null,
      order: targetDay.activities.length,
    };

    targetDay.activities.push(newActivity);
    trip.version += 1;
    await trip.save();

    return {
      trip,
      dayId: targetDay.id,
      activity: newActivity,
      added: true,
      createdTrip,
    };
  }
}
