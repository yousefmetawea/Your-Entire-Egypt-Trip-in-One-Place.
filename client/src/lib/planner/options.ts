import type {
  AccommodationType,
  BudgetTier,
  PlaceCategory,
  PlannerErrorCode,
  PlannerFormValues,
  PlannerStep,
  TransportType,
} from '../../types';
import { PLANNER_STEPS } from '../../types';
import { PLACE_CATEGORIES } from '../catalog';

export const MAX_TRIP_DAYS = 14;
export const MAX_TRAVELERS = 12;
export const MAX_ACTIVITIES_PER_DAY = 3;

export const SUGGESTED_START_TIMES = ['09:00', '11:30', '14:00'] as const;

export const BUDGET_TIERS = [
  'essential',
  'balanced',
  'signature',
] as const satisfies readonly BudgetTier[];

export const PLANNER_INTERESTS = PLACE_CATEGORIES;

export const SELECTABLE_INTERESTS = [
  'history',
  'culture',
  'adventure',
] as const satisfies readonly PlaceCategory[];

export const ACCOMMODATION_PREFERENCES = ['any', 'hotel', 'hostel'] as const satisfies readonly (
  AccommodationType | 'any'
)[];

export const TRANSPORT_PREFERENCES = [
  'any',
  'transfer',
  'private-car',
  'bus',
  'metro',
] as const satisfies readonly (TransportType | 'any')[];

export const EMPTY_PLANNER_FORM_VALUES: PlannerFormValues = {
  startDate: '',
  endDate: '',
  travelers: '2',
  budgetTier: '',
  interests: [],
  accommodationType: 'any',
  transportType: 'any',
};

export function isPlannerStep(value: string): value is PlannerStep {
  return (PLANNER_STEPS as readonly string[]).includes(value);
}

export function isBudgetTier(value: string): value is BudgetTier {
  return (BUDGET_TIERS as readonly string[]).includes(value);
}

export function isSelectableInterest(value: string): value is PlaceCategory {
  return (SELECTABLE_INTERESTS as readonly string[]).includes(value);
}

export function isAccommodationPreference(value: string): value is AccommodationType | 'any' {
  return (ACCOMMODATION_PREFERENCES as readonly string[]).includes(value);
}

export function isTransportPreference(value: string): value is TransportType | 'any' {
  return (TRANSPORT_PREFERENCES as readonly string[]).includes(value);
}

export function getPlannerStepLabelKey(step: PlannerStep): string {
  return `planner.steps.${step}.label`;
}

export function getPlannerStepShortLabelKey(step: PlannerStep): string {
  return `planner.steps.${step}.short`;
}

export function getPlannerErrorKey(code: PlannerErrorCode): string {
  return `planner.errors.${code}`;
}

export function getBudgetTierLabelKey(tier: BudgetTier): string {
  return `planner.budget.tiers.${tier}.label`;
}

export function getBudgetTierDescriptionKey(tier: BudgetTier): string {
  return `planner.budget.tiers.${tier}.description`;
}

export function getInterestLabelKey(interest: PlaceCategory): string {
  return `catalog.categories.${interest}`;
}

export function getAccommodationPreferenceLabelKey(preference: AccommodationType | 'any'): string {
  return `planner.stay.options.${preference}`;
}

export function getTransportPreferenceLabelKey(preference: TransportType | 'any'): string {
  return `planner.transport.options.${preference}`;
}
