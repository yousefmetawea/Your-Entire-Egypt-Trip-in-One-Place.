import { Schema, model, type Document } from 'mongoose';
import { standardTransform } from './common.js';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
export type BookingRequestKind = 'airport-transfer' | 'guided-tour';

export interface IBookingStatusChange {
  status: BookingStatus;
  changedAt: string;
  note?: string;
}

export interface IAirportTransferDetails {
  pickupLocation: string;
  dropoffLocation: string;
  date: string;
  time: string;
  passengers: number;
  flightNumber?: string;
  notes?: string;
}

export interface IGuidedTourDetails {
  placeId: string;
  date: string;
  time: string;
  groupSize: number;
  notes?: string;
}

export interface IBookingContact {
  name: string;
  phone: string;
  email?: string;
}

export interface IBookingRequest extends Document {
  id: string;
  /** Missing only on records created before reference codes existed. Backfilled at startup. */
  referenceCode?: string;
  /** null for guest requests (no account). */
  userId: string | null;
  /** Missing on records created before contact details existed. */
  contact?: IBookingContact;
  tripId: string | null;
  kind: BookingRequestKind;
  details: IAirportTransferDetails | IGuidedTourDetails;
  status: BookingStatus;
  createdAt: string;
  statusHistory: IBookingStatusChange[];
}

const bookingStatusChangeSchema = new Schema(
  {
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      required: true,
    },
    changedAt: { type: String, required: true },
    note: { type: String },
  },
  { _id: false },
);

const bookingRequestSchema = new Schema<IBookingRequest>(
  {
    id: { type: String, required: true, unique: true, index: true },
    referenceCode: { type: String },
    userId: { type: String, default: null, index: true },
    contact: {
      type: new Schema(
        {
          name: { type: String, required: true, trim: true },
          phone: { type: String, required: true, trim: true },
          email: { type: String, trim: true, lowercase: true },
        },
        { _id: false },
      ),
      required: false,
    },
    tripId: { type: String, default: null, index: true },
    kind: {
      type: String,
      enum: ['airport-transfer', 'guided-tour'],
      required: true,
    },
    details: { type: Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
      required: true,
    },
    statusHistory: { type: [bookingStatusChangeSchema], default: [] },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    toJSON: {
      virtuals: true,
      transform: standardTransform,
    },
  },
);

// Partial so records created before reference codes existed (no code) never collide.
bookingRequestSchema.index(
  { referenceCode: 1 },
  { unique: true, partialFilterExpression: { referenceCode: { $type: 'string' } } },
);
bookingRequestSchema.index({ userId: 1, createdAt: -1 });
bookingRequestSchema.index({ status: 1, createdAt: -1 });

export const BookingRequestModel = model<IBookingRequest>('BookingRequest', bookingRequestSchema);
