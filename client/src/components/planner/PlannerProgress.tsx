import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { PlannerFormValues, PlannerStep } from '../../types';
import { PLANNER_STEPS } from '../../types';
import { cn } from '../../lib/cn';
import { getPlannerStepLabelKey, getPlannerStepShortLabelKey } from '../../lib/planner/options';
import { hasPlannerErrors, validatePlannerStep } from '../../lib/planner/validation';

export interface PlannerProgressProps {
  currentStep: PlannerStep;
  values: PlannerFormValues;
  onStepSelect: (step: PlannerStep) => void;
}

/** Minimal progress: six thin lime segments. Labels show from sm and up. */
export function PlannerProgress({ currentStep, values, onStepSelect }: PlannerProgressProps) {
  const { t } = useTranslation();
  const currentIndex = PLANNER_STEPS.indexOf(currentStep);

  return (
    <nav aria-label={t('planner.progressLabel')}>
      <ol className="grid grid-cols-6 gap-2 md:gap-3">
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
                className="group block w-full cursor-pointer text-start focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B6CE67]"
              >
                <span className="relative block h-[2px] w-full overflow-hidden bg-white/15">
                  <motion.span
                    className="absolute inset-y-0 start-0 bg-[#B6CE67]"
                    initial={false}
                    animate={{
                      width: isCurrent || isComplete || index < currentIndex ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </span>
                <span
                  className={cn(
                    'mt-2 hidden truncate type-label-sm tracking-[0.12em] transition-colors sm:block',
                    isCurrent ? 'text-[#B6CE67]' : 'text-[#9db0a2] group-hover:text-[#eef3e8]',
                  )}
                >
                  <span className="me-2 tabular-nums opacity-60">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {t(getPlannerStepLabelKey(step))}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
