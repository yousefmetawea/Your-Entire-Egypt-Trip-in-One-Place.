import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { Place } from '../../types';
import type { DraftTripPlaceResult } from '../../hooks/useDraftTripPlace';
import { getDurationLabel } from '../../lib/catalog';
import { AddToTripButton, AddToTripFeedback } from './AddToTripButton';
import { OpeningHours } from './OpeningHours';
import { PriceDisplay } from './PriceDisplay';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

export interface PlaceInfoCardProps {
  place: Place;
  draft: DraftTripPlaceResult;
}

export function PlaceInfoCard({ place, draft }: PlaceInfoCardProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const duration = getDurationLabel(place.avgVisitMinutes);

  return (
    <Card
      as="section"
      variant="elevated"
      padding="none"
      aria-labelledby={headingId}
      className="p-space-lg md:p-space-xl"
    >
      <div className="flex flex-wrap items-start justify-between gap-space-sm">
        <div>
          <p className="type-label text-secondary">{t('placeDetails.practical.eyebrow')}</p>
          <h2 id={headingId} className="type-card-title mt-space-sm text-primary">
            {t('placeDetails.practical.title')}
          </h2>
        </div>
        <Badge tone="outline" size="sm">
          {t('placeDetails.demo.badge')}
        </Badge>
      </div>

      <div className="mt-space-lg space-y-space-lg">
        <PriceDisplay quote={place.ticketPrice} />

        <div className="border-t border-hairline pt-space-lg">
          <OpeningHours hours={place.openingHours} />
        </div>

        <div className="border-t border-hairline pt-space-lg">
          <p className="type-label text-on-surface-variant">
            {t('placeDetails.practical.durationLabel')}
          </p>
          <p className="type-title-sm mt-space-xs text-primary">
            {duration
              ? t(duration.key, duration.values)
              : t('placeDetails.practical.durationMissing')}
          </p>
        </div>
      </div>

      <div className="mt-space-lg border-t border-hairline pt-space-lg">
        <div className="hidden md:block">
          <AddToTripButton draft={draft} fullWidth />
          <AddToTripFeedback draft={draft} className="mt-space-sm" />
        </div>
        <div className="md:hidden">
          <AddToTripFeedback draft={draft} />
        </div>
      </div>
    </Card>
  );
}
