import { describe, expect, it } from 'vitest';
import type { PlannerFormValues } from '../../types';
import { EMPTY_PLANNER_FORM_VALUES } from './options';
import {
  getFirstPlannerErrorStep,
  validatePlannerAnswers,
  validatePlannerStep,
} from './validation';

function validValues(patch: Partial<PlannerFormValues> = {}): PlannerFormValues {
  return {
    ...EMPTY_PLANNER_FORM_VALUES,
    startDate: '2026-12-01',
    endDate: '2026-12-03',
    travelers: '2',
    budgetTier: 'balanced',
    interests: ['history'],
    ...patch,
  };
}

describe('planner validation', () => {
  it('accepts a complete answer set and counts the days', () => {
    const result = validatePlannerAnswers(validValues());

    expect(result).toMatchObject({
      ok: true,
      dayCount: 3,
      answers: {
        startDate: '2026-12-01',
        endDate: '2026-12-03',
        travelers: 2,
        budgetTier: 'balanced',
        interests: ['history'],
        accommodationType: 'any',
        transportType: 'any',
      },
    });
  });

  it('requires both dates and rejects invalid or reversed ranges', () => {
    expect(validatePlannerAnswers(validValues({ startDate: '' }))).toMatchObject({
      ok: false,
      errors: { startDate: 'required' },
    });

    expect(validatePlannerAnswers(validValues({ endDate: '2026-02-30' }))).toMatchObject({
      ok: false,
      errors: { endDate: 'invalid-date' },
    });

    expect(
      validatePlannerAnswers(validValues({ startDate: '2026-12-03', endDate: '2026-12-01' })),
    ).toMatchObject({
      ok: false,
      errors: { endDate: 'date-order' },
    });
  });

  it('rejects trips longer than 14 days', () => {
    expect(
      validatePlannerAnswers(validValues({ startDate: '2026-12-01', endDate: '2026-12-15' })),
    ).toMatchObject({
      ok: false,
      errors: { endDate: 'too-long' },
    });
  });

  it('validates traveler counts between 1 and 12', () => {
    expect(validatePlannerAnswers(validValues({ travelers: '' }))).toMatchObject({
      ok: false,
      errors: { travelers: 'required' },
    });

    expect(validatePlannerAnswers(validValues({ travelers: 'two' }))).toMatchObject({
      ok: false,
      errors: { travelers: 'travelers-invalid' },
    });

    expect(validatePlannerAnswers(validValues({ travelers: '0' }))).toMatchObject({
      ok: false,
      errors: { travelers: 'travelers-range' },
    });

    expect(validatePlannerAnswers(validValues({ travelers: '13' }))).toMatchObject({
      ok: false,
      errors: { travelers: 'travelers-range' },
    });
  });

  it('requires a budget tier and at least one interest', () => {
    expect(validatePlannerAnswers(validValues({ budgetTier: '' }))).toMatchObject({
      ok: false,
      errors: { budgetTier: 'budget-required' },
    });

    expect(validatePlannerAnswers(validValues({ interests: [] }))).toMatchObject({
      ok: false,
      errors: { interests: 'interests-required' },
    });
  });

  it('rejects interests that are not selectable yet', () => {
    expect(validatePlannerAnswers(validValues({ interests: ['food'] }))).toMatchObject({
      ok: false,
      errors: { interests: 'preference-invalid' },
    });
  });

  it('deduplicates interests in the validated answers', () => {
    const result = validatePlannerAnswers(
      validValues({ interests: ['history', 'history', 'culture'] }),
    );

    expect(result).toMatchObject({
      ok: true,
      answers: { interests: ['history', 'culture'] },
    });
  });

  it('validates only the requested step', () => {
    const values = validValues({ travelers: '99' });

    expect(validatePlannerStep('dates', values)).toEqual({});
    expect(validatePlannerStep('travelers', values)).toEqual({
      travelers: 'travelers-range',
    });
    expect(validatePlannerStep('budget', values)).toEqual({});
  });

  it('finds the earliest invalid step', () => {
    expect(
      getFirstPlannerErrorStep({
        transportType: 'preference-invalid',
        startDate: 'required',
      }),
    ).toBe('dates');

    expect(getFirstPlannerErrorStep({ interests: 'interests-required' })).toBe('interests');
    expect(getFirstPlannerErrorStep({})).toBeNull();
  });
});
