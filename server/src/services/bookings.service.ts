import crypto from 'crypto';
import {
  BookingRequestModel,
  type BookingStatus,
  type IBookingContact,
  type IBookingRequest,
  type IAirportTransferDetails,
  type IGuidedTourDetails,
} from '../models/BookingRequest.js';
import { ApiError } from '../errors/ApiError.js';

export interface CreateBookingRequestDto {
  kind: 'airport-transfer' | 'guided-tour';
  tripId?: string | null;
  contact: IBookingContact;
  details: IAirportTransferDetails | IGuidedTourDetails;
}

const REFERENCE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomReferenceCode(): string {
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += REFERENCE_ALPHABET[crypto.randomInt(REFERENCE_ALPHABET.length)];
  }
  return `EG-${code}`;
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
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
    if (!booking.userId || booking.userId !== userId) {
      throw ApiError.forbidden('You do not have permission to access this booking request');
    }

    return booking;
  }

  /** userId is null for guest requests. */
  static async createBooking(
    userId: string | null,
    input: CreateBookingRequestDto,
  ): Promise<IBookingRequest> {
    const now = new Date().toISOString();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        return await BookingRequestModel.create({
          id: `booking_${crypto.randomUUID()}`,
          referenceCode: randomReferenceCode(),
          userId,
          tripId: input.tripId ?? null,
          kind: input.kind,
          contact: input.contact,
          details: input.details,
          status: 'pending',
          statusHistory: [
            {
              status: 'pending',
              changedAt: now,
              note: 'Request received. We will contact you to confirm.',
            },
          ],
        });
      } catch (error) {
        const duplicate = (error as { code?: number }).code === 11000;
        if (!duplicate || attempt === 4) throw error;
      }
    }
    throw ApiError.internal('Could not allocate a reference code');
  }

  /**
   * Gives a reference code to records created before codes existed, so old
   * data keeps working. Safe to run on every start. Returns how many it fixed.
   */
  static async backfillLegacyReferenceCodes(): Promise<number> {
    const legacy = await BookingRequestModel.find({
      $or: [{ referenceCode: { $exists: false } }, { referenceCode: null }, { referenceCode: '' }],
    }).select('_id');
    let fixed = 0;
    for (const doc of legacy) {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
          await BookingRequestModel.updateOne(
            { _id: doc._id },
            { $set: { referenceCode: randomReferenceCode() } },
          );
          fixed += 1;
          break;
        } catch (error) {
          if ((error as { code?: number }).code !== 11000) throw error;
        }
      }
    }
    return fixed;
  }

  /** Guest lookup: reference code plus the phone number used on the request. */
  static async trackBooking(referenceCode: string, phone: string): Promise<IBookingRequest> {
    const booking = await BookingRequestModel.findOne({ referenceCode });
    const wanted = digitsOnly(phone);
    if (!booking || !wanted || digitsOnly(booking.contact?.phone ?? '') !== wanted) {
      // Same answer for both cases so codes cannot be probed.
      throw ApiError.notFound('No request matches that reference code and phone number');
    }
    return booking;
  }

  private static applyCustomerCancel(booking: IBookingRequest): void {
    // Enforce valid status transition: Only pending requests can be cancelled
    if (booking.status !== 'pending') {
      throw ApiError.badRequest(
        `Cannot cancel request in "${booking.status}" status. Only pending requests can be cancelled.`,
      );
    }
    booking.status = 'cancelled';
    booking.statusHistory.push({
      status: 'cancelled',
      changedAt: new Date().toISOString(),
      note: 'Cancelled by customer',
    });
  }

  static async cancelBooking(id: string, userId: string): Promise<IBookingRequest> {
    const booking = await this.getUserBookingById(id, userId);
    this.applyCustomerCancel(booking);
    await booking.save();
    return booking;
  }

  static async cancelTrackedBooking(
    referenceCode: string,
    phone: string,
  ): Promise<IBookingRequest> {
    const booking = await this.trackBooking(referenceCode, phone);
    this.applyCustomerCancel(booking);
    await booking.save();
    return booking;
  }

  // ---- Operator (admin) ----

  static async listAllBookings(status?: BookingStatus): Promise<IBookingRequest[]> {
    return BookingRequestModel.find(status ? { status } : {})
      .sort({ createdAt: -1 })
      .limit(500);
  }

  static async setStatusByOperator(
    id: string,
    status: 'confirmed' | 'cancelled',
    note?: string,
  ): Promise<IBookingRequest> {
    const booking = await BookingRequestModel.findOne({ id });
    if (!booking) {
      throw ApiError.notFound(`Booking request not found: ${id}`);
    }

    const allowed =
      booking.status === 'pending' || (booking.status === 'confirmed' && status === 'cancelled');
    if (!allowed || booking.status === status) {
      throw ApiError.badRequest(`Cannot change a "${booking.status}" request to "${status}".`);
    }

    const label = status === 'confirmed' ? 'Confirmed' : 'Declined';
    booking.status = status;
    booking.statusHistory.push({
      status,
      changedAt: new Date().toISOString(),
      note: note ? `${label}: ${note}` : label,
    });
    await booking.save();
    return booking;
  }
}
