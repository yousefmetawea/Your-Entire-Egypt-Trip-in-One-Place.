import { Schema, model, type Document } from 'mongoose';
import {
  localizedTextSchema,
  priceQuoteSchema,
  geoPointSchema,
  imageAssetSchema,
  openingHoursSchema,
  standardTransform,
} from './common.js';

export type PlaceArea =
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

export interface IPlace extends Document {
  id: string;
  slug: string;
  name: { en: string; ar?: string };
  area: PlaceArea;
  category: 'history' | 'culture' | 'adventure' | 'food';
  description: { en: string; ar?: string } | null;
  history: { en: string; ar?: string } | null;
  images: Array<{
    src: string;
    alt: { en: string; ar?: string };
    width?: number;
    height?: number;
    credit?: string;
    license?: string;
    sourceUrl?: string;
  }>;
  location: { lat: number; lng: number } | null;
  openingHours: Array<{
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    opens: string;
    closes: string;
    closed?: boolean;
  }> | null;
  ticketPrice: {
    amount: number;
    currency: 'USD' | 'EGP';
    isEstimated: boolean;
    priceUpdatedAt: string;
  } | null;
  avgVisitMinutes: number | null;
  tags: string[];
  nearbyPlaceIds: string[];
  tips: Array<{
    title: { en: string; ar?: string };
    body: { en: string; ar?: string };
  }> | null;
  isDemo: boolean;
  placeholders: string[];
}

const placeTipSchema = new Schema(
  {
    title: localizedTextSchema,
    body: localizedTextSchema,
  },
  { _id: false },
);

const placeSchema = new Schema<IPlace>(
  {
    id: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: localizedTextSchema, required: true },
    area: {
      type: String,
      enum: [
        'giza',
        'downtown',
        'islamic-cairo',
        'coptic-cairo',
        'zamalek',
        'old-cairo',
        'luxor',
        'aswan',
        'alexandria',
        'red-sea',
        'sinai',
        'western-desert',
        'siwa',
      ],
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['history', 'culture', 'adventure', 'food'],
      required: true,
      index: true,
    },
    description: { type: localizedTextSchema, default: null },
    history: { type: localizedTextSchema, default: null },
    images: { type: [imageAssetSchema], default: [] },
    location: { type: geoPointSchema, default: null },
    openingHours: { type: [openingHoursSchema], default: null },
    ticketPrice: { type: priceQuoteSchema, default: null },
    avgVisitMinutes: { type: Number, default: null },
    tags: { type: [String], default: [] },
    nearbyPlaceIds: { type: [String], default: [] },
    tips: { type: [placeTipSchema], default: null },
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

// Compound indexes for catalog search & filtering
placeSchema.index({ area: 1, category: 1 });
placeSchema.index({
  'name.en': 'text',
  'description.en': 'text',
  tags: 'text',
});

export const PlaceModel = model<IPlace>('Place', placeSchema);
