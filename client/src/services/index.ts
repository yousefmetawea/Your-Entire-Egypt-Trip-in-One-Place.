import { createMockServices } from './mock/createMockServices';

export const services = createMockServices();

export { ServiceError, isServiceError } from './errors';
export type {
  AccommodationQuery,
  AccommodationService,
  AddPlaceToDraftResult,
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
} from './contracts';
