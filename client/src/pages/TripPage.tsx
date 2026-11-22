import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { usePageMeta } from '../hooks/usePageMeta';
import { useTrip } from '../hooks/useTrip';
import { ItineraryBuilder } from '../components/trip-builder/ItineraryBuilder';
import { TripSkeleton } from '../components/trips/TripSkeleton';
import { TripStates } from '../components/trips/TripStates';

export default function TripPage() {
  const { t } = useTranslation();
  const { id = '' } = useParams<{ id: string }>();
  const { trip, places, status, retry } = useTrip(id);

  const metaTitle = trip
    ? t('trip.meta.title', { title: trip.title })
    : status === 'not-found'
      ? t('trip.states.notFoundTitle')
      : status === 'error'
        ? t('trip.states.errorTitle')
        : null;
  const metaDescription = trip ? t('trip.meta.description', { title: trip.title }) : null;

  usePageMeta(metaTitle, metaDescription);

  if (status === 'loading') {
    return <TripSkeleton />;
  }

  if (status === 'error') {
    return <TripStates status="error" onRetry={retry} />;
  }

  if (status === 'not-found' || !trip) {
    return <TripStates status="not-found" />;
  }

  return <ItineraryBuilder key={trip.id} trip={trip} places={places} />;
}
