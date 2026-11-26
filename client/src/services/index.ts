import { createMockServices } from './mock/createMockServices';
import { createApiServices } from './api/createApiServices';

// Switchable data source. An explicit VITE_DATA_SOURCE always wins.
// Otherwise: in development the default is 'api'. In a production build the
// default is 'api' only when a real (non-localhost) VITE_API_BASE_URL is set,
// so a deploy with no backend falls back to the demo (mock) data instead of
// calling an unreachable API.
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').trim();
const hasRealApi = apiBaseUrl !== '' && !/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(apiBaseUrl);
const defaultSource = import.meta.env.PROD && !hasRealApi ? 'mock' : 'api';
export const dataSource = import.meta.env.VITE_DATA_SOURCE ?? defaultSource;

export const services = dataSource === 'mock' ? createMockServices() : createApiServices();

export { ServiceError, isServiceError } from './errors';
export type {
  AccommodationQuery,
  AccommodationService,
  AddPlaceToDraftResult,
  AdminBookingService,
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
