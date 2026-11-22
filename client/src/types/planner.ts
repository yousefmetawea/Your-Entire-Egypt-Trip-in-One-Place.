import type {
  AccommodationType,
  CairoArea,
  Place,
  PlaceCategory,
  PlaceId,
  TransportType,
} from './catalog';
import type { IsoDate } from './common';
import type { BudgetTier, Trip, TripId } from './trip';
import type { UserId } from './user';

export const PLANNER_STEPS = [
  'dates',
  'travelers',
  'budget',
  'interests',
  'stay',
  'transport',
] as const;

export type PlannerStep = (typeof PLANNER_STEPS)[number];

export type PlannerField =
  | 'startDate'
  | 'endDate'
  | 'travelers'
  | 'budgetTier'
  | 'interests'
  | 'accommodationType'
  | 'transportType';

export type PlannerErrorCode =
  | 'required'
  | 'invalid-date'
  | 'date-order'
  | 'too-long'
  | 'travelers-invalid'
  | 'travelers-range'
  | 'budget-required'
  | 'interests-required'
  | 'preference-invalid';

export type PlannerErrors = Partial<Record<PlannerField, PlannerErrorCode>>;

export interface PlannerFormValues {
  startDate: string;
  endDate: string;
  travelers: string;
  budgetTier: BudgetTier | '';
  interests: PlaceCategory[];
  accommodationType: AccommodationType | 'any';
  transportType: TransportType | 'any';
}

export interface PlannerAnswers {
  startDate: IsoDate;
  endDate: IsoDate;
  travelers: number;
  budgetTier: BudgetTier;
  interests: PlaceCategory[];
  accommodationType: AccommodationType | 'any';
  transportType: TransportType | 'any';
}

export type PlannerValidationResult =
  { ok: true; answers: PlannerAnswers; dayCount: number } | { ok: false; errors: PlannerErrors };

export interface PlannerPrefill {
  startDate: IsoDate | null;
  endDate: IsoDate | null;
  travelers: number | null;
  hasPrefill: boolean;
}

export interface PlannerProgress {
  version: number;
  values: PlannerFormValues;
  step: PlannerStep;
  generatedTripId: TripId | null;
  includeSavedPlaces: boolean;
}

export type PlannerWarningCode =
  | 'no-matches'
  | 'unmatched-interests'
  | 'omitted-areas'
  | 'omitted-places'
  | 'empty-days'
  | 'missing-durations'
  | 'missing-travel-times'
  | 'missing-prices'
  | 'saved-places-included'
  | 'saved-places-excluded'
  | 'saved-places-missing';

export interface PlannerWarning {
  code: PlannerWarningCode;
  count?: number;
  categories?: PlaceCategory[];
  areas?: CairoArea[];
  dates?: IsoDate[];
  placeIds?: PlaceId[];
}

export interface GeneratedItinerary {
  trip: Trip;
  warnings: PlannerWarning[];
  matchedPlaceIds: PlaceId[];
  omittedPlaceIds: PlaceId[];
  candidateCount: number;
}

export type ItineraryGenerationResult =
  { ok: true; itinerary: GeneratedItinerary } | { ok: false; warnings: PlannerWarning[] };

export interface GenerateItineraryInput {
  tripId: TripId;
  userId: UserId;
  title: string;
  answers: PlannerAnswers;
  places: readonly Place[];
  savedPlaceIds?: readonly PlaceId[];
  includeSavedPlaces?: boolean;
}

export interface CreatePlannedTripInput {
  answers: PlannerAnswers;
  replaceTripId?: TripId | null;
  includeSavedPlaces?: boolean;
}

export interface CreatePlannedTripResult {
  trip: Trip;
  warnings: PlannerWarning[];
  matchedPlaceIds: PlaceId[];
  omittedPlaceIds: PlaceId[];
  createdTrip: boolean;
  replacedTrip: boolean;
}
