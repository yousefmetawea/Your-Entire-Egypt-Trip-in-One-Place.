import { describe, expect, it } from 'vitest';
import { EMPTY_PLANNER_FORM_VALUES } from './options';
import { createPlanHref, getPrefillStep, mergePrefill, parsePlannerPrefill } from './prefill';

describe('planner prefill', () => {
  it('parses valid from, to, and travelers values', () => {
    const params = new URLSearchParams('from=2026-12-01&to=2026-12-03&travelers=4');

    expect(parsePlannerPrefill(params)).toEqual({
      startDate: '2026-12-01',
      endDate: '2026-12-03',
      travelers: 4,
      hasPrefill: true,
    });
  });

  it('ignores invalid dates and traveler counts', () => {
    const params = new URLSearchParams('from=2026-02-30&to=nope&travelers=13');

    expect(parsePlannerPrefill(params)).toEqual({
      startDate: null,
      endDate: null,
      travelers: null,
      hasPrefill: false,
    });
  });

  it('drops an end date that is before the start date', () => {
    const params = new URLSearchParams('from=2026-12-03&to=2026-12-01&travelers=2');

    expect(parsePlannerPrefill(params)).toEqual({
      startDate: '2026-12-03',
      endDate: null,
      travelers: 2,
      hasPrefill: true,
    });
  });

  it('builds a plan href from valid values', () => {
    expect(
      createPlanHref({
        from: '2026-12-01',
        to: '2026-12-03',
        travelers: 4,
      }),
    ).toBe('/plan?from=2026-12-01&to=2026-12-03&travelers=4');
  });

  it('omits invalid values from the plan href', () => {
    expect(createPlanHref({ from: 'bad', to: '2026-12-03' })).toBe('/plan?to=2026-12-03');
    expect(createPlanHref({ travelers: '13' })).toBe('/plan');
    expect(createPlanHref()).toBe('/plan');
  });

  it('drops a reversed date range from the plan href', () => {
    expect(createPlanHref({ from: '2026-12-03', to: '2026-12-01' })).toBe('/plan?from=2026-12-03');
  });

  it('merges only values that were prefilled', () => {
    const values = {
      ...EMPTY_PLANNER_FORM_VALUES,
      startDate: '2026-11-01',
      travelers: '3',
    };

    expect(
      mergePrefill(values, {
        startDate: '2026-12-01',
        endDate: null,
        travelers: null,
        hasPrefill: true,
      }),
    ).toEqual({
      ...values,
      startDate: '2026-12-01',
    });
  });

  it('chooses the first step that has prefilled values', () => {
    expect(
      getPrefillStep({
        startDate: '2026-12-01',
        endDate: null,
        travelers: 3,
        hasPrefill: true,
      }),
    ).toBe('dates');

    expect(
      getPrefillStep({
        startDate: null,
        endDate: null,
        travelers: 3,
        hasPrefill: true,
      }),
    ).toBe('travelers');

    expect(
      getPrefillStep({
        startDate: null,
        endDate: null,
        travelers: null,
        hasPrefill: false,
      }),
    ).toBeNull();
  });
});
