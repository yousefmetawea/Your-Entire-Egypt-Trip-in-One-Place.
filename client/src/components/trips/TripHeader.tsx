import { useTranslation } from 'react-i18next';
import type { Trip } from '../../types';
import { AppLink } from '../../app/AppLink';
import { formatIsoDate } from '../../lib/date';
import { getBudgetTierLabelKey, isBudgetTier } from '../../lib/planner/options';
import { createPlanHref } from '../../lib/planner/prefill';
import { Badge } from '../ui/Badge';
import { ButtonLink } from '../ui/Button';
import { CalendarIcon, CompassIcon, InfoIcon, RouteIcon, UsersIcon } from '../ui/icons';

export interface TripHeaderProps {
  trip: Trip;
}

export function TripHeader({ trip }: TripHeaderProps) {
  const { t } = useTranslation();
  const startDate = formatIsoDate(trip.startDate);
  const endDate = formatIsoDate(trip.endDate);
  const dateText =
    startDate && endDate
      ? t('trip.dateRange', { from: startDate, to: endDate })
      : startDate
        ? t('trip.dateFrom', { date: startDate })
        : endDate
          ? t('trip.dateUntil', { date: endDate })
          : t('trip.summary.notSet');
  const budgetTier = trip.budgetTier && isBudgetTier(trip.budgetTier) ? trip.budgetTier : null;

  return (
    <header>
      <nav aria-label={t('trip.breadcrumbLabel')}>
        <AppLink
          href="/plan"
          className="type-label inline-flex items-center gap-space-xs text-secondary transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
        >
          <RouteIcon className="size-4" />
          {t('trip.backToPlanner')}
        </AppLink>
      </nav>

      <div className="mt-space-lg flex flex-wrap items-center gap-space-sm">
        <Badge tone="outline">{t('trip.draftBadge')}</Badge>
        <Badge tone="bronze">{t('trip.demoBadge')}</Badge>
      </div>

      <p className="type-label mt-space-md text-secondary">{t('trip.eyebrow')}</p>
      <h1
        id="trip-heading"
        className="type-display mt-space-sm max-w-5xl text-balance text-primary"
      >
        {trip.title}
      </h1>

      <div className="mt-space-md flex flex-wrap items-center gap-x-space-lg gap-y-space-sm type-small text-on-surface-variant">
        <span className="inline-flex items-center gap-space-xs">
          <CalendarIcon className="size-4 text-secondary" />
          {dateText}
        </span>
        <span className="inline-flex items-center gap-space-xs">
          <UsersIcon className="size-4 text-secondary" />
          {t('planner.travelers.summary', { count: trip.travelers })}
        </span>
        {budgetTier ? (
          <span className="inline-flex items-center gap-space-xs">
            <InfoIcon className="size-4 text-secondary" />
            {t(getBudgetTierLabelKey(budgetTier))}
          </span>
        ) : null}
      </div>

      <p className="type-small mt-space-md max-w-3xl text-on-surface-variant">
        {t('trip.demoNote')}
      </p>

      <div className="mt-space-lg flex flex-wrap items-center gap-space-sm">
        <ButtonLink
          as={AppLink}
          href={createPlanHref({
            from: trip.startDate,
            to: trip.endDate,
            travelers: trip.travelers,
          })}
          variant="secondary"
          size="md"
          startIcon={<RouteIcon />}
        >
          {t('trip.regenerate')}
        </ButtonLink>
        <ButtonLink
          as={AppLink}
          href="/discover"
          variant="ghost"
          size="md"
          startIcon={<CompassIcon />}
        >
          {t('trip.addPlaces')}
        </ButtonLink>
      </div>
    </header>
  );
}
