import { createMockServices } from './mock/createMockServices';
import { createApiServices } from './api/createApiServices';

// Switchable data source: default to 'api', allow 'mock' via environment variable
const dataSource = import.meta.env.VITE_DATA_SOURCE ?? 'api';

export const services = dataSource === 'mock' ? createMockServices() : createApiServices();

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
