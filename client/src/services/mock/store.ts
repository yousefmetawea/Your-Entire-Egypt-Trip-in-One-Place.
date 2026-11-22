import type {
  BookingRequest,
  CurrencyCode,
  Money,
  PlaceCategory,
  PriceQuote,
  Trip,
  TripActivity,
  TripDay,
} from '../../types';
import { isIsoDate } from '../../lib/date';
import { ServiceError } from '../errors';
import type { MockStorage } from './storage';

export const MOCK_STORE_KEY = 'discover-cairo.mock-store.v2';
export const LEGACY_MOCK_STORE_KEY = 'discover-cairo.mock-store.v1';
export const MOCK_STORE_VERSION = 2;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const STATUSES = ['draft', 'upcoming', 'active', 'completed', 'cancelled'] as const;
const BUDGET_TIERS = ['essential', 'balanced', 'signature'] as const;
const CATEGORIES = ['history', 'culture', 'adventure', 'food'] as const;
const CURRENCIES = ['USD', 'EGP'] as const;
const ACCOMMODATION_TYPES = ['hotel', 'hostel'] as const;
const TRANSPORT_TYPES = ['transfer', 'private-car', 'bus', 'metro'] as const;

export interface MockStoreState {
  trips: Trip[];
  bookingRequests: BookingRequest[];
}

export interface MockStoreEnvelope extends MockStoreState {
  version: typeof MOCK_STORE_VERSION;
}

export type MockStoreSource = 'empty' | 'stored' | 'migrated' | 'recovered';

export interface MockStoreDiagnostics {
  source: MockStoreSource;
  invalidTrips: number;
  invalidBookingRequests: number;
}

export interface MockStore {
  getState(): MockStoreState;
  update(updater: (state: MockStoreState) => MockStoreState): MockStoreState;
  reset(): void;
  getDiagnostics(): MockStoreDiagnostics;
}

function emptyState(): MockStoreState {
  return {
    trips: [],
    bookingRequests: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === 'string' && (options as readonly string[]).includes(value);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isMoney(value: unknown): value is Money {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.amount === 'number' &&
    Number.isFinite(value.amount) &&
    value.amount >= 0 &&
    isOneOf<CurrencyCode>(value.currency, CURRENCIES)
  );
}

function isPriceQuote(value: unknown): value is PriceQuote {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isMoney(value) &&
    typeof value.isEstimated === 'boolean' &&
    typeof value.priceUpdatedAt === 'string' &&
    isIsoDate(value.priceUpdatedAt)
  );
}

function isTripActivity(value: unknown): value is TripActivity {
  if (!isRecord(value)) {
    return false;
  }

  if (
    typeof value.id !== 'string' ||
    !value.id.trim() ||
    !isRecord(value.source) ||
    !isNullableString(value.startTime) ||
    (typeof value.startTime === 'string' && !TIME_PATTERN.test(value.startTime)) ||
    !(
      value.durationMin === null ||
      (typeof value.durationMin === 'number' &&
        Number.isFinite(value.durationMin) &&
        value.durationMin >= 0)
    ) ||
    !(
      value.travelMin === null ||
      (typeof value.travelMin === 'number' &&
        Number.isFinite(value.travelMin) &&
        value.travelMin >= 0)
    ) ||
    !(value.estimatedCost === null || isPriceQuote(value.estimatedCost)) ||
    typeof value.order !== 'number' ||
    !Number.isInteger(value.order) ||
    value.order < 0 ||
    !(value.notes === undefined || typeof value.notes === 'string')
  ) {
    return false;
  }

  if (value.source.type === 'place') {
    return typeof value.source.placeId === 'string' && Boolean(value.source.placeId);
  }

  return (
    value.source.type === 'custom' &&
    typeof value.source.title === 'string' &&
    Boolean(value.source.title.trim())
  );
}

function isTripDay(value: unknown): value is TripDay {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    Boolean(value.id.trim()) &&
    typeof value.date === 'string' &&
    isIsoDate(value.date) &&
    Array.isArray(value.activities) &&
    value.activities.every(isTripActivity)
  );
}

function isTripPreferences(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  if (
    value.accommodationType !== undefined &&
    !isOneOf(value.accommodationType, [...ACCOMMODATION_TYPES, 'any'] as const)
  ) {
    return false;
  }

  return (
    value.transportType === undefined ||
    isOneOf(value.transportType, [...TRANSPORT_TYPES, 'any'] as const)
  );
}

function isTrip(value: unknown): value is Trip {
  if (!isRecord(value)) {
    return false;
  }

  if (
    typeof value.id !== 'string' ||
    !value.id.trim() ||
    typeof value.userId !== 'string' ||
    !value.userId.trim() ||
    typeof value.title !== 'string' ||
    !value.title.trim() ||
    typeof value.startDate !== 'string' ||
    !isIsoDate(value.startDate) ||
    typeof value.endDate !== 'string' ||
    !isIsoDate(value.endDate) ||
    value.endDate < value.startDate ||
    typeof value.travelers !== 'number' ||
    !Number.isInteger(value.travelers) ||
    value.travelers < 1 ||
    !(value.budget === null || isMoney(value.budget)) ||
    !(
      value.budgetTier === undefined ||
      value.budgetTier === null ||
      isOneOf(value.budgetTier, BUDGET_TIERS)
    ) ||
    !Array.isArray(value.interests) ||
    !value.interests.every((interest) => isOneOf<PlaceCategory>(interest, CATEGORIES)) ||
    !isTripPreferences(value.preferences) ||
    !isOneOf(value.status, STATUSES) ||
    !Array.isArray(value.days) ||
    !value.days.every(isTripDay) ||
    !isNullableString(value.accommodationId) ||
    !isStringArray(value.savedPlaceIds) ||
    typeof value.isDemo !== 'boolean'
  ) {
    return false;
  }

  const dayIds = new Set<string>();
  const activityIds = new Set<string>();

  for (const day of value.days) {
    if (dayIds.has(day.id)) {
      return false;
    }

    dayIds.add(day.id);

    for (const activity of day.activities) {
      if (activityIds.has(activity.id)) {
        return false;
      }

      activityIds.add(activity.id);
    }
  }

  return true;
}

function sanitizeTrips(value: unknown): { trips: Trip[]; invalidTrips: number } {
  if (!Array.isArray(value)) {
    return { trips: [], invalidTrips: 1 };
  }

  const trips: Trip[] = [];
  let invalidTrips = 0;

  for (const item of value) {
    if (isTrip(item)) {
      trips.push(item);
    } else {
      invalidTrips += 1;
    }
  }

  return { trips, invalidTrips };
}

interface ReadResult {
  state: MockStoreState;
  diagnostics: MockStoreDiagnostics;
  shouldPersist: boolean;
}

function parseV2(raw: string): ReadResult | null {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isRecord(parsed) || !Array.isArray(parsed.trips)) {
    return null;
  }

  const trips = sanitizeTrips(parsed.trips);
  const hasBookingRequests = Array.isArray(parsed.bookingRequests);
  const bookingRequests = hasBookingRequests ? (parsed.bookingRequests as BookingRequest[]) : [];
  const invalidBookingRequests = hasBookingRequests ? 0 : 1;
  const isVersioned = parsed.version === MOCK_STORE_VERSION;
  const hasInvalidRecords = trips.invalidTrips > 0 || invalidBookingRequests > 0 || !isVersioned;

  return {
    state: {
      trips: trips.trips,
      bookingRequests,
    },
    diagnostics: {
      source: hasInvalidRecords ? 'recovered' : 'stored',
      invalidTrips: trips.invalidTrips,
      invalidBookingRequests,
    },
    shouldPersist: hasInvalidRecords,
  };
}

function parseLegacy(raw: string): ReadResult | null {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isRecord(parsed) || !Array.isArray(parsed.trips)) {
    return null;
  }

  const trips = sanitizeTrips(parsed.trips);
  const hasBookingRequests = Array.isArray(parsed.bookingRequests);
  const bookingRequests = hasBookingRequests ? (parsed.bookingRequests as BookingRequest[]) : [];
  const invalidBookingRequests = hasBookingRequests ? 0 : 1;
  const hasInvalidRecords = trips.invalidTrips > 0 || invalidBookingRequests > 0;

  return {
    state: {
      trips: trips.trips,
      bookingRequests,
    },
    diagnostics: {
      source: hasInvalidRecords ? 'recovered' : 'migrated',
      invalidTrips: trips.invalidTrips,
      invalidBookingRequests,
    },
    shouldPersist: true,
  };
}

function readState(storage: MockStorage): ReadResult {
  let currentRaw: string | null;
  let legacyRaw: string | null;

  try {
    currentRaw = storage.getItem(MOCK_STORE_KEY);
    legacyRaw = storage.getItem(LEGACY_MOCK_STORE_KEY);
  } catch {
    return {
      state: emptyState(),
      diagnostics: { source: 'recovered', invalidTrips: 0, invalidBookingRequests: 0 },
      shouldPersist: false,
    };
  }

  if (currentRaw !== null) {
    const current = parseV2(currentRaw);

    if (current) {
      return current;
    }
  }

  if (legacyRaw !== null) {
    const legacy = parseLegacy(legacyRaw);

    if (legacy) {
      return legacy;
    }
  }

  if (currentRaw === null && legacyRaw === null) {
    return {
      state: emptyState(),
      diagnostics: { source: 'empty', invalidTrips: 0, invalidBookingRequests: 0 },
      shouldPersist: false,
    };
  }

  return {
    state: emptyState(),
    diagnostics: { source: 'recovered', invalidTrips: 1, invalidBookingRequests: 0 },
    shouldPersist: false,
  };
}

function getStoredEnvelope(state: MockStoreState): MockStoreEnvelope {
  return {
    version: MOCK_STORE_VERSION,
    trips: state.trips,
    bookingRequests: state.bookingRequests,
  };
}

export function createMockStore(storage: MockStorage): MockStore {
  const initial = readState(storage);
  let state = initial.state;
  let diagnostics = initial.diagnostics;

  function persist(nextState: MockStoreState): void {
    try {
      storage.setItem(MOCK_STORE_KEY, JSON.stringify(getStoredEnvelope(nextState)));
    } catch {
      throw new ServiceError('STORAGE', 'Could not save mock data to storage.');
    }
  }

  if (initial.shouldPersist) {
    try {
      persist(state);
    } catch {
      // Reading is still possible in memory; the next write reports the storage failure.
    }
  }

  return {
    getState() {
      return structuredClone(state);
    },
    update(updater) {
      const nextState = structuredClone(updater(structuredClone(state)));
      persist(nextState);
      state = nextState;
      return structuredClone(state);
    },
    reset() {
      try {
        storage.removeItem(MOCK_STORE_KEY);
        storage.removeItem(LEGACY_MOCK_STORE_KEY);
      } catch {
        throw new ServiceError('STORAGE', 'Could not reset mock data in storage.');
      }

      state = emptyState();
      diagnostics = { source: 'empty', invalidTrips: 0, invalidBookingRequests: 0 };
    },
    getDiagnostics() {
      return { ...diagnostics };
    },
  };
}
