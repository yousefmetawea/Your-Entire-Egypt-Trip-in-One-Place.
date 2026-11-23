import { Schema, model, type Document } from 'mongoose';
import { localizedTextSchema, standardTransform } from './common.js';

export interface IReadyMadeTripDay {
  dayNumber: number;
  placeIds: string[];
}

export interface IReadyMadeTrip extends Document {
  id: string;
  title: { en: string; ar?: string };
  description: { en: string; ar?: string } | null;
  durationDays: number;
  days: IReadyMadeTripDay[];
  isDemo: boolean;
}

const readyMadeTripDaySchema = new Schema(
  {
    dayNumber: { type: Number, required: true },
    placeIds: { type: [String], default: [] },
  },
  { _id: false },
);

const readyMadeTripSchema = new Schema<IReadyMadeTrip>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: localizedTextSchema, required: true },
    description: { type: localizedTextSchema, default: null },
    durationDays: { type: Number, required: true },
    days: { type: [readyMadeTripDaySchema], default: [] },
    isDemo: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: standardTransform,
    },
  },
);

export const ReadyMadeTripModel = model<IReadyMadeTrip>('ReadyMadeTrip', readyMadeTripSchema);
