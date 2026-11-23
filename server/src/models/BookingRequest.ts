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

export interface IBookingRequest extends Document {
  id: string;
  userId: string;
  tripId: string | null;
  kind: BookingRequestKind;
  details: IAirportTransferDetails | IGuidedTourDetails;
  status: BookingStatus;
  createdAt: string;
  statusHistory: IBookingStatusChange[];
  isDemo: boolean;
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
    userId: { type: String, required: true, index: true },
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
    isDemo: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    toJSON: {
      virtuals: true,
      transform: standardTransform,
    },
  },
);

bookingRequestSchema.index({ userId: 1, createdAt: -1 });

export const BookingRequestModel = model<IBookingRequest>('BookingRequest', bookingRequestSchema);
