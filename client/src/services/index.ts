import { createMockServices } from './mock/createMockServices';

export const services = createMockServices();

export { ServiceError, isServiceError } from './errors';
export type {
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
} from './contracts';
