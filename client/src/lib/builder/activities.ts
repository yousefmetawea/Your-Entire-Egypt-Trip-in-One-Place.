import type { Place, PriceQuote, TripActivity } from '../../types';

export interface CreatePlaceActivityOptions {
  id: string;
  startTime?: string | null;
}

export interface CreateCustomActivityInput {
  id: string;
  title: string;
  startTime?: string | null;
  durationMin?: number | null;
  estimatedCost?: PriceQuote | null;
  notes?: string;
}

export function createPlaceActivity(
  place: Place,
  { id, startTime = null }: CreatePlaceActivityOptions,
): TripActivity {
  return {
    id,
    source: { type: 'place', placeId: place.id },
    startTime,
    durationMin: place.avgVisitMinutes,
    travelMin: null,
    estimatedCost: place.ticketPrice,
    order: 0,
  };
}

export function createCustomActivity({
  id,
  title,
  startTime = null,
  durationMin = null,
  estimatedCost = null,
  notes,
}: CreateCustomActivityInput): TripActivity {
  const trimmedNotes = notes?.trim();

  return {
    id,
    source: { type: 'custom', title: title.trim() },
    startTime,
    durationMin,
    travelMin: null,
    estimatedCost,
    order: 0,
    ...(trimmedNotes ? { notes: trimmedNotes } : {}),
  };
}
