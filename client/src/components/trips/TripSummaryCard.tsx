import { useId } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { Trip } from '../../types';
import { formatIsoDate } from '../../lib/date';
import {
  getAccommodationPreferenceLabelKey,
  getBudgetTierLabelKey,
  getInterestLabelKey,
  getTransportPreferenceLabelKey,
  isBudgetTier,
} from '../../lib/planner/options';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { InfoIcon } from '../ui/icons';

export interface TripSummaryCardProps {
  trip: Trip;
  activityCount: number;
  placeCount: number;
  emptyDayCount: number;
  hasMissingDetails: boolean;
}

function SummaryRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-space-md border-b border-hairline py-space-sm last:border-b-0">
      <dt className="type-small shrink-0 text-on-surface-variant">{label}</dt>
      <dd className="min-w-0 text-end type-title-sm text-primary">{children}</dd>
    </div>
  );
}

export function TripSummaryCard({
  trip,
  activityCount,
  placeCount,
  emptyDayCount,
  hasMissingDetails,
}: TripSummaryCardProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const startDate = formatIsoDate(trip.startDate);
  const endDate = formatIsoDate(trip.endDate);
  const dateText =
    startDate && endDate
      ? t('trip.summary.dateRange', { from: startDate, to: endDate })
      : startDate
        ? t('trip.summary.dateFrom', { date: startDate })
        : endDate
          ? t('trip.summary.dateUntil', { date: endDate })
          : t('trip.summary.notSet');
  const budgetTier = trip.budgetTier && isBudgetTier(trip.budgetTier) ? trip.budgetTier : null;
  const interestLabels = trip.interests.map((interest) => t(getInterestLabelKey(interest)));
  const accommodationType = trip.preferences.accommodationType;
  const transportType = trip.preferences.transportType;
  const stayLabel =
    accommodationType && accommodationType !== 'any'
      ? t(getAccommodationPreferenceLabelKey(accommodationType))
      : t('trip.summary.any');
  const transportLabel =
    transportType && transportType !== 'any'
      ? t(getTransportPreferenceLabelKey(transportType))
      : t('trip.summary.any');

  return (
    <Card
      as="section"
      variant="elevated"
      padding="lg"
      aria-labelledby={headingId}
      className="flex flex-col gap-space-md"
    >
      <div className="flex items-start justify-between gap-space-sm">
        <div>
          <p className="type-label text-secondary">{t('trip.summary.eyebrow')}</p>
          <h2 id={headingId} className="type-card-title mt-space-xs text-primary">
            {t('trip.summary.title')}
          </h2>
        </div>
        <Badge tone="bronze" size="sm">
          {t('trip.demoBadge')}
        </Badge>
      </div>

      <dl className="rounded-xl bg-surface-container-low/60 px-space-md">
        <SummaryRow label={t('trip.summary.datesLabel')}>{dateText}</SummaryRow>
        <SummaryRow label={t('trip.summary.travelersLabel')}>
          {t('planner.travelers.summary', { count: trip.travelers })}
        </SummaryRow>
        <SummaryRow label={t('trip.summary.budgetLabel')}>
          {budgetTier ? t(getBudgetTierLabelKey(budgetTier)) : t('trip.summary.notSet')}
        </SummaryRow>
        <SummaryRow label={t('trip.summary.daysLabel')}>
          {t('trip.summary.dayCount', { count: trip.days.length })}
        </SummaryRow>
        <SummaryRow label={t('trip.summary.activitiesLabel')}>
          {t('trip.summary.activityCount', { count: activityCount })}
        </SummaryRow>
        <SummaryRow label={t('trip.summary.placesLabel')}>
          {t('trip.summary.placeCount', { count: placeCount })}
        </SummaryRow>
        <SummaryRow label={t('trip.summary.interestsLabel')}>
          {interestLabels.length > 0 ? (
            <span className="flex flex-wrap justify-end gap-space-xs">
              {interestLabels.map((label) => (
                <Badge key={label} tone="neutral" size="sm">
                  {label}
                </Badge>
              ))}
            </span>
          ) : (
            t('trip.summary.notSet')
          )}
        </SummaryRow>
        <SummaryRow label={t('trip.summary.stayLabel')}>{stayLabel}</SummaryRow>
        <SummaryRow label={t('trip.summary.transportLabel')}>{transportLabel}</SummaryRow>
      </dl>

      {emptyDayCount > 0 ? (
        <p className="type-small rounded-xl bg-surface-container-low p-space-md text-on-surface-variant">
          {t('trip.summary.emptyDays', { count: emptyDayCount })}
        </p>
      ) : null}

      {hasMissingDetails ? (
        <div className="rounded-xl border border-hairline bg-surface-container-lowest p-space-md">
          <p className="type-label-sm flex items-center gap-space-xs text-primary">
            <InfoIcon className="size-4 shrink-0 text-secondary" />
            {t('trip.summary.missingTitle')}
          </p>
          <p className="type-small mt-space-xs text-on-surface-variant">
            {t('trip.summary.missingDescription')}
          </p>
        </div>
      ) : null}

      <p className="type-small text-on-surface-variant">{t('trip.summary.demoNote')}</p>
    </Card>
  );
}
