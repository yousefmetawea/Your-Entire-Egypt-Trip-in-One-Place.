import type { CurrencyCode, Money, Trip, TripActivity, TripDay } from '../../types';

export interface DayTiming {
  missingStartCount: number;
  hasOrderIssue: boolean;
  hasOverlap: boolean;
}

export interface CurrencyCostTotal {
  currency: CurrencyCode;
  perTraveler: number;
  groupTotal: number;
  activityCount: number;
}

export interface ItinerarySummary {
  activityCount: number;
  placeCount: number;
  customActivityCount: number;
  emptyDayCount: number;
  unpricedActivityCount: number;
  missingDurationCount: number;
  missingStartCount: number;
  totalKnownDurationMin: number;
  costs: CurrencyCostTotal[];
  dayIdsWithScheduleIssues: string[];
}

export interface StaySummary {
  accommodationId: string;
  name: string;
  nights: number | null;
  nightlyMin: number | null;
  nightlyMax: number | null;
  currency: CurrencyCode | null;
  estimatedTotalMin: number | null;
  isUnpriced: boolean;
}

export interface TransportRequestsSummary {
  totalRequests: number;
  pendingCount: number;
  confirmedCount: number;
  cancelledCount: number;
}

export function computeStaySummary(
  trip: Trip,
  accommodationName: string | null,
  priceRange: { min: number; max: number; currency: CurrencyCode } | null,
): StaySummary | null {
  if (!trip.accommodationId || !accommodationName) {
    return null;
  }

  // Calculate nights from trip days
  const nights = trip.days.length > 1 ? trip.days.length - 1 : trip.days.length === 1 ? 1 : null;
  const isUnpriced = !priceRange;

  const estimatedTotalMin =
    !isUnpriced && nights !== null && typeof priceRange.min === 'number'
      ? roundMoney(priceRange.min * nights)
      : null;

  return {
    accommodationId: trip.accommodationId,
    name: accommodationName,
    nights,
    nightlyMin: priceRange?.min ?? null,
    nightlyMax: priceRange?.max ?? null,
    currency: priceRange?.currency ?? null,
    estimatedTotalMin,
    isUnpriced,
  };
}

export type BudgetLevel = 'under' | 'near' | 'over';

export interface BudgetStatus {
  level: BudgetLevel;
  ratio: number;
  remaining: number;
}

function toMinutes(value: string): number | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    return null;
  }

  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function getDayTiming(day: TripDay): DayTiming {
  let missingStartCount = 0;
  let hasOrderIssue = false;
  let hasOverlap = false;
  let previousStart: number | null = null;
  let previousEnd: number | null = null;

  for (const activity of day.activities) {
    if (activity.startTime === null) {
      missingStartCount += 1;
      continue;
    }

    const start = toMinutes(activity.startTime);

    if (start === null) {
      missingStartCount += 1;
      continue;
    }

    if (previousStart !== null && start < previousStart) {
      hasOrderIssue = true;
    }

    if (previousEnd !== null && start < previousEnd) {
      hasOverlap = true;
    }

    previousStart = start;
    previousEnd = activity.durationMin === null ? null : start + activity.durationMin;
  }

  return {
    missingStartCount,
    hasOrderIssue,
    hasOverlap,
  };
}

function addCost(
  totals: Map<CurrencyCode, { amount: number; count: number }>,
  activity: TripActivity,
): void {
  if (!activity.estimatedCost) {
    return;
  }

  const current = totals.get(activity.estimatedCost.currency) ?? { amount: 0, count: 0 };
  current.amount += activity.estimatedCost.amount;
  current.count += 1;
  totals.set(activity.estimatedCost.currency, current);
}

export function summarizeItinerary(trip: Trip): ItinerarySummary {
  const activities = trip.days.flatMap((day) => day.activities);
  const placeIds = new Set<string>();
  const costTotals = new Map<CurrencyCode, { amount: number; count: number }>();
  let customActivityCount = 0;
  let unpricedActivityCount = 0;
  let missingDurationCount = 0;
  let missingStartCount = 0;
  let totalKnownDurationMin = 0;
  const dayIdsWithScheduleIssues: string[] = [];

  for (const activity of activities) {
    if (activity.source.type === 'place') {
      placeIds.add(activity.source.placeId);
    } else {
      customActivityCount += 1;
    }

    if (activity.estimatedCost) {
      addCost(costTotals, activity);
    } else {
      unpricedActivityCount += 1;
    }

    if (activity.durationMin === null) {
      missingDurationCount += 1;
    } else {
      totalKnownDurationMin += activity.durationMin;
    }

    if (activity.startTime === null) {
      missingStartCount += 1;
    }
  }

  for (const day of trip.days) {
    const timing = getDayTiming(day);

    if (timing.hasOrderIssue || timing.hasOverlap) {
      dayIdsWithScheduleIssues.push(day.id);
    }
  }

  const costs: CurrencyCostTotal[] = [...costTotals.entries()]
    .map(([currency, total]) => {
      const perTraveler = roundMoney(total.amount);

      return {
        currency,
        perTraveler,
        groupTotal: roundMoney(perTraveler * trip.travelers),
        activityCount: total.count,
      };
    })
    .sort((left, right) => left.currency.localeCompare(right.currency));

  return {
    activityCount: activities.length,
    placeCount: placeIds.size,
    customActivityCount,
    emptyDayCount: trip.days.filter((day) => day.activities.length === 0).length,
    unpricedActivityCount,
    missingDurationCount,
    missingStartCount,
    totalKnownDurationMin,
    costs,
    dayIdsWithScheduleIssues,
  };
}

export function getBudgetStatus(
  costs: readonly CurrencyCostTotal[],
  budget: Money | null,
): BudgetStatus | null {
  if (!budget) {
    return null;
  }

  const matching = costs.find((cost) => cost.currency === budget.currency);

  if (!matching) {
    return null;
  }

  const ratio =
    budget.amount <= 0 ? (matching.groupTotal > 0 ? 1 : 0) : matching.groupTotal / budget.amount;

  return {
    level: ratio >= 1 ? 'over' : ratio >= 0.8 ? 'near' : 'under',
    ratio,
    remaining: roundMoney(budget.amount - matching.groupTotal),
  };
}
