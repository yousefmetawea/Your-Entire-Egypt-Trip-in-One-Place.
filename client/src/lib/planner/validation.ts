import type {
  PlannerAnswers,
  PlannerErrorCode,
  PlannerErrors,
  PlannerField,
  PlannerFormValues,
  PlannerStep,
  PlannerValidationResult,
} from '../../types';
import { enumerateDates, isIsoDate } from '../date';
import {
  isAccommodationPreference,
  isBudgetTier,
  isSelectableInterest,
  isTransportPreference,
  MAX_TRAVELERS,
  MAX_TRIP_DAYS,
} from './options';

const TRAVELERS_PATTERN = /^\d+$/;

const FIELD_STEPS: Record<PlannerField, PlannerStep> = {
  startDate: 'dates',
  endDate: 'dates',
  travelers: 'travelers',
  budgetTier: 'budget',
  interests: 'interests',
  accommodationType: 'stay',
  transportType: 'transport',
};

function setError(errors: PlannerErrors, field: PlannerField, code: PlannerErrorCode): void {
  errors[field] = code;
}

function validateDates(values: PlannerFormValues, errors: PlannerErrors): void {
  const startDate = values.startDate.trim();
  const endDate = values.endDate.trim();

  if (!startDate) {
    setError(errors, 'startDate', 'required');
  } else if (!isIsoDate(startDate)) {
    setError(errors, 'startDate', 'invalid-date');
  }

  if (!endDate) {
    setError(errors, 'endDate', 'required');
  } else if (!isIsoDate(endDate)) {
    setError(errors, 'endDate', 'invalid-date');
  }

  if (isIsoDate(startDate) && isIsoDate(endDate)) {
    if (endDate < startDate) {
      setError(errors, 'endDate', 'date-order');
      return;
    }

    try {
      if (enumerateDates(startDate, endDate).length > MAX_TRIP_DAYS) {
        setError(errors, 'endDate', 'too-long');
      }
    } catch {
      setError(errors, 'endDate', 'invalid-date');
    }
  }
}

function validateTravelers(values: PlannerFormValues, errors: PlannerErrors): void {
  const travelers = values.travelers.trim();

  if (!travelers) {
    setError(errors, 'travelers', 'required');
    return;
  }

  if (!TRAVELERS_PATTERN.test(travelers)) {
    setError(errors, 'travelers', 'travelers-invalid');
    return;
  }

  const count = Number(travelers);

  if (count < 1 || count > MAX_TRAVELERS) {
    setError(errors, 'travelers', 'travelers-range');
  }
}

function validateBudget(values: PlannerFormValues, errors: PlannerErrors): void {
  if (!isBudgetTier(values.budgetTier)) {
    setError(errors, 'budgetTier', 'budget-required');
  }
}

function validateInterests(values: PlannerFormValues, errors: PlannerErrors): void {
  if (values.interests.length === 0) {
    setError(errors, 'interests', 'interests-required');
    return;
  }

  const invalid = values.interests.some((interest) => !isSelectableInterest(interest));

  if (invalid) {
    setError(errors, 'interests', 'preference-invalid');
  }
}

function validateAccommodation(values: PlannerFormValues, errors: PlannerErrors): void {
  if (!isAccommodationPreference(values.accommodationType)) {
    setError(errors, 'accommodationType', 'preference-invalid');
  }
}

function validateTransport(values: PlannerFormValues, errors: PlannerErrors): void {
  if (!isTransportPreference(values.transportType)) {
    setError(errors, 'transportType', 'preference-invalid');
  }
}

export function validatePlannerStep(step: PlannerStep, values: PlannerFormValues): PlannerErrors {
  const errors: PlannerErrors = {};

  switch (step) {
    case 'dates':
      validateDates(values, errors);
      break;
    case 'travelers':
      validateTravelers(values, errors);
      break;
    case 'budget':
      validateBudget(values, errors);
      break;
    case 'interests':
      validateInterests(values, errors);
      break;
    case 'stay':
      validateAccommodation(values, errors);
      break;
    case 'transport':
      validateTransport(values, errors);
      break;
  }

  return errors;
}

export function hasPlannerErrors(errors: PlannerErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function getFirstPlannerErrorStep(errors: PlannerErrors): PlannerStep | null {
  for (const step of ['dates', 'travelers', 'budget', 'interests', 'stay', 'transport'] as const) {
    const hasError = (Object.keys(errors) as PlannerField[]).some(
      (field) => FIELD_STEPS[field] === step,
    );

    if (hasError) {
      return step;
    }
  }

  return null;
}

export function validatePlannerAnswers(values: PlannerFormValues): PlannerValidationResult {
  const errors: PlannerErrors = {};

  validateDates(values, errors);
  validateTravelers(values, errors);
  validateBudget(values, errors);
  validateInterests(values, errors);
  validateAccommodation(values, errors);
  validateTransport(values, errors);

  if (hasPlannerErrors(errors)) {
    return { ok: false, errors };
  }

  const startDate = values.startDate.trim();
  const endDate = values.endDate.trim();
  const travelers = Number(values.travelers.trim());
  const budgetTier = values.budgetTier;

  if (!isBudgetTier(budgetTier)) {
    return { ok: false, errors: { budgetTier: 'budget-required' } };
  }

  const dayCount = enumerateDates(startDate, endDate).length;

  const answers: PlannerAnswers = {
    startDate,
    endDate,
    travelers,
    budgetTier,
    interests: [...new Set(values.interests)],
    accommodationType: values.accommodationType,
    transportType: values.transportType,
  };

  return { ok: true, answers, dayCount };
}
