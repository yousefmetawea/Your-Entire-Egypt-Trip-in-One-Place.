import { useTranslation } from 'react-i18next';
import type { Trip } from '../../types';
import type { ItinerarySummary } from '../../lib/builder/summary';
import { getBudgetStatus } from '../../lib/builder/summary';
import { formatMoney } from '../../lib/placeDetails';
import { getBudgetTierLabelKey, isBudgetTier } from '../../lib/planner/options';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { AlertTriangleIcon, InfoIcon } from '../ui/icons';

export interface BuilderSummaryProps {
  trip: Trip;
  summary: ItinerarySummary;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-container-low p-space-sm">
      <dt className="type-small text-on-surface-variant">{label}</dt>
      <dd className="type-title-md mt-space-xs text-primary">{value}</dd>
    </div>
  );
}

export function BuilderSummary({ trip, summary }: BuilderSummaryProps) {
  const { t } = useTranslation();
  const budgetTier = trip.budgetTier && isBudgetTier(trip.budgetTier) ? trip.budgetTier : null;
  const budgetStatus = getBudgetStatus(summary.costs, trip.budget);
  const budgetPercent = budgetStatus
    ? Math.min(100, Math.max(0, Math.round(budgetStatus.ratio * 100)))
    : 0;
  const hasMissingData =
    summary.unpricedActivityCount > 0 ||
    summary.missingDurationCount > 0 ||
    summary.missingStartCount > 0;

  return (
    <Card variant="elevated" padding="lg" className="flex flex-col gap-space-md">
      <div className="flex items-start justify-between gap-space-sm">
        <div>
          <p className="type-label text-secondary">{t('trip.builder.summary.eyebrow')}</p>
          <h2 className="type-card-title mt-space-xs text-primary">
            {t('trip.builder.summary.title')}
          </h2>
        </div>
        <Badge tone="bronze" size="sm">
          {t('trip.demoBadge')}
        </Badge>
      </div>

      <dl className="grid grid-cols-2 gap-space-sm">
        <Stat
          label={t('trip.summary.daysLabel')}
          value={t('trip.summary.dayCount', { count: trip.days.length })}
        />
        <Stat
          label={t('trip.summary.activitiesLabel')}
          value={t('trip.summary.activityCount', { count: summary.activityCount })}
        />
        <Stat
          label={t('trip.summary.placesLabel')}
          value={t('trip.summary.placeCount', { count: summary.placeCount })}
        />
        <Stat
          label={t('trip.builder.summary.customLabel')}
          value={t('trip.builder.summary.customCount', { count: summary.customActivityCount })}
        />
      </dl>

      <div className="rounded-xl border border-hairline p-space-md">
        <p className="type-label-sm text-primary">{t('trip.builder.summary.costTitle')}</p>

        {summary.costs.length > 0 ? (
          <ul className="mt-space-sm space-y-space-sm">
            {summary.costs.map((cost) => (
              <li key={cost.currency}>
                <div className="flex items-start justify-between gap-space-sm">
                  <span className="type-small text-on-surface-variant">
                    {t('trip.builder.summary.groupLabel', { count: trip.travelers })}
                  </span>
                  <span className="type-title-sm shrink-0 text-primary">
                    {formatMoney({ amount: cost.groupTotal, currency: cost.currency })}
                  </span>
                </div>
                <p className="type-small mt-space-xs text-on-surface-variant">
                  {t('trip.builder.summary.perTraveler', {
                    amount: formatMoney({ amount: cost.perTraveler, currency: cost.currency }),
                  })}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="type-small mt-space-xs text-on-surface-variant">
            {t('trip.builder.summary.noCosts')}
          </p>
        )}

        {summary.unpricedActivityCount > 0 ? (
          <p className="type-small mt-space-sm text-on-surface-variant">
            {t('trip.builder.summary.unpriced', { count: summary.unpricedActivityCount })}
          </p>
        ) : null}

        <p className="type-small mt-space-sm text-on-surface-variant">
          {t('trip.builder.summary.costNote')}
        </p>
      </div>

      <div className="rounded-xl bg-surface-container-low p-space-md">
        <p className="type-label-sm text-primary">{t('trip.builder.summary.budgetTitle')}</p>
        <p className="type-small mt-space-xs text-on-surface-variant">
          {budgetTier
            ? t('trip.builder.summary.budgetPreference', {
                tier: t(getBudgetTierLabelKey(budgetTier)),
              })
            : t('trip.builder.summary.budgetPreferenceMissing')}
        </p>

        {trip.budget ? (
          budgetStatus ? (
            <div className="mt-space-sm">
              <div
                role="progressbar"
                aria-label={t('trip.builder.summary.budgetProgressLabel')}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={budgetPercent}
                className="h-2 overflow-hidden rounded-full bg-surface-container-high"
              >
                <div
                  className={
                    budgetStatus.level === 'over'
                      ? 'h-full rounded-full bg-error'
                      : budgetStatus.level === 'near'
                        ? 'h-full rounded-full bg-secondary'
                        : 'h-full rounded-full bg-success'
                  }
                  style={{ width: `${budgetPercent}%` }}
                />
              </div>
              <p className="type-small mt-space-xs text-on-surface-variant">
                {t('trip.builder.summary.budgetUsed', {
                  percent: Math.round(budgetStatus.ratio * 100),
                  amount: formatMoney(trip.budget),
                })}
              </p>
              {budgetStatus.level === 'over' ? (
                <p className="type-small mt-space-xs flex items-start gap-space-xs text-error">
                  <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
                  {t('trip.builder.summary.budgetOver')}
                </p>
              ) : budgetStatus.level === 'near' ? (
                <p className="type-small mt-space-xs flex items-start gap-space-xs text-secondary">
                  <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
                  {t('trip.builder.summary.budgetNear')}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="type-small mt-space-xs text-on-surface-variant">
              {t('trip.builder.summary.budgetCurrencyMismatch', {
                currency: trip.budget.currency,
              })}
            </p>
          )
        ) : null}
      </div>

      {hasMissingData ? (
        <div className="rounded-xl border border-hairline bg-surface-container-lowest p-space-md">
          <p className="type-label-sm flex items-center gap-space-xs text-primary">
            <InfoIcon className="size-4 shrink-0 text-secondary" />
            {t('trip.builder.summary.missingTitle')}
          </p>
          <ul className="type-small mt-space-xs space-y-0.5 text-on-surface-variant">
            {summary.missingDurationCount > 0 ? (
              <li>
                {t('trip.builder.summary.missingDurations', {
                  count: summary.missingDurationCount,
                })}
              </li>
            ) : null}
            {summary.missingStartCount > 0 ? (
              <li>
                {t('trip.builder.summary.missingStarts', {
                  count: summary.missingStartCount,
                })}
              </li>
            ) : null}
            {summary.unpricedActivityCount > 0 ? (
              <li>
                {t('trip.builder.summary.missingPrices', {
                  count: summary.unpricedActivityCount,
                })}
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}

      <p className="type-small text-on-surface-variant">
        {t('trip.builder.summary.stayTransport')}
      </p>
      <p className="type-small text-on-surface-variant">{t('trip.builder.summary.demoNote')}</p>
    </Card>
  );
}
