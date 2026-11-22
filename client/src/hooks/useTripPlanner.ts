import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import type {
  PlaceCategory,
  PlaceId,
  PlannerErrors,
  PlannerFormValues,
  PlannerStep,
  Trip,
} from '../types';
import { PLANNER_STEPS } from '../types';
import { getDraftPlaceIds } from '../lib/planner/draft';
import { EMPTY_PLANNER_FORM_VALUES } from '../lib/planner/options';
import { getPrefillStep, mergePrefill, parsePlannerPrefill } from '../lib/planner/prefill';
import {
  PLANNER_STORAGE_VERSION,
  clearPlannerProgress,
  readPlannerProgress,
  writePlannerProgress,
} from '../lib/planner/persistence';
import {
  getFirstPlannerErrorStep,
  hasPlannerErrors,
  validatePlannerAnswers,
  validatePlannerStep,
} from '../lib/planner/validation';
import { isServiceError, services } from '../services';

export type PlannerDraftStatus = 'loading' | 'ready' | 'error';

export type PlannerGenerateError = 'no-matches' | 'generic';

export type GeneratePlannerResult =
  | { ok: true; trip: Trip }
  | { ok: false; reason: 'validation' }
  | { ok: false; reason: 'service'; error: PlannerGenerateError };

interface PlannerState {
  values: PlannerFormValues;
  step: PlannerStep;
  generatedTripId: string | null;
  includeSavedPlaces: boolean;
}

export interface TripPlannerResult {
  values: PlannerFormValues;
  step: PlannerStep;
  errors: PlannerErrors;
  draftTrip: Trip | null;
  savedPlaceIds: PlaceId[];
  draftStatus: PlannerDraftStatus;
  generatedTripId: string | null;
  includeSavedPlaces: boolean;
  isSubmitting: boolean;
  generateError: PlannerGenerateError | null;
  hasExistingDraft: boolean;
  isRegenerating: boolean;
  updateValues: (patch: Partial<PlannerFormValues>) => void;
  toggleInterest: (interest: PlaceCategory, selected: boolean) => void;
  setIncludeSavedPlaces: (include: boolean) => void;
  goNext: () => boolean;
  goBack: () => void;
  goToStep: (step: PlannerStep) => void;
  reset: () => void;
  generate: () => Promise<GeneratePlannerResult>;
}

function createInitialState(searchParams: URLSearchParams): PlannerState {
  const stored = readPlannerProgress();
  const prefill = parsePlannerPrefill(searchParams);
  const baseValues = stored?.values ?? EMPTY_PLANNER_FORM_VALUES;

  return {
    values: prefill.hasPrefill ? mergePrefill(baseValues, prefill) : baseValues,
    step: prefill.hasPrefill
      ? (getPrefillStep(prefill) ?? stored?.step ?? 'dates')
      : (stored?.step ?? 'dates'),
    generatedTripId: stored?.generatedTripId ?? null,
    includeSavedPlaces: stored?.includeSavedPlaces ?? true,
  };
}

export function useTripPlanner(): TripPlannerResult {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<PlannerState>(() => createInitialState(searchParams));
  const [errors, setErrors] = useState<PlannerErrors>({});
  const [draftTrip, setDraftTrip] = useState<Trip | null>(null);
  const [savedPlaceIds, setSavedPlaceIds] = useState<PlaceId[]>([]);
  const [draftStatus, setDraftStatus] = useState<PlannerDraftStatus>('loading');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generateError, setGenerateError] = useState<PlannerGenerateError | null>(null);

  useEffect(() => {
    writePlannerProgress({
      version: PLANNER_STORAGE_VERSION,
      values: state.values,
      step: state.step,
      generatedTripId: state.generatedTripId,
      includeSavedPlaces: state.includeSavedPlaces,
    });
  }, [state]);

  useEffect(() => {
    let active = true;

    services.trips
      .listMine()
      .then((trips) => {
        if (!active) {
          return;
        }

        const draft = trips.find((trip) => trip.status === 'draft') ?? null;

        setDraftTrip(draft);
        setSavedPlaceIds(getDraftPlaceIds(draft));
        setDraftStatus('ready');

        setState((current) => {
          if (!current.generatedTripId) {
            return current;
          }

          const exists = trips.some(
            (trip) => trip.id === current.generatedTripId && trip.status === 'draft',
          );

          return exists ? current : { ...current, generatedTripId: null };
        });
      })
      .catch(() => {
        if (active) {
          setDraftStatus('error');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function updateValues(patch: Partial<PlannerFormValues>): void {
    setState((current) => ({
      ...current,
      values: { ...current.values, ...patch },
    }));
    setErrors({});
    setGenerateError(null);
  }

  function toggleInterest(interest: PlaceCategory, selected: boolean): void {
    setState((current) => {
      const interests = selected
        ? [...new Set([...current.values.interests, interest])]
        : current.values.interests.filter((item) => item !== interest);

      return {
        ...current,
        values: { ...current.values, interests },
      };
    });
    setErrors({});
    setGenerateError(null);
  }

  function setIncludeSavedPlaces(include: boolean): void {
    setState((current) => ({ ...current, includeSavedPlaces: include }));
  }

  function goNext(): boolean {
    const stepErrors = validatePlannerStep(state.step, state.values);

    if (hasPlannerErrors(stepErrors)) {
      setErrors(stepErrors);
      return false;
    }

    const index = PLANNER_STEPS.indexOf(state.step);

    if (index < 0 || index >= PLANNER_STEPS.length - 1) {
      return false;
    }

    setErrors({});
    setGenerateError(null);
    setState((current) => ({ ...current, step: PLANNER_STEPS[index + 1] }));
    return true;
  }

  function goBack(): void {
    const index = PLANNER_STEPS.indexOf(state.step);

    if (index <= 0) {
      return;
    }

    setErrors({});
    setGenerateError(null);
    setState((current) => ({ ...current, step: PLANNER_STEPS[index - 1] }));
  }

  function goToStep(step: PlannerStep): void {
    setErrors({});
    setGenerateError(null);
    setState((current) => ({ ...current, step }));
  }

  function reset(): void {
    setState({
      values: { ...EMPTY_PLANNER_FORM_VALUES, interests: [] },
      step: 'dates',
      generatedTripId: null,
      includeSavedPlaces: true,
    });
    setErrors({});
    setGenerateError(null);
    clearPlannerProgress();
  }

  async function generate(): Promise<GeneratePlannerResult> {
    const validation = validatePlannerAnswers(state.values);

    if (!validation.ok) {
      setErrors(validation.errors);
      const firstStep = getFirstPlannerErrorStep(validation.errors);

      if (firstStep) {
        setState((current) => ({ ...current, step: firstStep }));
      }

      return { ok: false, reason: 'validation' };
    }

    setIsSubmitting(true);
    setGenerateError(null);

    try {
      const result = await services.trips.createPlannedTrip({
        answers: validation.answers,
        replaceTripId: draftTrip?.id ?? null,
        includeSavedPlaces: state.includeSavedPlaces,
      });

      setDraftTrip(result.trip);
      setSavedPlaceIds(getDraftPlaceIds(result.trip));
      setDraftStatus('ready');
      setState((current) => ({ ...current, generatedTripId: result.trip.id }));

      return { ok: true, trip: result.trip };
    } catch (error) {
      const nextError: PlannerGenerateError =
        isServiceError(error) && error.code === 'VALIDATION' ? 'no-matches' : 'generic';

      setGenerateError(nextError);
      return { ok: false, reason: 'service', error: nextError };
    } finally {
      setIsSubmitting(false);
    }
  }

  const isRegenerating = state.generatedTripId !== null && draftTrip?.id === state.generatedTripId;

  return {
    values: state.values,
    step: state.step,
    errors,
    draftTrip,
    savedPlaceIds,
    draftStatus,
    generatedTripId: state.generatedTripId,
    includeSavedPlaces: state.includeSavedPlaces,
    isSubmitting,
    generateError,
    hasExistingDraft: draftTrip !== null,
    isRegenerating,
    updateValues,
    toggleInterest,
    setIncludeSavedPlaces,
    goNext,
    goBack,
    goToStep,
    reset,
    generate,
  };
}
