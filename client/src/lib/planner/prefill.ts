import type { IsoDate, PlannerFormValues, PlannerPrefill, PlannerStep } from '../../types';
import { isIsoDate } from '../date';
import { MAX_TRAVELERS } from './options';

export interface PlanHrefInput {
  from?: string | null;
  to?: string | null;
  travelers?: string | number | null;
}

function normalizeDate(value: string | null | undefined): IsoDate | null {
  const trimmed = value?.trim() ?? '';
  return isIsoDate(trimmed) ? trimmed : null;
}

function normalizeTravelers(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numeric = typeof value === 'number' ? value : Number(value);

  if (!Number.isInteger(numeric) || numeric < 1 || numeric > MAX_TRAVELERS) {
    return null;
  }

  return numeric;
}

export function parsePlannerPrefill(params: URLSearchParams): PlannerPrefill {
  const startDate = normalizeDate(params.get('from'));
  let endDate = normalizeDate(params.get('to'));

  if (startDate && endDate && endDate < startDate) {
    endDate = null;
  }

  const travelers = normalizeTravelers(params.get('travelers'));

  return {
    startDate,
    endDate,
    travelers,
    hasPrefill: Boolean(startDate || endDate || travelers !== null),
  };
}

export function createPlanHref(input: PlanHrefInput = {}): string {
  const startDate = normalizeDate(input.from);
  let endDate = normalizeDate(input.to);

  if (startDate && endDate && endDate < startDate) {
    endDate = null;
  }

  const travelers = normalizeTravelers(input.travelers);
  const params = new URLSearchParams();

  if (startDate) {
    params.set('from', startDate);
  }

  if (endDate) {
    params.set('to', endDate);
  }

  if (travelers !== null) {
    params.set('travelers', String(travelers));
  }

  const search = params.toString();
  return search ? `/plan?${search}` : '/plan';
}

export function mergePrefill(
  values: PlannerFormValues,
  prefill: PlannerPrefill,
): PlannerFormValues {
  return {
    ...values,
    ...(prefill.startDate ? { startDate: prefill.startDate } : {}),
    ...(prefill.endDate ? { endDate: prefill.endDate } : {}),
    ...(prefill.travelers !== null ? { travelers: String(prefill.travelers) } : {}),
  };
}

export function getPrefillStep(prefill: PlannerPrefill): PlannerStep | null {
  if (prefill.startDate || prefill.endDate) {
    return 'dates';
  }

  if (prefill.travelers !== null) {
    return 'travelers';
  }

  return null;
}
