import { describe, expect, it } from 'vitest';
import type { PlannerProgress } from '../../types';
import { EMPTY_PLANNER_FORM_VALUES } from './options';
import {
  clearPlannerProgress,
  createMemoryPlannerStorage,
  PLANNER_STORAGE_KEY,
  PLANNER_STORAGE_VERSION,
  readPlannerProgress,
  writePlannerProgress,
} from './persistence';

const progress: PlannerProgress = {
  version: PLANNER_STORAGE_VERSION,
  values: {
    ...EMPTY_PLANNER_FORM_VALUES,
    startDate: '2026-12-01',
    endDate: '2026-12-03',
    travelers: '4',
    budgetTier: 'signature',
    interests: ['history', 'culture'],
  },
  step: 'interests',
  generatedTripId: 'trip-1',
  includeSavedPlaces: false,
};

describe('planner persistence', () => {
  it('round-trips planner progress', () => {
    const storage = createMemoryPlannerStorage();

    expect(writePlannerProgress(progress, storage)).toBe(true);
    expect(readPlannerProgress(storage)).toEqual(progress);
  });

  it('returns null when nothing is stored or the JSON is invalid', () => {
    const storage = createMemoryPlannerStorage();

    expect(readPlannerProgress(storage)).toBeNull();

    storage.setItem(PLANNER_STORAGE_KEY, '{not-json');
    expect(readPlannerProgress(storage)).toBeNull();
  });

  it('ignores progress written by another version', () => {
    const storage = createMemoryPlannerStorage();

    storage.setItem(
      PLANNER_STORAGE_KEY,
      JSON.stringify({ ...progress, version: PLANNER_STORAGE_VERSION + 1 }),
    );

    expect(readPlannerProgress(storage)).toBeNull();
  });

  it('sanitizes invalid stored values', () => {
    const storage = createMemoryPlannerStorage();

    storage.setItem(
      PLANNER_STORAGE_KEY,
      JSON.stringify({
        version: PLANNER_STORAGE_VERSION,
        values: {
          startDate: 'not-a-date',
          endDate: 42,
          travelers: 'abc',
          budgetTier: 'luxury',
          interests: ['history', 'food', 'history'],
          accommodationType: 'villa',
          transportType: 'rocket',
        },
        step: 'unknown',
        generatedTripId: 42,
        includeSavedPlaces: 'yes',
      }),
    );

    expect(readPlannerProgress(storage)).toEqual({
      version: PLANNER_STORAGE_VERSION,
      values: {
        startDate: '',
        endDate: '',
        travelers: '2',
        budgetTier: '',
        interests: ['history'],
        accommodationType: 'any',
        transportType: 'any',
      },
      step: 'dates',
      generatedTripId: null,
      includeSavedPlaces: true,
    });
  });

  it('clears stored progress', () => {
    const storage = createMemoryPlannerStorage();

    writePlannerProgress(progress, storage);
    clearPlannerProgress(storage);

    expect(readPlannerProgress(storage)).toBeNull();
  });

  it('reports failure when storage cannot be written', () => {
    const storage = {
      ...createMemoryPlannerStorage(),
      setItem() {
        throw new Error('storage unavailable');
      },
    };

    expect(writePlannerProgress(progress, storage)).toBe(false);
  });
});
