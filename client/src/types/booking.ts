import type { PlaceId } from './catalog';
import type { IsoDate, IsoDateTime } from './common';
import type { TripId } from './trip';
import type { UserId } from './user';

export type BookingRequestId = string;

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export type BookingRequestKind = 'airport-transfer' | 'guided-tour';

export interface BookingStatusChange {
  status: BookingStatus;
  changedAt: IsoDateTime;
  note?: string;
}

export interface AirportTransferDetails {
  pickupLocation: string;
  dropoffLocation: string;
  date: IsoDate;
  time: string;
  passengers: number;
  flightNumber?: string;
  notes?: string;
}

export interface GuidedTourDetails {
  placeId: PlaceId;
  date: IsoDate;
  time: string;
  groupSize: number;
  notes?: string;
}

interface BookingRequestBase {
  id: BookingRequestId;
  userId: UserId;
  tripId: TripId | null;
  status: BookingStatus;
  createdAt: IsoDateTime;
  statusHistory: BookingStatusChange[];
  isDemo: boolean;
}

export interface AirportTransferBookingRequest extends BookingRequestBase {
  kind: 'airport-transfer';
  details: AirportTransferDetails;
}

export interface GuidedTourBookingRequest extends BookingRequestBase {
  kind: 'guided-tour';
  details: GuidedTourDetails;
}

export type BookingRequest = AirportTransferBookingRequest | GuidedTourBookingRequest;
