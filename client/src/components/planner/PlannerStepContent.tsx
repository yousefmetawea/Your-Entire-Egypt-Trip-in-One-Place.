import type { RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  AccommodationType,
  BudgetTier,
  PlannerErrors,
  PlannerFormValues,
  PlannerStep,
  TransportType,
} from '../../types';
import { PLANNER_STEPS } from '../../types';
import { cn } from '../../lib/cn';
import { enumerateDates, isIsoDate } from '../../lib/date';
import {
  ACCOMMODATION_PREFERENCES,
  BUDGET_TIERS,
  getAccommodationPreferenceLabelKey,
  getBudgetTierDescriptionKey,
  getBudgetTierLabelKey,
  getInterestLabelKey,
  getPlannerErrorKey,
  getPlannerStepLabelKey,
  getTransportPreferenceLabelKey,
  MAX_TRAVELERS,
  MAX_TRIP_DAYS,
  SELECTABLE_INTERESTS,
  TRANSPORT_PREFERENCES,
} from '../../lib/planner/options';
import { Badge } from '../ui/Badge';
import { Chip } from '../ui/Chip';
import { Input } from '../ui/Input';
import { CheckIcon } from '../ui/icons';

export interface PlannerStepContentProps {
  step: PlannerStep;
  values: PlannerFormValues;
  errors: PlannerErrors;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onChange: (patch: Partial<PlannerFormValues>) => void;
  onToggleInterest: (interest: PlannerFormValues['interests'][number], selected: boolean) => void;
}

interface StepHeadingProps {
  step: PlannerStep;
  titleKey: string;
  descriptionKey: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
}

function StepHeading({ step, titleKey, descriptionKey, headingRef }: StepHeadingProps) {
  const { t } = useTranslation();
  const number = PLANNER_STEPS.indexOf(step) + 1;

  return (
    <div className="max-w-2xl">
      <p className="type-label text-secondary">
        {t('planner.stepEyebrow', {
          number,
          label: t(getPlannerStepLabelKey(step)),
        })}
      </p>
      <h2
        id={`planner-${step}-heading`}
        ref={headingRef}
        tabIndex={-1}
        className="type-card-title mt-space-xs text-primary"
      >
        {t(titleKey)}
      </h2>
      <p className="type-body mt-space-sm text-on-surface-variant">{t(descriptionKey)}</p>
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="mt-space-xs type-small text-error">
      {message}
    </p>
  );
}

interface Option {
  value: string;
  label: string;
  description?: string;
}

interface OptionGroupProps {
  name: string;
  labelledBy: string;
  describedBy?: string;
  options: readonly Option[];
  value: string;
  onChange: (value: string) => void;
  columns?: string;
}

function OptionGroup({
  name,
  labelledBy,
  describedBy,
  options,
  value,
  onChange,
  columns = 'sm:grid-cols-2',
}: OptionGroupProps) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-invalid={Boolean(describedBy) || undefined}
      className={cn('mt-space-lg grid grid-cols-1 gap-space-sm', columns)}
    >
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <label
            key={option.value}
            className={cn(
              'flex cursor-pointer items-start justify-between gap-space-md rounded-xl border p-space-md transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-secondary',
              selected
                ? 'border-secondary bg-secondary-container/20 shadow-resting'
                : 'border-hairline bg-surface-container-lowest hover:border-secondary/40 hover:bg-surface-container-low/50',
            )}
          >
            <span className="min-w-0">
              <span className="type-title-sm block text-primary">{option.label}</span>
              {option.description ? (
                <span className="type-small mt-space-xs block text-on-surface-variant">
                  {option.description}
                </span>
              ) : null}
            </span>

            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selected}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />

            <span
              className={cn(
                'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border',
                selected
                  ? 'border-secondary bg-secondary text-on-secondary'
                  : 'border-hairline-strong bg-surface-container-lowest text-transparent',
              )}
              aria-hidden="true"
            >
              <CheckIcon className="size-4" />
            </span>
          </label>
        );
      })}
    </div>
  );
}

function getTripLength(
  startDate: string,
  endDate: string,
): { days: number; nights: number } | null {
  if (!isIsoDate(startDate) || !isIsoDate(endDate) || endDate < startDate) {
    return null;
  }

  try {
    const days = enumerateDates(startDate, endDate).length;
    return { days, nights: Math.max(days - 1, 0) };
  } catch {
    return null;
  }
}

function DatesStep({
  values,
  errors,
  headingRef,
  onChange,
}: Omit<PlannerStepContentProps, 'step' | 'onToggleInterest'>) {
  const { t } = useTranslation();
  const length = getTripLength(values.startDate, values.endDate);

  return (
    <>
      <StepHeading
        step="dates"
        titleKey="planner.dates.title"
        descriptionKey="planner.dates.description"
        headingRef={headingRef}
      />

      <div className="mt-space-lg grid grid-cols-1 gap-space-md sm:grid-cols-2">
        <Input
          label={t('planner.dates.startLabel')}
          type="date"
          value={values.startDate}
          onChange={(event) => onChange({ startDate: event.target.value })}
          hint={t('planner.dates.startHint')}
          error={errors.startDate ? t(getPlannerErrorKey(errors.startDate)) : undefined}
        />

        <Input
          label={t('planner.dates.endLabel')}
          type="date"
          value={values.endDate}
          min={values.startDate || undefined}
          onChange={(event) => onChange({ endDate: event.target.value })}
          hint={t('planner.dates.endHint')}
          error={errors.endDate ? t(getPlannerErrorKey(errors.endDate)) : undefined}
        />
      </div>

      {length ? (
        <div className="mt-space-md flex flex-wrap items-center gap-space-sm rounded-xl bg-surface-container-low p-space-md">
          <Badge tone="bronze" size="sm">
            {t('planner.dates.durationLabel')}
          </Badge>
          <p className="type-title-sm text-primary">
            {t('planner.dates.duration', {
              days: t('planner.dates.days', { count: length.days }),
              nights: t('planner.dates.nights', { count: length.nights }),
            })}
          </p>
          {length.days > MAX_TRIP_DAYS ? (
            <Badge tone="warning" size="sm">
              {t('planner.dates.limit', { count: MAX_TRIP_DAYS })}
            </Badge>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function TravelersStep({
  values,
  errors,
  headingRef,
  onChange,
}: Omit<PlannerStepContentProps, 'step' | 'onToggleInterest'>) {
  const { t } = useTranslation();

  return (
    <>
      <StepHeading
        step="travelers"
        titleKey="planner.travelers.title"
        descriptionKey="planner.travelers.description"
        headingRef={headingRef}
      />

      <div className="mt-space-lg max-w-xs">
        <Input
          label={t('planner.travelers.label')}
          type="number"
          min={1}
          max={MAX_TRAVELERS}
          step={1}
          inputMode="numeric"
          value={values.travelers}
          onChange={(event) => onChange({ travelers: event.target.value })}
          hint={t('planner.travelers.hint', { count: MAX_TRAVELERS })}
          error={errors.travelers ? t(getPlannerErrorKey(errors.travelers)) : undefined}
        />
      </div>
    </>
  );
}

function BudgetStep({
  values,
  errors,
  headingRef,
  onChange,
}: Omit<PlannerStepContentProps, 'step' | 'onToggleInterest'>) {
  const { t } = useTranslation();
  const error = errors.budgetTier ? t(getPlannerErrorKey(errors.budgetTier)) : undefined;
  const options = BUDGET_TIERS.map((tier) => ({
    value: tier,
    label: t(getBudgetTierLabelKey(tier)),
    description: t(getBudgetTierDescriptionKey(tier)),
  }));

  return (
    <>
      <StepHeading
        step="budget"
        titleKey="planner.budget.title"
        descriptionKey="planner.budget.description"
        headingRef={headingRef}
      />

      <OptionGroup
        name="planner-budget"
        labelledBy="planner-budget-heading"
        describedBy={error ? 'planner-budget-error' : undefined}
        options={options}
        value={values.budgetTier}
        onChange={(value) => onChange({ budgetTier: value as BudgetTier })}
        columns="sm:grid-cols-3"
      />
      <FieldError id="planner-budget-error" message={error} />
      <p className="type-small mt-space-md text-on-surface-variant">{t('planner.budget.note')}</p>
    </>
  );
}

function InterestsStep({
  values,
  errors,
  headingRef,
  onToggleInterest,
}: Omit<PlannerStepContentProps, 'step' | 'onChange'>) {
  const { t } = useTranslation();
  const error = errors.interests ? t(getPlannerErrorKey(errors.interests)) : undefined;

  return (
    <>
      <StepHeading
        step="interests"
        titleKey="planner.interests.title"
        descriptionKey="planner.interests.description"
        headingRef={headingRef}
      />

      <div
        role="group"
        aria-labelledby="planner-interests-heading"
        aria-describedby={error ? 'planner-interests-error' : 'planner-interests-note'}
        aria-invalid={Boolean(error) || undefined}
        className="mt-space-lg flex flex-wrap items-center gap-space-sm"
      >
        {SELECTABLE_INTERESTS.map((interest) => (
          <Chip
            key={interest}
            selected={values.interests.includes(interest)}
            onSelectedChange={(selected) => onToggleInterest(interest, selected)}
          >
            {t(getInterestLabelKey(interest))}
          </Chip>
        ))}
        <Chip disabled>{t('catalog.categories.food')}</Chip>
        <Badge tone="outline" size="sm">
          {t('planner.interests.foodUnavailable')}
        </Badge>
      </div>

      <div className="mt-space-md flex flex-wrap items-center gap-space-sm">
        <p className="type-small text-on-surface-variant">
          {t('planner.interests.selectedCount', { count: values.interests.length })}
        </p>
      </div>

      <FieldError id="planner-interests-error" message={error} />
      <p id="planner-interests-note" className="type-small mt-space-md text-on-surface-variant">
        {t('planner.interests.note')}
      </p>
    </>
  );
}

function StayStep({
  values,
  errors,
  headingRef,
  onChange,
}: Omit<PlannerStepContentProps, 'step' | 'onToggleInterest'>) {
  const { t } = useTranslation();
  const error = errors.accommodationType
    ? t(getPlannerErrorKey(errors.accommodationType))
    : undefined;
  const options = ACCOMMODATION_PREFERENCES.map((preference) => ({
    value: preference,
    label: t(getAccommodationPreferenceLabelKey(preference)),
  }));

  return (
    <>
      <StepHeading
        step="stay"
        titleKey="planner.stay.title"
        descriptionKey="planner.stay.description"
        headingRef={headingRef}
      />

      <OptionGroup
        name="planner-stay"
        labelledBy="planner-stay-heading"
        describedBy={error ? 'planner-stay-error' : undefined}
        options={options}
        value={values.accommodationType}
        onChange={(value) => onChange({ accommodationType: value as AccommodationType | 'any' })}
        columns="sm:grid-cols-3"
      />
      <FieldError id="planner-stay-error" message={error} />
      <p className="type-small mt-space-md text-on-surface-variant">{t('planner.stay.note')}</p>
    </>
  );
}

function TransportStep({
  values,
  errors,
  headingRef,
  onChange,
}: Omit<PlannerStepContentProps, 'step' | 'onToggleInterest'>) {
  const { t } = useTranslation();
  const error = errors.transportType ? t(getPlannerErrorKey(errors.transportType)) : undefined;
  const options = TRANSPORT_PREFERENCES.map((preference) => ({
    value: preference,
    label: t(getTransportPreferenceLabelKey(preference)),
  }));

  return (
    <>
      <StepHeading
        step="transport"
        titleKey="planner.transport.title"
        descriptionKey="planner.transport.description"
        headingRef={headingRef}
      />

      <OptionGroup
        name="planner-transport"
        labelledBy="planner-transport-heading"
        describedBy={error ? 'planner-transport-error' : undefined}
        options={options}
        value={values.transportType}
        onChange={(value) => onChange({ transportType: value as TransportType | 'any' })}
        columns="sm:grid-cols-2 lg:grid-cols-3"
      />
      <FieldError id="planner-transport-error" message={error} />
      <p className="type-small mt-space-md text-on-surface-variant">
        {t('planner.transport.note')}
      </p>
    </>
  );
}

export function PlannerStepContent(props: PlannerStepContentProps) {
  switch (props.step) {
    case 'dates':
      return <DatesStep {...props} />;
    case 'travelers':
      return <TravelersStep {...props} />;
    case 'budget':
      return <BudgetStep {...props} />;
    case 'interests':
      return <InterestsStep {...props} />;
    case 'stay':
      return <StayStep {...props} />;
    case 'transport':
      return <TransportStep {...props} />;
  }
}
