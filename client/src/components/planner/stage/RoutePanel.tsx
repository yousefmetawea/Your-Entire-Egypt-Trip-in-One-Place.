import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import type { PlannerFormValues } from '../../../types';
import { formatIsoDate } from '../../../lib/date';
import { getBudgetTierLabelKey, isBudgetTier, MAX_TRAVELERS } from '../../../lib/planner/options';
import { getRouteCities, orderRoute } from '../../../lib/planner/routeMap';
import { EgyptRouteMap } from './EgyptRouteMap';
import { ObeliskPanel } from './ObeliskPanel';

/** Map + obelisk + the answers so far. The route grows as interests are chosen. */
export function RoutePanel({
  values,
  stepIndex,
}: {
  values: PlannerFormValues;
  stepIndex: number;
}) {
  const { t, i18n } = useTranslation();
  const reduce = useReducedMotion();
  const route = orderRoute(getRouteCities(values.interests));
  const arrow = i18n.dir() === 'rtl' ? ' ← ' : ' → ';

  const start = formatIsoDate(values.startDate);
  const end = formatIsoDate(values.endDate);
  const travelers = Number(values.travelers);
  const chips: string[] = [];
  if (start && end) chips.push(t('planner.summary.dateRange', { from: start, to: end }));
  if (Number.isInteger(travelers) && travelers >= 1 && travelers <= MAX_TRAVELERS) {
    chips.push(t('planner.travelers.summary', { count: travelers }));
  }
  if (isBudgetTier(values.budgetTier)) chips.push(t(getBudgetTierLabelKey(values.budgetTier)));

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[4px] border border-[#bde85c]/15 bg-[#183a2a]/60 p-4 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-md sm:p-5"
    >
      <p className="type-label-sm tracking-[0.2em] text-[#bde85c]">{t('planner.stage.title')}</p>

      <div className="relative mt-3">
        <EgyptRouteMap interests={values.interests} className="block w-full" />
        <ObeliskPanel
          stepIndex={stepIndex}
          className="pointer-events-none absolute bottom-[1%] left-[1%] h-[40%] w-[19%]"
        />
      </div>

      <div className="mt-4 border-t border-white/10 pt-4">
        <p className="font-display text-lg leading-snug text-[#eef3e8]">
          {route.map((city) => t(`planner.stage.cities.${city.id}`)).join(arrow)}
        </p>
        <p className="mt-1 type-small text-[#9db0a2]">
          {values.interests.length === 0 ? t('planner.stage.hintEmpty') : t('planner.stage.hint')}
        </p>
        {chips.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <li
                key={chip}
                className="rounded-full border border-white/15 px-3 py-1 type-label-sm tracking-[0.06em] text-[#eef3e8]/90"
                dir="auto"
              >
                {chip}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </motion.div>
  );
}
