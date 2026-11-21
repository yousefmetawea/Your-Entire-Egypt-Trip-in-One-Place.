import type {
  Accommodation,
  AccommodationId,
  AccommodationType,
  AirportTransferDetails,
  BookingRequest,
  BookingRequestId,
  CairoArea,
  GuidedTourDetails,
  IsoDate,
  Money,
  Place,
  PlaceCategory,
  PlaceId,
  PriceQuote,
  ReadyMadeTrip,
  ReadyMadeTripId,
  TransportOption,
  TransportType,
  Trip,
  TripActivity,
  TripActivitySource,
  TripDayId,
  TripId,
  TripPreferences,
} from '../types';

export interface PlaceQuery {
  search?: string;
  area?: CairoArea;
  category?: PlaceCategory;
}

export interface AccommodationQuery {
  type?: AccommodationType;
}

export interface TransportQuery {
  type?: TransportType;
}

export interface CreateTripInput {
  title: string;
  startDate: IsoDate;
  endDate: IsoDate;
  travelers: number;
  budget?: Money | null;
  interests?: PlaceCategory[];
  preferences?: TripPreferences;
  accommodationId?: AccommodationId | null;
}

export type UpdateTripInput = Partial<
  Pick<
    Trip,
    | 'title'
    | 'travelers'
    | 'budget'
    | 'interests'
    | 'preferences'
    | 'status'
    | 'accommodationId'
    | 'savedPlaceIds'
  >
>;

export interface CreateTripActivityInput {
  source: TripActivitySource;
  startTime: string;
  durationMin: number;
  travelMin: number;
  estimatedCost?: PriceQuote | null;
  notes?: string;
}

export interface AddPlaceToDraftResult {
  trip: Trip;
  dayId: TripDayId;
  activity: TripActivity;
  added: boolean;
  createdTrip: boolean;
}

export type CreateBookingRequestInput =
  | {
      kind: 'airport-transfer';
      tripId?: TripId | null;
      details: AirportTransferDetails;
    }
  | {
      kind: 'guided-tour';
      tripId?: TripId | null;
      details: GuidedTourDetails;
    };

export interface PlaceService {
  list(query?: PlaceQuery): Promise<Place[]>;
  getById(id: PlaceId): Promise<Place>;
  getBySlug(slug: string): Promise<Place>;
  getNearby(placeId: PlaceId, limit?: number): Promise<Place[]>;
}

export interface AccommodationService {
  list(query?: AccommodationQuery): Promise<Accommodation[]>;
  getById(id: AccommodationId): Promise<Accommodation>;
}

export interface TransportService {
  list(query?: TransportQuery): Promise<TransportOption[]>;
}

export interface ReadyMadeTripService {
  list(): Promise<ReadyMadeTrip[]>;
  getById(id: ReadyMadeTripId): Promise<ReadyMadeTrip>;
}

export interface TripService {
  listMine(): Promise<Trip[]>;
  getById(id: TripId): Promise<Trip>;
  create(input: CreateTripInput): Promise<Trip>;
  update(id: TripId, patch: UpdateTripInput): Promise<Trip>;
  remove(id: TripId): Promise<void>;
  addPlaceToDraft(placeId: PlaceId, place?: Place): Promise<AddPlaceToDraftResult>;
  addActivity(tripId: TripId, dayId: TripDayId, input: CreateTripActivityInput): Promise<Trip>;
  removeActivity(tripId: TripId, dayId: TripDayId, activityId: string): Promise<Trip>;
  reorderActivities(tripId: TripId, dayId: TripDayId, activityIds: string[]): Promise<Trip>;
}

export interface BookingRequestService {
  create(input: CreateBookingRequestInput): Promise<BookingRequest>;
  listMine(): Promise<BookingRequest[]>;
  getById(id: BookingRequestId): Promise<BookingRequest>;
}

export interface Services {
  places: PlaceService;
  accommodation: AccommodationService;
  transport: TransportService;
  readyMadeTrips: ReadyMadeTripService;
  trips: TripService;
  bookingRequests: BookingRequestService;
}
