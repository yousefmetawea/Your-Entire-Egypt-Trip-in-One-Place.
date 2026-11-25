import { useLayoutEffect, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
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
import { CheckIcon } from '../ui/icons';

export interface PlannerStepContentProps {
  step: PlannerStep;
  values: PlannerFormValues;
  errors: PlannerErrors;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onChange: (patch: Partial<PlannerFormValues>) => void;
  onToggleInterest: (interest: PlannerFormValues['interests'][number], selected: boolean) => void;
}

const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#bde85c]';

/** Card photos. File names in this repo are unreliable, these were checked by eye. */
const INTEREST_IMAGES: Record<string, string> = {
  history: '/images/places/valley-of-the-kings.jpg',
  culture: '/images/places/grand-egyptian-museum.jpg',
  adventure: '/images/places/blue-hole-dahab.jpg',
};

const TRANSPORT_IMAGES: Record<string, string> = {
  transfer: '/images/stay/airport.jpg',
  'private-car': '/images/stay/private-car.jpg',
  bus: '/images/stay/bus.jpg',
  metro: '/images/stay/metro.jpg',
};

interface StepHeadingProps {
  step: PlannerStep;
  titleKey: string;
  descriptionKey: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
}

function StepHeading({ step, titleKey, descriptionKey, headingRef }: StepHeadingProps) {
  const { t } = useTranslation();
  const index = PLANNER_STEPS.indexOf(step);
  const title = t(titleKey);

  useLayoutEffect(() => {
    const el = headingRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const words = el.querySelectorAll('[data-word]');
    const tween = gsap.fromTo(
      words,
      { yPercent: 115, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.06, delay: 0.25 },
    );
    return () => {
      tween.kill();
    };
  }, [headingRef, title]);

  return (
    <div className="max-w-2xl">
      <p className="flex items-center gap-4 type-label tracking-[0.2em] text-[#bde85c]">
        <span
          className="font-display text-5xl leading-none tabular-nums text-transparent md:text-6xl"
          style={{ WebkitTextStroke: '1px #bde85c' }}
          aria-hidden="true"
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="h-px w-10 bg-[#bde85c]/50" aria-hidden="true" />
        <span>{t(getPlannerStepLabelKey(step))}</span>
      </p>
      <h2
        id={`planner-${step}-heading`}
        ref={headingRef}
        tabIndex={-1}
        aria-label={title}
        className="mt-space-md font-display text-4xl leading-[1.12] text-[#eef3e8] outline-none focus:outline-none focus-visible:outline-none md:text-5xl"
      >
        {title.split(' ').map((word, i) => (
          <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.14em] align-top">
            <span data-word className="inline-block" aria-hidden="true">
              {word}
              {'\u00a0'}
            </span>
          </span>
        ))}
      </h2>
      <p className="type-body-lg mt-space-md max-w-xl text-[#9db0a2]">{t(descriptionKey)}</p>
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-space-sm type-small text-[#f29b8b]">
      {message}
    </p>
  );
}

function Note({ children }: { children: string }) {
  return <p className="type-small mt-space-lg max-w-xl text-[#9db0a2]/80">{children}</p>;
}

interface Option {
  value: string;
  label: string;
  description?: string;
  image?: string;
}

interface ChoiceListProps {
  name: string;
  labelledBy: string;
  describedBy?: string;
  options: readonly Option[];
  value: string;
  onChange: (value: string) => void;
}

/** Large, open rows instead of boxed form controls. A real radio group underneath. */
function ChoiceList({ name, labelledBy, describedBy, options, value, onChange }: ChoiceListProps) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-invalid={Boolean(describedBy) || undefined}
      className="mt-space-lg max-w-2xl border-t border-white/10"
    >
      {options.map((option, index) => {
        const selected = value === option.value;
        return (
          <label
            key={option.value}
            className={cn(
              'group relative flex cursor-pointer items-center gap-5 border-b border-white/10 py-3.5 ps-1 pe-2 transition-[padding,background-color] duration-500 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#bde85c] md:py-4',
              selected ? 'bg-[#1b402f]/70 ps-5' : 'hover:bg-[#1b402f]/40 hover:ps-4',
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selected}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span
              aria-hidden="true"
              className={cn(
                'absolute inset-y-0 start-0 w-[3px] origin-top bg-[#bde85c] transition-transform duration-500',
                selected ? 'scale-y-100' : 'scale-y-0',
              )}
            />
            <span
              aria-hidden="true"
              className={cn(
                'w-8 shrink-0 font-display text-lg tabular-nums transition-colors',
                selected ? 'text-[#bde85c]' : 'text-[#9db0a2]/60',
              )}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  'block font-display text-2xl transition-colors md:text-3xl',
                  selected ? 'text-[#eef3e8]' : 'text-[#eef3e8]/80 group-hover:text-[#eef3e8]',
                )}
              >
                {option.label}
              </span>
              {option.description ? (
                <span className="mt-1 block type-small text-[#9db0a2]">{option.description}</span>
              ) : null}
            </span>
            {option.image ? (
              <span className="relative hidden size-11 shrink-0 overflow-hidden rounded-full border border-white/15 sm:block">
                <img
                  src={option.image}
                  alt=""
                  loading="lazy"
                  className={cn(
                    'size-full object-cover transition-[opacity,transform] duration-500',
                    selected ? 'scale-110 opacity-100' : 'opacity-50 group-hover:opacity-80',
                  )}
                />
              </span>
            ) : null}
            <span
              aria-hidden="true"
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300',
                selected
                  ? 'scale-100 border-[#bde85c] bg-[#bde85c] text-[#0f2a1e]'
                  : 'scale-90 border-white/25 text-transparent',
              )}
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
  if (!isIsoDate(startDate) || !isIsoDate(endDate) || endDate < startDate) return null;
  try {
    const days = enumerateDates(startDate, endDate).length;
    return { days, nights: Math.max(days - 1, 0) };
  } catch {
    return null;
  }
}

interface DarkFieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: (props: { id: string; describedBy?: string }) => React.ReactNode;
}

function DarkField({ id, label, hint, error, children }: DarkFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="block type-label tracking-[0.18em] text-[#bde85c]">
        {label}
      </label>
      {children({ id, describedBy })}
      {error ? (
        <FieldError id={`${id}-error`} message={error} />
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-space-xs type-small text-[#9db0a2]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const INPUT_CLASS = cn(
  'mt-2 block w-full border-0 border-b border-white/25 bg-transparent px-0 py-3 font-display text-3xl text-[#eef3e8] [color-scheme:dark] transition-colors hover:border-[#bde85c]/60 focus:border-[#bde85c]',
  FOCUS,
);

function DatesStep({
  values,
  errors,
  headingRef,
  onChange,
}: Omit<PlannerStepContentProps, 'step' | 'onToggleInterest'>) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const length = getTripLength(values.startDate, values.endDate);
  const startError = errors.startDate ? t(getPlannerErrorKey(errors.startDate)) : undefined;
  const endError = errors.endDate ? t(getPlannerErrorKey(errors.endDate)) : undefined;

  return (
    <>
      <StepHeading
        step="dates"
        titleKey="planner.dates.title"
        descriptionKey="planner.dates.description"
        headingRef={headingRef}
      />

      <div className="mt-space-lg grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10">
        <DarkField
          id="planner-start"
          label={t('planner.dates.startLabel')}
          hint={t('planner.dates.startHint')}
          error={startError}
        >
          {({ id, describedBy }) => (
            <input
              id={id}
              type="date"
              value={values.startDate}
              onChange={(event) => onChange({ startDate: event.target.value })}
              aria-invalid={Boolean(startError) || undefined}
              aria-describedby={describedBy}
              className={INPUT_CLASS}
            />
          )}
        </DarkField>
        <DarkField
          id="planner-end"
          label={t('planner.dates.endLabel')}
          hint={t('planner.dates.endHint')}
          error={endError}
        >
          {({ id, describedBy }) => (
            <input
              id={id}
              type="date"
              value={values.endDate}
              min={values.startDate || undefined}
              onChange={(event) => onChange({ endDate: event.target.value })}
              aria-invalid={Boolean(endError) || undefined}
              aria-describedby={describedBy}
              className={INPUT_CLASS}
            />
          )}
        </DarkField>
      </div>

      <div className="mt-space-lg max-w-2xl" aria-live="polite">
        <div className="relative h-px w-full bg-white/10">
          <motion.span
            className="absolute inset-y-0 start-0 w-full origin-left bg-[#bde85c] rtl:origin-right"
            initial={false}
            animate={{ scaleX: length ? 1 : 0 }}
            transition={{ duration: reduce ? 0 : 1, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        {length ? (
          <div className="mt-space-md flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="type-label tracking-[0.18em] text-[#bde85c]">
              {t('planner.dates.durationLabel')}
            </span>
            <span className="font-display text-3xl text-[#eef3e8]">
              {t('planner.dates.duration', {
                days: t('planner.dates.days', { count: length.days }),
                nights: t('planner.dates.nights', { count: length.nights }),
              })}
            </span>
            {length.days > MAX_TRIP_DAYS ? (
              <span className="type-small text-[#f29b8b]">
                {t('planner.dates.limit', { count: MAX_TRIP_DAYS })}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
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
  const error = errors.travelers ? t(getPlannerErrorKey(errors.travelers)) : undefined;
  const current = Number(values.travelers);
  const valid = Number.isInteger(current) && current >= 1 && current <= MAX_TRAVELERS;
  const stepBy = (delta: number) => {
    const base = valid ? current : 1;
    onChange({ travelers: String(Math.min(MAX_TRAVELERS, Math.max(1, base + delta))) });
  };
  const roundBtn = cn(
    'flex size-14 items-center justify-center rounded-full border border-white/25 font-display text-3xl text-[#eef3e8] transition-colors hover:border-[#bde85c] hover:text-[#bde85c] disabled:opacity-30',
    FOCUS,
  );

  return (
    <>
      <StepHeading
        step="travelers"
        titleKey="planner.travelers.title"
        descriptionKey="planner.travelers.description"
        headingRef={headingRef}
      />

      <div className="mt-space-lg flex items-center gap-6" dir="ltr">
        <button
          type="button"
          className={roundBtn}
          onClick={() => stepBy(-1)}
          disabled={valid && current <= 1}
          aria-label={t('planner.cine.fewer')}
        >
          −
        </button>
        <input
          id="planner-travelers"
          type="number"
          min={1}
          max={MAX_TRAVELERS}
          step={1}
          inputMode="numeric"
          value={values.travelers}
          onChange={(event) => onChange({ travelers: event.target.value })}
          aria-label={t('planner.travelers.label')}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? 'planner-travelers-error' : 'planner-travelers-hint'}
          className={cn(
            'w-32 border-0 border-b border-white/25 bg-transparent text-center font-display text-8xl text-[#bde85c] [appearance:textfield] focus:border-[#bde85c] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
            FOCUS,
          )}
        />
        <button
          type="button"
          className={roundBtn}
          onClick={() => stepBy(1)}
          disabled={valid && current >= MAX_TRAVELERS}
          aria-label={t('planner.cine.more')}
        >
          +
        </button>
      </div>

      <div className="mt-space-lg flex max-w-md flex-wrap gap-2" aria-hidden="true">
        {Array.from({ length: MAX_TRAVELERS }, (_, i) => (
          <span
            key={i}
            className={cn(
              'size-3 rounded-full border transition-all duration-500',
              valid && i < current
                ? 'scale-100 border-[#bde85c] bg-[#bde85c]'
                : 'scale-75 border-white/25',
            )}
          />
        ))}
      </div>

      {error ? (
        <FieldError id="planner-travelers-error" message={error} />
      ) : (
        <p id="planner-travelers-hint" className="mt-space-md type-small text-[#9db0a2]">
          {t('planner.travelers.hint', { count: MAX_TRAVELERS })}
        </p>
      )}
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
      <ChoiceList
        name="planner-budget"
        labelledBy="planner-budget-heading"
        describedBy={error ? 'planner-budget-error' : undefined}
        options={options}
        value={values.budgetTier}
        onChange={(value) => onChange({ budgetTier: value as BudgetTier })}
      />
      <FieldError id="planner-budget-error" message={error} />
      <Note>{t('planner.budget.note')}</Note>
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
        className="mt-space-lg grid max-w-2xl grid-cols-3 gap-2 sm:gap-3"
      >
        {SELECTABLE_INTERESTS.map((interest) => {
          const selected = values.interests.includes(interest);
          return (
            <button
              key={interest}
              type="button"
              aria-pressed={selected}
              onClick={() => onToggleInterest(interest, !selected)}
              className={cn(
                'group relative flex aspect-[3/5] w-full cursor-pointer flex-col justify-end overflow-hidden rounded-[3px] border p-3 text-start transition-[border-color,box-shadow] duration-500 sm:aspect-[4/5] sm:p-5',
                FOCUS,
                selected
                  ? 'border-[#bde85c] shadow-[0_0_46px_-14px_rgba(189,232,92,0.7)]'
                  : 'border-white/10 hover:border-[#bde85c]/50',
              )}
            >
              <img
                src={INTEREST_IMAGES[interest]}
                alt=""
                loading="lazy"
                className={cn(
                  'absolute inset-0 size-full object-cover transition-[transform,opacity,filter] duration-[900ms] group-hover:scale-105',
                  selected ? 'scale-105 opacity-100' : 'opacity-55 saturate-50',
                )}
              />
              <span className="absolute inset-0 bg-gradient-to-t from-[#0f2a1e] via-[#0f2a1e]/40 to-transparent" />
              <span
                className={cn(
                  'absolute end-2 top-2 flex size-6 items-center justify-center rounded-full border transition-all duration-300 sm:end-4 sm:top-4 sm:size-7',
                  selected
                    ? 'scale-100 border-[#bde85c] bg-[#bde85c] text-[#0f2a1e]'
                    : 'scale-90 border-white/40 text-transparent',
                )}
                aria-hidden="true"
              >
                <CheckIcon className="size-4" />
              </span>
              <span className="relative font-display text-base text-[#eef3e8] min-[420px]:text-xl sm:text-3xl">
                {t(getInterestLabelKey(interest))}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-space-lg flex flex-wrap items-center gap-x-6 gap-y-2">
        <p className="type-label tracking-[0.15em] text-[#bde85c]">
          {t('planner.interests.selectedCount', { count: values.interests.length })}
        </p>
        <p className="type-small text-[#9db0a2]">
          <span className="me-2 inline-block rounded-full border border-white/15 px-3 py-1 text-[#9db0a2]/70">
            {t('catalog.categories.food')}
          </span>
          {t('planner.interests.foodUnavailable')}
        </p>
      </div>

      <FieldError id="planner-interests-error" message={error} />
      <p id="planner-interests-note" className="sr-only">
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
      <ChoiceList
        name="planner-stay"
        labelledBy="planner-stay-heading"
        describedBy={error ? 'planner-stay-error' : undefined}
        options={options}
        value={values.accommodationType}
        onChange={(value) => onChange({ accommodationType: value as AccommodationType | 'any' })}
      />
      <FieldError id="planner-stay-error" message={error} />
      <Note>{t('planner.stay.note')}</Note>
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
    image: TRANSPORT_IMAGES[preference],
  }));

  return (
    <>
      <StepHeading
        step="transport"
        titleKey="planner.transport.title"
        descriptionKey="planner.transport.description"
        headingRef={headingRef}
      />
      <ChoiceList
        name="planner-transport"
        labelledBy="planner-transport-heading"
        describedBy={error ? 'planner-transport-error' : undefined}
        options={options}
        value={values.transportType}
        onChange={(value) => onChange({ transportType: value as TransportType | 'any' })}
      />
      <FieldError id="planner-transport-error" message={error} />
      <Note>{t('planner.transport.note')}</Note>
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
