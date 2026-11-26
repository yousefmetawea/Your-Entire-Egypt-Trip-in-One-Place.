import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import type {
  BudgetAnalyticsResult,
  BudgetCategorySlice,
} from '../../lib/dashboard/budgetAnalytics';
import { fmtMoney, fmtNumber } from '../../lib/mytrip/format';
import { SectionHeading } from './shared';
import { useCountUp } from '../../lib/mytrip/useCountUp';

const SLICE_FILL: Record<BudgetCategorySlice['id'], string> = {
  stay: '#193426',
  activities: '#536255',
  transport: '#B6CE67',
};

const R = 70;
const C = 2 * Math.PI * R;

function Ring({ analytics }: { analytics: BudgetAnalyticsResult }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const reduce = useReducedMotion();
  const cap = analytics.budgetCap?.amount ?? 0;
  const over = cap > 0 && analytics.totalUtilized > cap;
  const base = cap > 0 ? Math.max(cap, analytics.totalUtilized) : analytics.totalUtilized;
  const capAngle = over ? (cap / base) * 360 : 0;
  const slices = analytics.slices.filter((s) => s.amount > 0);
  const centerValue =
    cap > 0 && analytics.budgetRatio !== null
      ? analytics.budgetRatio * 100
      : analytics.totalUtilized;
  const counted = useCountUp(centerValue);

  const arcs = slices.reduce<{ id: string; frac: number; start: number }[]>((list, s) => {
    const start = list.length ? list[list.length - 1].start + list[list.length - 1].frac : 0;
    const frac = base > 0 ? Math.min(s.amount / base, Math.max(0, 1 - start)) : 0;
    list.push({ id: s.id, frac, start });
    return list;
  }, []);

  return (
    <div className="relative mx-auto size-64 sm:size-72">
      <svg
        viewBox="0 0 180 180"
        className="size-full -rotate-90"
        role="img"
        aria-label={t('myTrip.budget.ringLabel')}
      >
        <circle
          cx="90"
          cy="90"
          r={R}
          fill="none"
          stroke="#193426"
          strokeOpacity="0.1"
          strokeWidth="16"
        />
        {arcs.map((a) => (
          <g key={a.id} transform={`rotate(${a.start * 360} 90 90)`}>
            <motion.circle
              cx="90"
              cy="90"
              r={R}
              fill="none"
              stroke={SLICE_FILL[a.id as keyof typeof SLICE_FILL]}
              strokeWidth="16"
              strokeLinecap="butt"
              strokeDasharray={C}
              initial={reduce ? false : { strokeDashoffset: C }}
              whileInView={{ strokeDashoffset: C * (1 - a.frac) }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              style={reduce ? { strokeDashoffset: C * (1 - a.frac) } : undefined}
            />
          </g>
        ))}
        {over ? (
          <line
            x1="90"
            y1={90 - R - 13}
            x2="90"
            y2={90 - R + 13}
            stroke="#fff"
            strokeWidth="3"
            transform={`rotate(${capAngle} 90 90)`}
          />
        ) : null}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-(--yt-ink-2) uppercase">
          {cap > 0 ? t('myTrip.budget.ofEstimateCap') : t('myTrip.budget.estimatedTotal')}
        </span>
        <span className="mt-1 font-display text-4xl font-medium">
          {cap > 0 && analytics.budgetRatio !== null
            ? `${fmtNumber(Math.round(counted), lang)}%`
            : fmtMoney(Math.round(counted), analytics.currency, lang)}
        </span>
        {over && analytics.remainingReserve !== null ? (
          <span className="mt-1 rounded-full bg-(--yt-green) px-2.5 py-0.5 text-[0.7rem] font-semibold text-(--yt-on-dark)">
            {t('myTrip.budget.overBy', {
              amount: fmtMoney(Math.abs(analytics.remainingReserve), analytics.currency, lang),
            })}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function BudgetOverview({ analytics }: { analytics: BudgetAnalyticsResult | null }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const reduce = useReducedMotion();

  return (
    <section
      aria-labelledby="mt-budget-heading"
      className="yt-ivory-skip bg-(--yt-sage) py-20 md:py-28"
    >
      <div className="mx-auto w-full max-w-page px-gutter-sm md:px-margin-md lg:px-margin-lg">
        <SectionHeading
          id="mt-budget-heading"
          eyebrow={t('myTrip.budget.eyebrow')}
          title={t('myTrip.budget.title')}
        />
        {!analytics || (analytics.totalUtilized === 0 && analytics.slices.length === 0) ? (
          <div className="mt-10 rounded-3xl bg-white/70 p-10 text-center text-(--yt-ink-2)">
            {t('myTrip.budget.empty')}
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-12">
            <div className="rounded-[2rem] bg-white p-8 lg:col-span-5">
              <Ring analytics={analytics} />
              {analytics.unpricedItemsTotal > 0 ? (
                <p
                  role="note"
                  className="mt-6 flex items-start gap-2 rounded-2xl bg-(--yt-sage)/60 px-4 py-3 text-sm font-medium text-(--yt-green)"
                >
                  <span
                    aria-hidden="true"
                    className="mt-1.5 size-2 shrink-0 rounded-full bg-(--yt-green)"
                  />
                  <span>
                    {t('myTrip.budget.partialBadge', { count: analytics.unpricedItemsTotal })}
                  </span>
                </p>
              ) : null}
              <dl className="mt-8 space-y-3 text-sm">
                <div className="flex items-baseline justify-between gap-4 border-b border-(--yt-green)/10 pb-3">
                  <dt className="text-(--yt-ink-2)">{t('myTrip.budget.estimatedTotal')}</dt>
                  <dd className="font-semibold">
                    {fmtMoney(analytics.totalUtilized, analytics.currency, lang)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-b border-(--yt-green)/10 pb-3">
                  <dt className="text-(--yt-ink-2)">{t('myTrip.budget.cap')}</dt>
                  <dd className="font-semibold">
                    {analytics.budgetCap
                      ? fmtMoney(analytics.budgetCap.amount, analytics.budgetCap.currency, lang)
                      : t('myTrip.budget.notSet')}
                  </dd>
                </div>
                {analytics.remainingReserve !== null ? (
                  <div className="flex items-baseline justify-between gap-4 border-b border-(--yt-green)/10 pb-3">
                    <dt className="text-(--yt-ink-2)">
                      {analytics.remainingReserve >= 0
                        ? t('myTrip.budget.remaining')
                        : t('myTrip.budget.over')}
                    </dt>
                    <dd className="font-semibold">
                      {fmtMoney(Math.abs(analytics.remainingReserve), analytics.currency, lang)}
                    </dd>
                  </div>
                ) : null}
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-(--yt-ink-2)">{t('myTrip.budget.actual')}</dt>
                  <dd className="text-end font-medium text-(--yt-ink-2)">
                    {t('myTrip.budget.actualNone')}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-col justify-between rounded-[2rem] bg-(--yt-green) p-8 text-(--yt-on-dark) lg:col-span-7 sm:p-10">
              <div>
                <h3 className="text-xs font-semibold tracking-[0.22em] text-(--yt-lime) uppercase">
                  {t('myTrip.budget.breakdown')}
                </h3>
                <ul className="mt-8 space-y-7">
                  {analytics.slices.map((s) => {
                    const share =
                      analytics.totalUtilized > 0 ? s.amount / analytics.totalUtilized : 0;
                    return (
                      <li key={s.id}>
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="font-display text-xl">
                            {t(`myTrip.budget.cat.${s.id}`)}
                          </span>
                          <span className="text-lg font-medium">
                            {s.isUnpriced
                              ? t('myTrip.budget.unpriced')
                              : fmtMoney(s.amount, analytics.currency, lang)}
                          </span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/12">
                          <motion.div
                            initial={reduce ? false : { scaleX: 0 }}
                            whileInView={{ scaleX: share }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full origin-left rounded-full bg-(--yt-lime) rtl:origin-right"
                          />
                        </div>
                        <p className="mt-2 text-xs text-(--yt-on-dark-2)">
                          {t(`myTrip.budget.catNote.${s.id}`, { count: s.itemCount })} ·{' '}
                          {t('myTrip.estimated')}
                          {s.isUnpriced
                            ? ''
                            : ` · ${t('myTrip.budget.shareOf', { pct: fmtNumber(s.percentage, lang) })}`}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="mt-10 space-y-2 border-t border-white/15 pt-6 text-sm text-(--yt-on-dark-2)">
                <p>{t('myTrip.budget.estimateNote')}</p>
                {analytics.hasMixedCurrencies ? <p>{t('myTrip.budget.mixed')}</p> : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
