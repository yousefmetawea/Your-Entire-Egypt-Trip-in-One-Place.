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
      padding="none"
      interactive
      className="flex h-full flex-col overflow-hidden"
    >
      {trip.images && trip.images[0] && (
        <div className="relative h-52 w-full overflow-hidden bg-primary-container">
          <img
            src={trip.images[0].src}
            alt={trip.images[0].alt.en}
            width={trip.images[0].width}
            height={trip.images[0].height}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-space-lg p-space-lg">
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
      </div>
    </Card>
  );
}
