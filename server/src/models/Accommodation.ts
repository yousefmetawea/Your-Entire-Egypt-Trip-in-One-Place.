import { Schema, model, type Document } from 'mongoose';
import {
  localizedTextSchema,
  priceRangeQuoteSchema,
  geoPointSchema,
  imageAssetSchema,
  standardTransform,
} from './common.js';

export interface IAccommodation extends Document {
  id: string;
  name: { en: string; ar?: string };
  type: 'hotel' | 'hostel';
  priceRange: {
    min: number;
    max: number;
    currency: 'USD' | 'EGP';
    isEstimated: boolean;
    priceUpdatedAt: string;
  } | null;
  amenities: string[];
  location: { lat: number; lng: number } | null;
  images: Array<{
    src: string;
    alt: { en: string; ar?: string };
    width?: number;
    height?: number;
    credit?: string;
    license?: string;
    sourceUrl?: string;
  }>;
  externalUrl: string | null;
  isDemo: boolean;
  placeholders: string[];
}

const accommodationSchema = new Schema<IAccommodation>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: localizedTextSchema, required: true },
    type: { type: String, enum: ['hotel', 'hostel'], required: true, index: true },
    priceRange: { type: priceRangeQuoteSchema, default: null },
    amenities: { type: [String], default: [] },
    location: { type: geoPointSchema, default: null },
    images: { type: [imageAssetSchema], default: [] },
    externalUrl: { type: String, default: null },
    isDemo: { type: Boolean, default: true },
    placeholders: { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: standardTransform,
    },
  },
);

export const AccommodationModel = model<IAccommodation>('Accommodation', accommodationSchema);
