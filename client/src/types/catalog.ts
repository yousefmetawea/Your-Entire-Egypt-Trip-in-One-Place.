import type {
  GeoPoint,
  ImageAsset,
  LocalizedText,
  OpeningHours,
  PriceQuote,
  PriceRangeQuote,
} from './common';

export type PlaceId = string;

export type CairoArea =
  | 'giza'
  | 'downtown'
  | 'islamic-cairo'
  | 'coptic-cairo'
  | 'zamalek'
  | 'old-cairo'
  | 'luxor'
  | 'aswan'
  | 'alexandria'
  | 'red-sea'
  | 'sinai'
  | 'western-desert'
  | 'siwa';

export type EgyptArea = CairoArea;

export type PlaceCategory = 'history' | 'culture' | 'adventure' | 'food';

export type PlacePlaceholderField =
  | 'description'
  | 'history'
  | 'images'
  | 'location'
  | 'openingHours'
  | 'ticketPrice'
  | 'avgVisitMinutes'
  | 'nearbyPlaceIds'
  | 'tips';

export interface PlaceTip {
  title: LocalizedText;
  body: LocalizedText;
}

export interface Place {
  id: PlaceId;
  slug: string;
  name: LocalizedText;
  area: CairoArea;
  category: PlaceCategory;
  description: LocalizedText | null;
  history: LocalizedText | null;
  images: ImageAsset[];
  location: GeoPoint | null;
  openingHours: OpeningHours[] | null;
  ticketPrice: PriceQuote | null;
  avgVisitMinutes: number | null;
  tags: string[];
  nearbyPlaceIds: PlaceId[];
  tips: PlaceTip[] | null;
  isDemo: boolean;
  placeholders: PlacePlaceholderField[];
}

export type AccommodationId = string;

export type AccommodationType = 'hotel' | 'hostel';

export type AccommodationPlaceholderField =
  'priceRange' | 'amenities' | 'location' | 'images' | 'externalUrl';

export interface Accommodation {
  id: AccommodationId;
  name: LocalizedText;
  type: AccommodationType;
  priceRange: PriceRangeQuote | null;
  amenities: string[];
  location: GeoPoint | null;
  images: ImageAsset[];
  externalUrl: string | null;
  isDemo: boolean;
  placeholders: AccommodationPlaceholderField[];
}

export type TransportOptionId = string;

export type TransportType = 'transfer' | 'private-car' | 'bus' | 'metro';

export type BookingChannel = 'internal' | 'external';

export type TransportPlaceholderField = 'description' | 'estimatedPrice' | 'notes' | 'externalUrl';

export interface TransportOption {
  id: TransportOptionId;
  name: LocalizedText;
  type: TransportType;
  description: LocalizedText | null;
  estimatedPrice: PriceQuote | null;
  notes: LocalizedText | null;
  bookable: BookingChannel;
  externalUrl: string | null;
  isDemo: boolean;
  placeholders: TransportPlaceholderField[];
}

export type ReadyMadeTripId = string;

export interface ReadyMadeTripDay {
  dayNumber: number;
  placeIds: PlaceId[];
}

export interface ReadyMadeTrip {
  id: ReadyMadeTripId;
  title: LocalizedText;
  description: LocalizedText | null;
  durationDays: number;
  days: ReadyMadeTripDay[];
  images?: ImageAsset[];
  isDemo: boolean;
}
