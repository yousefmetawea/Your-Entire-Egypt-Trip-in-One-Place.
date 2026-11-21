import type { BookingRequest, Trip } from '../../types';
import { ServiceError } from '../errors';
import type { MockStorage } from './storage';

export const MOCK_STORE_KEY = 'discover-cairo.mock-store.v1';

export interface MockStoreState {
  trips: Trip[];
  bookingRequests: BookingRequest[];
}

export interface MockStore {
  getState(): MockStoreState;
  update(updater: (state: MockStoreState) => MockStoreState): MockStoreState;
}

function emptyState(): MockStoreState {
  return {
    trips: [],
    bookingRequests: [],
  };
}

function isMockStoreState(value: unknown): value is MockStoreState {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as { trips?: unknown; bookingRequests?: unknown };
  return Array.isArray(candidate.trips) && Array.isArray(candidate.bookingRequests);
}

function readState(storage: MockStorage): MockStoreState {
  try {
    const raw = storage.getItem(MOCK_STORE_KEY);

    if (!raw) {
      return emptyState();
    }

    const parsed: unknown = JSON.parse(raw);
    return isMockStoreState(parsed) ? parsed : emptyState();
  } catch {
    return emptyState();
  }
}

export function createMockStore(storage: MockStorage): MockStore {
  let state = readState(storage);

  function persist(nextState: MockStoreState): void {
    try {
      storage.setItem(MOCK_STORE_KEY, JSON.stringify(nextState));
    } catch {
      throw new ServiceError('STORAGE', 'Could not save mock data to storage.');
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
  };
}
