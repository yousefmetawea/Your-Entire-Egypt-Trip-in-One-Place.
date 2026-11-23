import { Schema, model, type Document } from 'mongoose';
import { moneySchema, priceQuoteSchema, standardTransform } from './common.js';

export type TripStatus = 'draft' | 'upcoming' | 'active' | 'completed' | 'cancelled';
export type BudgetTier = 'essential' | 'balanced' | 'signature';

export interface ITripActivity {
  id: string;
  source: { type: 'place'; placeId: string } | { type: 'custom'; title: string };
  startTime: string | null;
  durationMin: number | null;
  travelMin: number | null;
  estimatedCost: {
    amount: number;
    currency: 'USD' | 'EGP';
    isEstimated: boolean;
    priceUpdatedAt: string;
  } | null;
  order: number;
  notes?: string;
}

export interface ITripDay {
  id: string;
  date: string;
  activities: ITripActivity[];
}

export interface ITrip extends Document {
  id: string;
  userId: string;
  title: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: { amount: number; currency: 'USD' | 'EGP' } | null;
  budgetTier?: BudgetTier | null;
  interests: Array<'history' | 'culture' | 'adventure' | 'food'>;
  preferences: {
    accommodationType?: 'hotel' | 'hostel' | 'any';
    transportType?: 'transfer' | 'private-car' | 'bus' | 'metro' | 'any';
  };
  status: TripStatus;
  days: ITripDay[];
  accommodationId: string | null;
  savedPlaceIds: string[];
  isDemo: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

const tripActivitySourceSchema = new Schema(
  {
    type: { type: String, enum: ['place', 'custom'], required: true },
    placeId: { type: String },
    title: { type: String },
  },
  { _id: false },
);

const tripActivitySchema = new Schema(
  {
    id: { type: String, required: true },
    source: { type: tripActivitySourceSchema, required: true },
    startTime: { type: String, default: null },
    durationMin: { type: Number, default: null },
    travelMin: { type: Number, default: null },
    estimatedCost: { type: priceQuoteSchema, default: null },
    order: { type: Number, required: true },
    notes: { type: String },
  },
  { _id: false },
);

const tripDaySchema = new Schema(
  {
    id: { type: String, required: true },
    date: { type: String, required: true },
    activities: { type: [tripActivitySchema], default: [] },
  },
  { _id: false },
);

const tripSchema = new Schema<ITrip>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    travelers: { type: Number, required: true, min: 1, max: 12 },
    budget: { type: moneySchema, default: null },
    budgetTier: {
      type: String,
      enum: ['essential', 'balanced', 'signature'],
      default: null,
    },
    interests: {
      type: [String],
      enum: ['history', 'culture', 'adventure', 'food'],
      default: [],
    },
    preferences: {
      accommodationType: { type: String, default: 'any' },
      transportType: { type: String, default: 'any' },
    },
    status: {
      type: String,
      enum: ['draft', 'upcoming', 'active', 'completed', 'cancelled'],
      default: 'draft',
      required: true,
    },
    days: { type: [tripDaySchema], default: [] },
    accommodationId: { type: String, default: null },
    savedPlaceIds: { type: [String], default: [] },
    isDemo: { type: Boolean, default: false },
    version: { type: Number, default: 1 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: standardTransform,
    },
  },
);

// Compound index for user trip listing and sorting
tripSchema.index({ userId: 1, updatedAt: -1 });

export const TripModel = model<ITrip>('Trip', tripSchema);
