import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import type { Accommodation } from '../../types';
import type { BudgetAnalyticsResult } from '../../lib/dashboard/budgetAnalytics';
import type { TripStats, TransferCounts } from '../../lib/mytrip/summary';
import { fmtMoney, fmtNumber } from '../../lib/mytrip/format';
import { useCountUp } from '../../lib/mytrip/useCountUp';

export interface TripOverviewProps {
  stats: TripStats;
  budget: BudgetAnalyticsResult | null;
  accommodation: Accommodation | null;
  transfers: TransferCounts;
}

function Indicator({
  label,
  value,
  caption,
  ratio,
  small = false,
  dots,
}: {
  label: string;
  value: ReactNode;
  caption?: string;
  ratio?: number | null;
  small?: boolean;
  dots?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="min-w-0 border-t border-(--yt-green)/20 pt-4">
      <dt className="text-[0.68rem] font-semibold tracking-[0.2em] text-(--yt-ink-2) uppercase">
        {label}
      </dt>
      <dd
        className={
          small
            ? 'mt-2 font-display text-2xl leading-tight font-medium [overflow-wrap:anywhere] sm:text-[1.7rem]'
            : 'mt-2 font-display text-5xl leading-none font-medium sm:text-6xl lg:text-7xl'
        }
      >
        {value}
      </dd>
      {dots && dots > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5" aria-hidden="true">
          {Array.from({ length: Math.min(dots, 14) }, (_, i) => (
            <span key={i} className="size-2 rounded-full bg-(--yt-green)" />
          ))}
        </div>
      ) : null}
      {caption ? <p className="mt-2 text-sm text-(--yt-ink-2)">{caption}</p> : null}
      {ratio !== null && ratio !== undefined ? (
        <div
          className="mt-3 h-1 overflow-hidden rounded-full bg-(--yt-green)/12"
          aria-hidden="true"
        >
          <motion.div
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: Math.min(1, Math.max(0, ratio)) }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="h-full origin-left rounded-full bg-(--yt-green) rtl:origin-right"
          />
        </div>
      ) : null}
    </div>
  );
}

function Count({ n }: { n: number }) {
  const { i18n } = useTranslation();
  return <>{fmtNumber(Math.round(useCountUp(n)), i18n.language)}</>;
}

export function TripOverview({ stats, budget, accommodation, transfers }: TripOverviewProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const transferValue =
    transfers.total === 0
      ? t('myTrip.overview.none')
      : transfers.pending > 0
        ? t('myTrip.overview.pending', { count: transfers.pending })
        : transfers.confirmed > 0
          ? t('myTrip.overview.confirmed', { count: transfers.confirmed })
          : t('myTrip.overview.cancelled', { count: transfers.cancelled });

  return (
    <section aria-label={t('myTrip.overview.title')}>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
        <Indicator
          label={t('myTrip.overview.destinations')}
          value={<Count n={stats.destinations} />}
        />
        <Indicator
          label={t('myTrip.overview.days')}
          value={<Count n={stats.days} />}
          dots={stats.days}
        />
        <Indicator
          label={t('myTrip.overview.activities')}
          value={<Count n={stats.activities} />}
          caption={
            stats.activities > 0
              ? t('myTrip.overview.timed', {
                  timed: stats.timedActivities,
                  total: stats.activities,
                })
              : undefined
          }
        />
        <Indicator
          small
          label={t('myTrip.overview.budget')}
          value={
            budget && budget.totalUtilized > 0
              ? fmtMoney(budget.totalUtilized, budget.currency, lang)
              : t('myTrip.overview.na')
          }
          caption={
            budget?.budgetCap
              ? t('myTrip.overview.ofCap', {
                  cap: fmtMoney(budget.budgetCap.amount, budget.budgetCap.currency, lang),
                })
              : t('myTrip.overview.estimated')
          }
          ratio={budget?.budgetRatio ?? null}
        />
        <Indicator
          small
          label={t('myTrip.overview.stay')}
          value={accommodation ? t('myTrip.overview.selected') : t('myTrip.overview.notSelected')}
          caption={accommodation ? undefined : t('myTrip.overview.stayHint')}
        />
        <Indicator small label={t('myTrip.overview.transfers')} value={transferValue} />
      </dl>
    </section>
  );
}
