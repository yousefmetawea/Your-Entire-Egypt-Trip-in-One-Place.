import type { BookingRequest, Place, PlaceId, Trip, TripActivity } from '../../types';
import type { TripPhaseInfo } from '../dashboard/tripPhase';

/**
 * The status shown to the traveler. `effectiveStatus` from calculateTripPhase is the
 * single source of truth: stored draft/cancelled win, otherwise it follows the dates.
 */
export function getDisplayStatus(info: TripPhaseInfo): Trip['status'] {
  return info.effectiveStatus;
}

/** True when calendar copy (countdown, "day X of Y", "ended") agrees with the status. */
export function phaseMatchesStatus(info: TripPhaseInfo): boolean {
  return (
    (info.phase === 'before' && info.effectiveStatus === 'upcoming') ||
    (info.phase === 'during' && info.effectiveStatus === 'active') ||
    (info.phase === 'after' && info.effectiveStatus === 'completed')
  );
}

export interface TripStats {
  days: number;
  activities: number;
  destinations: number;
  timedActivities: number;
  knownMinutes: number;
}

export function computeTripStats(trip: Trip): TripStats {
  const all: TripActivity[] = trip.days.flatMap((d) => d.activities);
  const placeIds = new Set<PlaceId>();
  let timed = 0;
  let minutes = 0;
  for (const a of all) {
    if (a.source.type === 'place') placeIds.add(a.source.placeId);
    if (a.startTime) timed += 1;
    if (a.durationMin) minutes += a.durationMin;
  }
  return {
    days: trip.days.length,
    activities: all.length,
    destinations: placeIds.size,
    timedActivities: timed,
    knownMinutes: minutes,
  };
}

/** First itinerary place that exists in the catalog, used for hero photography. */
export function pickHeroPlace(trip: Trip, placesById: ReadonlyMap<PlaceId, Place>): Place | null {
  for (const day of trip.days) {
    for (const a of day.activities) {
      if (a.source.type === 'place') {
        const place = placesById.get(a.source.placeId);
        if (place) return place;
      }
    }
  }
  return null;
}

export interface TransferCounts {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
}

export function countTransfers(requests: readonly BookingRequest[]): TransferCounts {
  const transfers = requests.filter((r) => r.kind === 'airport-transfer');
  return {
    total: transfers.length,
    pending: transfers.filter((r) => r.status === 'pending').length,
    confirmed: transfers.filter((r) => r.status === 'confirmed').length,
    cancelled: transfers.filter((r) => r.status === 'cancelled').length,
  };
}

export function formatMinutes(total: number, hourUnit: string, minUnit: string): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h > 0 && m > 0) return `${h}${hourUnit} ${m}${minUnit}`;
  if (h > 0) return `${h}${hourUnit}`;
  return `${m}${minUnit}`;
}
