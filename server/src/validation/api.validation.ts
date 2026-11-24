import { z } from 'zod';

export const areaEnum = z.enum([
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
]);

export const placeQuerySchema = z.object({
  search: z.string().optional(),
  area: areaEnum.optional(),
  category: z.enum(['history', 'culture', 'adventure', 'food']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export const accommodationQuerySchema = z.object({
  type: z.enum(['hotel', 'hostel']).optional(),
  area: areaEnum.optional(),
  amenity: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export const transportQuerySchema = z.object({
  type: z.enum(['transfer', 'private-car', 'bus', 'metro']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

const moneySchema = z.object({
  amount: z.number().nonnegative(),
  currency: z.enum(['USD', 'EGP']),
});

const priceQuoteSchema = moneySchema.extend({
  isEstimated: z.boolean(),
  priceUpdatedAt: z.string(),
});

const tripActivitySourceSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('place'), placeId: z.string().min(1) }),
  z.object({ type: z.literal('custom'), title: z.string().trim().min(1) }),
]);

export const tripActivitySchema = z.object({
  id: z.string().min(1),
  source: tripActivitySourceSchema,
  startTime: z.string().nullable().optional(),
  durationMin: z.number().int().positive().nullable().optional(),
  travelMin: z.number().int().nonnegative().nullable().optional(),
  estimatedCost: priceQuoteSchema.nullable().optional(),
  order: z.number().int().nonnegative(),
  notes: z.string().optional(),
});

export const tripDaySchema = z.object({
  id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be ISO YYYY-MM-DD'),
  activities: z.array(tripActivitySchema),
});

export const createTripSchema = z.object({
  title: z.string().trim().min(1, 'Trip title is required').max(100),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be ISO YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be ISO YYYY-MM-DD'),
  travelers: z.number().int().min(1).max(12),
  budget: moneySchema.nullable().optional(),
  budgetTier: z.enum(['essential', 'balanced', 'signature']).nullable().optional(),
  interests: z.array(z.enum(['history', 'culture', 'adventure', 'food'])).optional(),
  preferences: z
    .object({
      accommodationType: z.enum(['hotel', 'hostel', 'any']).optional(),
      transportType: z.enum(['transfer', 'private-car', 'bus', 'metro', 'any']).optional(),
    })
    .optional(),
  accommodationId: z.string().nullable().optional(),
});

export const updateTripSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),
  travelers: z.number().int().min(1).max(12).optional(),
  budget: moneySchema.nullable().optional(),
  budgetTier: z.enum(['essential', 'balanced', 'signature']).nullable().optional(),
  interests: z.array(z.enum(['history', 'culture', 'adventure', 'food'])).optional(),
  preferences: z
    .object({
      accommodationType: z.enum(['hotel', 'hostel', 'any']).optional(),
      transportType: z.enum(['transfer', 'private-car', 'bus', 'metro', 'any']).optional(),
    })
    .optional(),
  status: z.enum(['draft', 'upcoming', 'active', 'completed', 'cancelled']).optional(),
  accommodationId: z.string().nullable().optional(),
  savedPlaceIds: z.array(z.string()).optional(),
});

export const saveItinerarySchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),
  days: z
    .array(tripDaySchema)
    .min(1, 'Trip must have at least one day')
    .max(14, 'Trip cannot exceed 14 days'),
  version: z.number().int().positive().optional(),
});

const airportTransferDetailsSchema = z.object({
  pickupLocation: z.string().trim().min(1, 'Pickup location is required'),
  dropoffLocation: z.string().trim().min(1, 'Dropoff location is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be ISO YYYY-MM-DD'),
  time: z.string().min(1, 'Time is required'),
  passengers: z.number().int().min(1).max(20),
  flightNumber: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const guidedTourDetailsSchema = z.object({
  placeId: z.string().min(1, 'Place ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be ISO YYYY-MM-DD'),
  time: z.string().min(1, 'Time is required'),
  groupSize: z.number().int().min(1).max(50),
  notes: z.string().trim().optional(),
});

export const createBookingRequestSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('airport-transfer'),
    tripId: z.string().nullable().optional(),
    details: airportTransferDetailsSchema,
  }),
  z.object({
    kind: z.literal('guided-tour'),
    tripId: z.string().nullable().optional(),
    details: guidedTourDetailsSchema,
  }),
]);

export const createTripActivityInputSchema = z.object({
  source: tripActivitySourceSchema,
  startTime: z.string().min(1),
  durationMin: z.number().int().positive(),
  travelMin: z.number().int().nonnegative(),
  estimatedCost: priceQuoteSchema.nullable().optional(),
  notes: z.string().optional(),
});

export const reorderActivitiesSchema = z.object({
  activityIds: z.array(z.string()).min(1),
});
