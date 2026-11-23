import type { Accommodation, BookingRequest, CurrencyCode, Money, Trip } from '../../types';
import { computeStaySummary, summarizeItinerary } from '../builder/summary';

export interface BudgetCategorySlice {
  id: 'stay' | 'activities' | 'transport';
  label: string;
  amount: number;
  percentage: number;
  color: string;
  itemCount: number;
  isUnpriced: boolean;
}

export interface BudgetAnalyticsResult {
  currency: CurrencyCode;
  totalUtilized: number;
  slices: BudgetCategorySlice[];
  unpricedActivitiesCount: number;
  isStayUnpriced: boolean;
  unpricedItemsTotal: number;
  budgetCap: Money | null;
  budgetRatio: number | null;
  remainingReserve: number | null;
  budgetLevel: 'under' | 'near' | 'over' | null;
  hasMixedCurrencies: boolean;
  currenciesPresent: CurrencyCode[];
}

// Design system token colors for donut slices
const SLICE_COLORS = {
  stay: '#775928', // secondary bronze
  activities: '#d6c5a1', // tertiary fixed dim / warm sand
  transport: '#1f1f1f', // primary container charcoal
};

const AIRPORT_TRANSFER_ESTIMATE_EGP = 650;

/**
 * Aggregates activities, stay, and transport costs into partial-aware donut chart slices.
 * Never converts currencies without a rate.
 */
export function calculateBudgetAnalytics(
  trip: Trip,
  accommodation: Accommodation | null,
  bookingRequests: BookingRequest[],
): BudgetAnalyticsResult {
  const itinerarySummary = summarizeItinerary(trip);

  const staySummary = computeStaySummary(
    trip,
    accommodation?.name.en ?? null,
    accommodation?.priceRange ?? null,
  );

  // Collect currencies present
  const currencySet = new Set<CurrencyCode>();

  for (const c of itinerarySummary.costs) {
    if (c.groupTotal > 0) {
      currencySet.add(c.currency);
    }
  }

  if (staySummary?.currency && staySummary.estimatedTotalMin && staySummary.estimatedTotalMin > 0) {
    currencySet.add(staySummary.currency);
  }

  // Active transport requests (exclude cancelled)
  const activeTransfers = bookingRequests.filter(
    (req) => req.kind === 'airport-transfer' && req.status !== 'cancelled',
  );

  if (activeTransfers.length > 0) {
    currencySet.add('EGP');
  }

  if (trip.budget?.currency) {
    currencySet.add(trip.budget.currency);
  }

  // Determine dominant currency (defaults to trip budget currency, or first expense currency, or EGP)
  const currenciesPresent = Array.from(currencySet);
  const dominantCurrency: CurrencyCode = trip.budget?.currency ?? currenciesPresent[0] ?? 'EGP';

  const hasMixedCurrencies = currenciesPresent.length > 1;

  // 1. Activities amount in dominant currency
  const matchingActivityCost = itinerarySummary.costs.find((c) => c.currency === dominantCurrency);
  const activitiesAmount = matchingActivityCost?.groupTotal ?? 0;
  const activitiesCount = matchingActivityCost?.activityCount ?? 0;

  // 2. Stay amount in dominant currency
  let stayAmount = 0;
  let isStayUnpriced = false;

  if (staySummary) {
    if (staySummary.isUnpriced) {
      isStayUnpriced = true;
    } else if (staySummary.currency === dominantCurrency && staySummary.estimatedTotalMin) {
      stayAmount = staySummary.estimatedTotalMin;
    }
  }

  // 3. Transport amount in dominant currency (if dominant is EGP)
  let transportAmount = 0;
  const transportCount = activeTransfers.length;

  if (dominantCurrency === 'EGP') {
    transportAmount = activeTransfers.length * AIRPORT_TRANSFER_ESTIMATE_EGP;
  }

  const totalUtilized = Math.round((activitiesAmount + stayAmount + transportAmount) * 100) / 100;

  // Slices computation
  const rawSlices: Array<{
    id: 'stay' | 'activities' | 'transport';
    label: string;
    amount: number;
    color: string;
    itemCount: number;
    isUnpriced: boolean;
  }> = [];

  if (stayAmount > 0 || isStayUnpriced) {
    rawSlices.push({
      id: 'stay',
      label: 'Stays & Accommodation',
      amount: stayAmount,
      color: SLICE_COLORS.stay,
      itemCount: staySummary?.nights ?? 0,
      isUnpriced: isStayUnpriced,
    });
  }

  if (activitiesAmount > 0 || itinerarySummary.unpricedActivityCount > 0) {
    rawSlices.push({
      id: 'activities',
      label: 'Itinerary Activities',
      amount: activitiesAmount,
      color: SLICE_COLORS.activities,
      itemCount: activitiesCount,
      isUnpriced: itinerarySummary.unpricedActivityCount > 0 && activitiesAmount === 0,
    });
  }

  if (transportAmount > 0) {
    rawSlices.push({
      id: 'transport',
      label: 'Chauffeur & Transfers',
      amount: transportAmount,
      color: SLICE_COLORS.transport,
      itemCount: transportCount,
      isUnpriced: false,
    });
  }

  const slices: BudgetCategorySlice[] = rawSlices.map((slice) => {
    const percentage = totalUtilized > 0 ? Math.round((slice.amount / totalUtilized) * 100) : 0;
    return {
      ...slice,
      percentage,
    };
  });

  // Unpriced items total count
  const unpricedItemsTotal = itinerarySummary.unpricedActivityCount + (isStayUnpriced ? 1 : 0);

  // Budget comparison if trip has numeric budget matching dominant currency
  let budgetCap: Money | null = null;
  let budgetRatio: number | null = null;
  let remainingReserve: number | null = null;
  let budgetLevel: 'under' | 'near' | 'over' | null = null;

  if (trip.budget && trip.budget.currency === dominantCurrency) {
    budgetCap = trip.budget;
    if (budgetCap.amount > 0) {
      budgetRatio = totalUtilized / budgetCap.amount;
      remainingReserve = Math.round((budgetCap.amount - totalUtilized) * 100) / 100;
      budgetLevel = budgetRatio >= 1 ? 'over' : budgetRatio >= 0.8 ? 'near' : 'under';
    } else {
      budgetRatio = totalUtilized > 0 ? 1 : 0;
      remainingReserve = -totalUtilized;
      budgetLevel = totalUtilized > 0 ? 'over' : 'under';
    }
  }

  return {
    currency: dominantCurrency,
    totalUtilized,
    slices,
    unpricedActivitiesCount: itinerarySummary.unpricedActivityCount,
    isStayUnpriced,
    unpricedItemsTotal,
    budgetCap,
    budgetRatio,
    remainingReserve,
    budgetLevel,
    hasMixedCurrencies,
    currenciesPresent,
  };
}
