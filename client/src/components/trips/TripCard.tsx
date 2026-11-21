import { useTranslation } from 'react-i18next';
import type { ReadyMadeTrip } from '../../types';
import { AppLink } from '../../app/AppLink';
import { Badge } from '../ui/Badge';
import { ButtonLink } from '../ui/Button';
import { Card } from '../ui/Card';
import { ArrowRightIcon } from '../ui/icons';

export interface TripCardProps {
  trip: ReadyMadeTrip;
}

export function TripCard({ trip }: TripCardProps) {
  const { t } = useTranslation();

  return (
    <Card
      as="article"
      variant="surface"
      padding="lg"
      interactive
      className="flex h-full flex-col gap-space-lg"
    >
      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <Badge tone="bronze">{t('home.trips.duration', { count: trip.durationDays })}</Badge>
        <Badge tone="outline">{t('home.trips.demo')}</Badge>
      </div>

      <div className="flex-1">
        <h3 className="type-card-title text-primary">{trip.title.en}</h3>
        {trip.description ? (
          <p className="type-body mt-space-sm text-on-surface-variant">{trip.description.en}</p>
        ) : null}
      </div>

      <ButtonLink
        as={AppLink}
        href="/plan"
        variant="secondary"
        size="sm"
        endIcon={<ArrowRightIcon className="rtl:rotate-180" />}
        className="w-fit"
      >
        {t('home.trips.planSimilar')}
      </ButtonLink>
    </Card>
  );
}
