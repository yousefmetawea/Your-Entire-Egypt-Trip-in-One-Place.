import type { IsoDate, Trip, TripDay, TripStatus } from '../../types';
import { isIsoDate } from '../date';

export type TripPhaseKind = 'no-dates' | 'before' | 'during' | 'after';

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  totalSeconds: number;
}

export interface TripPhaseInfo {
  phase: TripPhaseKind;
  effectiveStatus: TripStatus;
  countdown: CountdownTime | null;
  dayNumber: number | null;
  totalDays: number;
  activeDay: TripDay | null;
  daysRemaining: number | null;
  daysSinceEnd: number | null;
}

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
const MINUTE_MS = 60_000;
const SECOND_MS = 1_000;

/**
 * Parses YYYY-MM-DD into a local Date at 00:00:00.000 to avoid UTC shifting.
 */
export function parseLocalCalendarDate(dateStr: string): Date | null {
  if (!isIsoDate(dateStr)) {
    return null;
  }
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  return new Date(year, month, day, 0, 0, 0, 0);
}

/**
 * Returns YYYY-MM-DD in local time for a given Date.
 */
export function formatLocalIsoDate(date: Date): IsoDate {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Pure calculation of trip countdown, phase, and effective status.
 * Accepts an injectable `now` date so unit tests and time-travel are 100% deterministic.
 */
export function calculateTripPhase(
  trip: Pick<Trip, 'startDate' | 'endDate' | 'status' | 'days'>,
  now: Date = new Date(),
): TripPhaseInfo {
  const startDate = parseLocalCalendarDate(trip.startDate);
  const endDate = parseLocalCalendarDate(trip.endDate);

  if (!startDate || !endDate) {
    return {
      phase: 'no-dates',
      effectiveStatus: trip.status,
      countdown: null,
      dayNumber: null,
      totalDays: trip.days.length,
      activeDay: trip.days[0] ?? null,
      daysRemaining: null,
      daysSinceEnd: null,
    };
  }

  const todayIso = formatLocalIsoDate(now);
  const localToday = parseLocalCalendarDate(todayIso)!;

  const totalDays =
    trip.days.length > 0
      ? trip.days.length
      : Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / DAY_MS) + 1);

  // Stored draft or cancelled status takes precedence over derived calendar status
  const isFixedStatus = trip.status === 'draft' || trip.status === 'cancelled';

  // 1. Before trip
  if (todayIso < trip.startDate) {
    const diffMs = startDate.getTime() - now.getTime();
    const clampedDiffMs = Math.max(0, diffMs);

    const days = Math.floor(clampedDiffMs / DAY_MS);
    const hours = Math.floor((clampedDiffMs % DAY_MS) / HOUR_MS);
    const minutes = Math.floor((clampedDiffMs % HOUR_MS) / MINUTE_MS);
    const totalSeconds = Math.floor(clampedDiffMs / SECOND_MS);

    // Calendar days difference
    const calendarDaysRemaining = Math.max(
      1,
      Math.round((startDate.getTime() - localToday.getTime()) / DAY_MS),
    );

    return {
      phase: 'before',
      effectiveStatus: isFixedStatus ? trip.status : 'upcoming',
      countdown: { days, hours, minutes, totalSeconds },
      dayNumber: 1,
      totalDays,
      activeDay: trip.days[0] ?? null,
      daysRemaining: calendarDaysRemaining,
      daysSinceEnd: null,
    };
  }

  // 2. During trip
  if (todayIso <= trip.endDate) {
    const calendarDaysFromStart = Math.round((localToday.getTime() - startDate.getTime()) / DAY_MS);
    const dayNumber = Math.min(totalDays, Math.max(1, calendarDaysFromStart + 1));
    const activeDay =
      trip.days.find((d) => d.date === todayIso) ?? trip.days[dayNumber - 1] ?? null;

    return {
      phase: 'during',
      effectiveStatus: isFixedStatus ? trip.status : 'active',
      countdown: null,
      dayNumber,
      totalDays,
      activeDay,
      daysRemaining: 0,
      daysSinceEnd: null,
    };
  }

  // 3. After trip
  const calendarDaysSinceEnd = Math.max(
    1,
    Math.round((localToday.getTime() - endDate.getTime()) / DAY_MS),
  );

  return {
    phase: 'after',
    effectiveStatus: isFixedStatus ? trip.status : 'completed',
    countdown: null,
    dayNumber: null,
    totalDays,
    activeDay: trip.days[trip.days.length - 1] ?? null,
    daysRemaining: null,
    daysSinceEnd: calendarDaysSinceEnd,
  };
}
