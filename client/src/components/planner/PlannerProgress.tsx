import { useTranslation } from 'react-i18next';
import type { PlannerFormValues, PlannerStep } from '../../types';
import { PLANNER_STEPS } from '../../types';
import { cn } from '../../lib/cn';
import { getPlannerStepLabelKey, getPlannerStepShortLabelKey } from '../../lib/planner/options';
import { hasPlannerErrors, validatePlannerStep } from '../../lib/planner/validation';
import { CheckIcon } from '../ui/icons';

export interface PlannerProgressProps {
  currentStep: PlannerStep;
  values: PlannerFormValues;
  onStepSelect: (step: PlannerStep) => void;
}

export function PlannerProgress({ currentStep, values, onStepSelect }: PlannerProgressProps) {
  const { t } = useTranslation();
  const currentIndex = PLANNER_STEPS.indexOf(currentStep);

  return (
    <nav aria-label={t('planner.progressLabel')}>
      <ol className="grid grid-cols-2 gap-space-sm sm:grid-cols-3 lg:grid-cols-6">
        {PLANNER_STEPS.map((step, index) => {
          const isCurrent = step === currentStep;
          const isComplete =
            index < currentIndex && !hasPlannerErrors(validatePlannerStep(step, values));
          const status = isCurrent
            ? t('planner.current')
            : isComplete
              ? t('planner.completed')
              : t('planner.upcoming');

          return (
            <li key={step}>
              <button
                type="button"
                onClick={() => onStepSelect(step)}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`${t(getPlannerStepShortLabelKey(step), {
                  number: String(index + 1).padStart(2, '0'),
                })}: ${t(getPlannerStepLabelKey(step))} (${status})`}
                className={cn(
                  'flex w-full items-center gap-space-xs rounded-xl p-space-sm text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary',
                  isCurrent
                    ? 'border border-secondary/30 bg-secondary-container/40 shadow-resting'
                    : isComplete
                      ? 'bg-surface-container-low/70 hover:bg-surface-container-low'
                      : 'bg-surface-container/50 opacity-60 hover:opacity-80',
                )}
              >
                <span
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    isCurrent
                      ? 'bg-secondary text-on-secondary'
                      : isComplete
                        ? 'bg-primary-container text-on-primary'
                        : 'bg-surface-container-high text-on-surface-variant',
                  )}
                  aria-hidden="true"
                >
                  {isComplete ? <CheckIcon className="size-4" /> : index + 1}
                </span>

                <span className="min-w-0">
                  <span
                    className={cn(
                      'type-label hidden truncate sm:block',
                      isCurrent ? 'text-secondary' : 'text-on-surface-variant',
                    )}
                  >
                    {status}
                  </span>
                  <span className="type-title-sm block truncate text-primary">
                    {t(getPlannerStepLabelKey(step))}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
