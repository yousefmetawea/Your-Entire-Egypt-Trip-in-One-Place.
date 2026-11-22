import type {
  AccommodationId,
  AccommodationType,
  PlaceCategory,
  PlaceId,
  TransportType,
} from './catalog';
import type { IsoDate, Money, PriceQuote } from './common';
import type { UserId } from './user';

export type TripId = string;

export type TripStatus = 'draft' | 'upcoming' | 'active' | 'completed' | 'cancelled';

export type BudgetTier = 'essential' | 'balanced' | 'signature';

export type TripDayId = string;

export type TripActivityId = string;

export type TripActivitySource =
  { type: 'place'; placeId: PlaceId } | { type: 'custom'; title: string };

export interface TripActivity {
  id: TripActivityId;
  source: TripActivitySource;
  startTime: string | null;
  durationMin: number | null;
  travelMin: number | null;
  estimatedCost: PriceQuote | null;
  order: number;
  notes?: string;
}

export interface TripDay {
  id: TripDayId;
  date: IsoDate;
  activities: TripActivity[];
}

export interface TripPreferences {
  accommodationType?: AccommodationType | 'any';
  transportType?: TransportType | 'any';
}

export interface Trip {
  id: TripId;
  userId: UserId;
  title: string;
  startDate: IsoDate;
  endDate: IsoDate;
  travelers: number;
  budget: Money | null;
  budgetTier?: BudgetTier | null;
  interests: PlaceCategory[];
  preferences: TripPreferences;
  status: TripStatus;
  days: TripDay[];
  accommodationId: AccommodationId | null;
  savedPlaceIds: PlaceId[];
  isDemo: boolean;
}
