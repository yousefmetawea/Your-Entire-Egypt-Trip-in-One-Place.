import { Schema, model, type Document } from 'mongoose';
import { localizedTextSchema, priceQuoteSchema, standardTransform } from './common.js';

export interface ITransportOption extends Document {
  id: string;
  name: { en: string; ar?: string };
  type: 'transfer' | 'private-car' | 'bus' | 'metro';
  description: { en: string; ar?: string } | null;
  estimatedPrice: {
    amount: number;
    currency: 'USD' | 'EGP';
    isEstimated: boolean;
    priceUpdatedAt: string;
  } | null;
  notes: { en: string; ar?: string } | null;
  bookable: 'internal' | 'external';
  externalUrl: string | null;
  isDemo: boolean;
  placeholders: string[];
}

const transportOptionSchema = new Schema<ITransportOption>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: localizedTextSchema, required: true },
    type: {
      type: String,
      enum: ['transfer', 'private-car', 'bus', 'metro'],
      required: true,
      index: true,
    },
    description: { type: localizedTextSchema, default: null },
    estimatedPrice: { type: priceQuoteSchema, default: null },
    notes: { type: localizedTextSchema, default: null },
    bookable: { type: String, enum: ['internal', 'external'], required: true },
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

export const TransportOptionModel = model<ITransportOption>(
  'TransportOption',
  transportOptionSchema,
);
