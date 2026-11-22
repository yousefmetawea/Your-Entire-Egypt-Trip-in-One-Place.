import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { Place } from '../../types';
import { useNearbyPlaces } from '../../hooks/useNearbyPlaces';
import { formatStraightLineDistance } from '../../lib/map/distance';
import { EmptyState } from '../common/EmptyState';
import { PlaceCard, PlaceCardSkeleton } from './PlaceCard';
import { PlaceSectionHeading } from './PlaceSectionHeading';
import { Button } from '../ui/Button';
import { InfoIcon } from '../ui/icons';

export interface NearbyPlacesProps {
  place: Place;
}

export function NearbyPlaces({ place }: NearbyPlacesProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const { placesWithDistance, status, retry } = useNearbyPlaces(place);

  return (
    <section aria-labelledby={headingId}>
      <PlaceSectionHeading
        eyebrow={t('placeDetails.nearby.eyebrow')}
        title={t('placeDetails.nearby.title')}
        description={t('placeDetails.nearby.description')}
        id={headingId}
      />

      <div className="mt-space-lg">
        {status === 'loading' || status === 'idle' ? (
          <>
            <p className="sr-only" role="status" aria-live="polite">
              {t('placeDetails.nearby.loading')}
            </p>
            <div className="grid grid-cols-1 gap-gutter-lg sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <PlaceCardSkeleton key={index} />
              ))}
            </div>
          </>
        ) : status === 'error' ? (
          <EmptyState
            title={t('placeDetails.nearby.errorTitle')}
            description={t('placeDetails.nearby.errorDescription')}
            role="alert"
            icon={<InfoIcon />}
            actions={
              <Button variant="secondary" size="sm" onClick={retry}>
                {t('placeDetails.nearby.retry')}
              </Button>
            }
          />
        ) : placesWithDistance.length === 0 ? (
          <EmptyState
            title={t('placeDetails.nearby.emptyTitle')}
            description={t('placeDetails.nearby.emptyDescription')}
            icon={<InfoIcon />}
          />
        ) : (
          <div className="flex flex-col gap-space-md">
            <p className="type-small text-on-surface-variant">
              {t(
                'map.nearbyRadiusNotice',
                'Showing places within ~1 km (straight-line) of this visitor entrance.',
              )}
            </p>
            <div className="grid grid-cols-1 gap-gutter-lg sm:grid-cols-2 xl:grid-cols-3">
              {placesWithDistance.map(({ place: nearby, distanceKm }) => (
                <div key={nearby.id} className="flex flex-col gap-1">
                  <span className="type-label-sm text-secondary font-medium">
                    {t('map.straightLineFromStop', '{{dist}} straight-line', {
                      dist: formatStraightLineDistance(distanceKm),
                    })}
                  </span>
                  <PlaceCard place={nearby} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
