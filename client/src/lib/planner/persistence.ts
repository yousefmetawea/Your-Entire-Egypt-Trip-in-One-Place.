import type { PlaceCategory, PlannerFormValues, PlannerProgress, PlannerStep } from '../../types';
import { isIsoDate } from '../date';
import {
  EMPTY_PLANNER_FORM_VALUES,
  isAccommodationPreference,
  isBudgetTier,
  isPlannerStep,
  isSelectableInterest,
  isTransportPreference,
} from './options';

export const PLANNER_STORAGE_KEY = 'discover-cairo.wizard.v1';
export const PLANNER_STORAGE_VERSION = 1;

const TRAVELERS_PATTERN = /^\d{0,2}$/;

export interface PlannerStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function createMemoryPlannerStorage(): PlannerStorage {
  const values = new Map<string, string>();

  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

function createBrowserPlannerStorage(): PlannerStorage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storage = window.localStorage;
    const probeKey = '__discover_cairo_planner_probe__';

    storage.setItem(probeKey, '1');
    storage.removeItem(probeKey);

    return {
      getItem(key) {
        return storage.getItem(key);
      },
      setItem(key, value) {
        storage.setItem(key, value);
      },
      removeItem(key) {
        storage.removeItem(key);
      },
    };
  } catch {
    return null;
  }
}

let fallbackStorage: PlannerStorage | null = null;

export function getPlannerStorage(): PlannerStorage | null {
  const browserStorage = createBrowserPlannerStorage();

  if (browserStorage) {
    return browserStorage;
  }

  fallbackStorage ??= createMemoryPlannerStorage();
  return fallbackStorage;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeValues(value: unknown): PlannerFormValues {
  const source = isRecord(value) ? value : {};

  const startDate =
    typeof source.startDate === 'string' && isIsoDate(source.startDate) ? source.startDate : '';
  const endDate =
    typeof source.endDate === 'string' && isIsoDate(source.endDate) ? source.endDate : '';

  const travelers =
    typeof source.travelers === 'string' && TRAVELERS_PATTERN.test(source.travelers)
      ? source.travelers
      : EMPTY_PLANNER_FORM_VALUES.travelers;

  const budgetTier =
    typeof source.budgetTier === 'string' && isBudgetTier(source.budgetTier)
      ? source.budgetTier
      : '';

  const interests = Array.isArray(source.interests)
    ? [
        ...new Set(
          source.interests.filter(
            (interest): interest is PlaceCategory =>
              typeof interest === 'string' && isSelectableInterest(interest),
          ),
        ),
      ]
    : [];

  const accommodationType =
    typeof source.accommodationType === 'string' &&
    isAccommodationPreference(source.accommodationType)
      ? source.accommodationType
      : 'any';

  const transportType =
    typeof source.transportType === 'string' && isTransportPreference(source.transportType)
      ? source.transportType
      : 'any';

  return {
    startDate,
    endDate,
    travelers,
    budgetTier,
    interests,
    accommodationType,
    transportType,
  };
}

export function readPlannerProgress(
  storage: PlannerStorage | null = getPlannerStorage(),
): PlannerProgress | null {
  if (!storage) {
    return null;
  }

  try {
    const raw = storage.getItem(PLANNER_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isRecord(parsed) || parsed.version !== PLANNER_STORAGE_VERSION) {
      return null;
    }

    const step: PlannerStep =
      typeof parsed.step === 'string' && isPlannerStep(parsed.step) ? parsed.step : 'dates';

    return {
      version: PLANNER_STORAGE_VERSION,
      values: sanitizeValues(parsed.values),
      step,
      generatedTripId:
        typeof parsed.generatedTripId === 'string' && parsed.generatedTripId
          ? parsed.generatedTripId
          : null,
      includeSavedPlaces:
        typeof parsed.includeSavedPlaces === 'boolean' ? parsed.includeSavedPlaces : true,
    };
  } catch {
    return null;
  }
}

export function writePlannerProgress(
  progress: PlannerProgress,
  storage: PlannerStorage | null = getPlannerStorage(),
): boolean {
  if (!storage) {
    return false;
  }

  try {
    storage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export function clearPlannerProgress(storage: PlannerStorage | null = getPlannerStorage()): void {
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(PLANNER_STORAGE_KEY);
  } catch {
    // The planner can continue with in-memory state when storage is unavailable.
  }
}
