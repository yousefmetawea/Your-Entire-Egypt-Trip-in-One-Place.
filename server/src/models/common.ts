import { Schema, type SchemaDefinition } from 'mongoose';

export const localizedTextSchema: SchemaDefinition = {
  en: { type: String, required: true },
  ar: { type: String },
};

export const moneySchema: SchemaDefinition = {
  amount: { type: Number, required: true },
  currency: { type: String, enum: ['USD', 'EGP'], required: true },
};

export const priceQuoteSchema: SchemaDefinition = {
  amount: { type: Number, required: true },
  currency: { type: String, enum: ['USD', 'EGP'], required: true },
  isEstimated: { type: Boolean, required: true },
  priceUpdatedAt: { type: String, required: true },
};

export const priceRangeQuoteSchema: SchemaDefinition = {
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  currency: { type: String, enum: ['USD', 'EGP'], required: true },
  isEstimated: { type: Boolean, required: true },
  priceUpdatedAt: { type: String, required: true },
};

export const geoPointSchema: SchemaDefinition = {
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
};

export const imageAssetSchema = new Schema(
  {
    src: { type: String, required: true },
    alt: localizedTextSchema,
    width: { type: Number },
    height: { type: Number },
    credit: { type: String },
    license: { type: String },
    sourceUrl: { type: String },
  },
  { _id: false },
);

export const openingHoursSchema = new Schema(
  {
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true,
    },
    opens: { type: String, required: true },
    closes: { type: String, required: true },
    closed: { type: Boolean, default: false },
  },
  { _id: false },
);

export const standardTransform = (_doc: unknown, ret: Record<string, unknown>) => {
  ret.id = ret.id || String(ret._id);
  delete ret._id;
  delete ret.__v;
  return ret;
};
