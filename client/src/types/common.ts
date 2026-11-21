export type IsoDate = string;

export type IsoDateTime = string;

export type CurrencyCode = 'USD' | 'EGP';

export interface LocalizedText {
  en: string;
  ar?: string;
}

export interface Money {
  amount: number;
  currency: CurrencyCode;
}

export interface PriceQuote extends Money {
  isEstimated: boolean;
  priceUpdatedAt: IsoDate;
}

export interface PriceRangeQuote {
  min: number;
  max: number;
  currency: CurrencyCode;
  isEstimated: boolean;
  priceUpdatedAt: IsoDate;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface ImageAsset {
  src: string;
  alt: LocalizedText;
  width?: number;
  height?: number;
  credit?: string;
  license?: string;
  sourceUrl?: string;
}

export type Weekday =
  'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface OpeningHours {
  day: Weekday;
  opens: string;
  closes: string;
  closed?: boolean;
}
