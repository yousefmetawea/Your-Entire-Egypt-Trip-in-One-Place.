import crypto from 'crypto';
import {
  BookingRequestModel,
  type IBookingRequest,
  type IAirportTransferDetails,
  type IGuidedTourDetails,
} from '../models/BookingRequest.js';
import { ApiError } from '../errors/ApiError.js';
import { env } from '../config/env.js';

export interface CreateBookingRequestDto {
  kind: 'airport-transfer' | 'guided-tour';
  tripId?: string | null;
  details: IAirportTransferDetails | IGuidedTourDetails;
}

export class BookingsService {
  static async listUserBookings(userId: string): Promise<IBookingRequest[]> {
    return BookingRequestModel.find({ userId }).sort({ createdAt: -1 });
  }

  static async getUserBookingById(id: string, userId: string): Promise<IBookingRequest> {
    const booking = await BookingRequestModel.findOne({ id });
    if (!booking) {
      throw ApiError.notFound(`Booking request not found: ${id}`);
    }

    // Ownership check: User A cannot access User B's bookings
    if (booking.userId !== userId) {
      throw ApiError.forbidden('You do not have permission to access this booking request');
    }

    return booking;
  }

  static async createBooking(
    userId: string,
    input: CreateBookingRequestDto,
  ): Promise<IBookingRequest> {
    const bookingId = `booking_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const booking = await BookingRequestModel.create({
      id: bookingId,
      userId,
      tripId: input.tripId ?? null,
      kind: input.kind,
      details: input.details,
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          changedAt: now,
          note: 'Booking request created and pending provider confirmation',
        },
      ],
      isDemo: false,
    });

    return booking;
  }

  static async cancelBooking(id: string, userId: string): Promise<IBookingRequest> {
    const booking = await this.getUserBookingById(id, userId);

    // Enforce valid status transition: Only pending requests can be cancelled
    if (booking.status !== 'pending') {
      throw ApiError.badRequest(
        `Cannot cancel request in "${booking.status}" status. Only pending requests can be cancelled.`,
      );
    }

    const now = new Date().toISOString();
    booking.status = 'cancelled';
    booking.statusHistory.push({
      status: 'cancelled',
      changedAt: now,
      note: 'Cancelled by user',
    });

    await booking.save();
    return booking;
  }

  static async simulateConfirm(id: string, userId: string): Promise<IBookingRequest> {
    // Explicit server gating: Only available when ENABLE_DEMO_ACTIONS is true
    if (!env.enableDemoActions) {
      throw ApiError.forbidden('Simulated actions are disabled on this server');
    }

    const booking = await this.getUserBookingById(id, userId);

    // Transition from pending to confirmed only
    if (booking.status !== 'pending') {
      throw ApiError.badRequest(
        `Cannot confirm booking in "${booking.status}" status. Only pending bookings can be confirmed.`,
      );
    }

    const now = new Date().toISOString();
    booking.status = 'confirmed';
    booking.statusHistory.push({
      status: 'confirmed',
      changedAt: now,
      note: 'Simulated confirmation via demo controls',
    });

    await booking.save();
    return booking;
  }
}
