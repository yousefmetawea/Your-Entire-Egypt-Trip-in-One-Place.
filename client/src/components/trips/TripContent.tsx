import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Place, PlaceId, Trip } from '../../types';
import { AppLink } from '../../app/AppLink';
import { EmptyState } from '../common/EmptyState';
import { ButtonLink } from '../ui/Button';
import { Container } from '../ui/Container';
import { Section } from '../ui/Section';
import { RouteIcon } from '../ui/icons';
import { TripDaySection } from './TripDaySection';
import { TripHeader } from './TripHeader';
import { TripSummaryCard } from './TripSummaryCard';

export interface TripContentProps {
  trip: Trip;
  places: Place[];
}

export function TripContent({ trip, places }: TripContentProps) {
  const { t } = useTranslation();
  const placesById = useMemo(
    () => new Map<PlaceId, Place>(places.map((place) => [place.id, place])),
    [places],
  );
  const activities = trip.days.flatMap((day) => day.activities);
  const placeIds = new Set(
    activities.flatMap((activity) =>
      activity.source.type === 'place' ? [activity.source.placeId] : [],
    ),
  );
  const emptyDayCount = trip.days.filter((day) => day.activities.length === 0).length;
  const hasMissingDetails =
    emptyDayCount > 0 ||
    activities.some(
      (activity) =>
        activity.durationMin === null ||
        activity.travelMin === null ||
        activity.estimatedCost === null ||
        (activity.source.type === 'place' && !placesById.has(activity.source.placeId)),
    );

  return (
    <Section
      tone="canvas"
      spacing="none"
      className="min-h-screen py-space-2xl"
      aria-labelledby="trip-heading"
    >
      <Container>
        <TripHeader trip={trip} />

        <div className="mt-space-xl grid grid-cols-1 items-start gap-gutter-lg lg:grid-cols-12">
          <div className="space-y-gutter-lg lg:col-span-8">
            {trip.days.length > 0 ? (
              trip.days.map((day, index) => (
                <TripDaySection
                  key={day.id}
                  day={day}
                  dayNumber={index + 1}
                  placesById={placesById}
                />
              ))
            ) : (
              <EmptyState
                title={t('trip.days.noDaysTitle')}
                description={t('trip.days.noDaysDescription')}
                actions={
                  <ButtonLink
                    as={AppLink}
                    href="/plan"
                    variant="primary"
                    size="md"
                    startIcon={<RouteIcon />}
                  >
                    {t('trip.states.backToPlanner')}
                  </ButtonLink>
                }
              />
            )}
          </div>

          <div className="lg:sticky lg:top-24 lg:col-span-4">
            <TripSummaryCard
              trip={trip}
              activityCount={activities.length}
              placeCount={placeIds.size}
              emptyDayCount={emptyDayCount}
              hasMissingDetails={hasMissingDetails}
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
