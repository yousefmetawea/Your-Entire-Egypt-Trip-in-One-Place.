import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import type { Place } from '../types';
import { getAreaLabelKey } from '../lib/catalog';
import { useDraftTripPlace } from '../hooks/useDraftTripPlace';
import { usePageMeta } from '../hooks/usePageMeta';
import { usePlace } from '../hooks/usePlace';
import { getPlaceGalleryImages } from '../lib/placeImages';
import { Container } from '../components/ui/Container';
import { Section } from '../components/ui/Section';
import { MobileActionBar } from '../components/places/MobileActionBar';
import { NearbyPlaces } from '../components/places/NearbyPlaces';
import { PlaceDetailsSkeleton } from '../components/places/PlaceDetailsSkeleton';
import { PlaceDetailsStates } from '../components/places/PlaceDetailsStates';
import { PlaceGallery } from '../components/places/PlaceGallery';
import { PlaceHero } from '../components/places/PlaceHero';
import { PlaceInfoCard } from '../components/places/PlaceInfoCard';
import { PlaceLocation } from '../components/places/PlaceLocation';
import { PlaceNarrative } from '../components/places/PlaceNarrative';
import { PlaceTips } from '../components/places/PlaceTips';
import '../components/places/place.css';

interface PlaceDetailsContentProps {
  place: Place;
  isFixture: boolean;
}

function PlaceDetailsContent({ place, isFixture }: PlaceDetailsContentProps) {
  const draft = useDraftTripPlace(place);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const gallery = { ...place, images: getPlaceGalleryImages(place, place.images).slice(1) };

  return (
    <div className="yt-place">
      <PlaceHero place={place} isFixture={isFixture} />
      <Section tone="canvas" spacing="none" className="!bg-transparent pb-28 md:pb-space-2xl">
        <Container className="pt-space-xl">
          {gallery.images.length > 0 ? <PlaceGallery place={gallery} /> : null}

          <div className="mt-space-xl grid grid-cols-1 gap-gutter-lg lg:grid-cols-12">
            <div className="space-y-gutter-lg lg:order-2 lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                <PlaceInfoCard place={place} draft={draft} />
              </div>
            </div>

            <div className="space-y-gutter-lg lg:order-1 lg:col-span-8">
              <PlaceNarrative place={place} />
              <PlaceLocation place={place} />
              <PlaceTips tips={place.tips} />
            </div>
          </div>

          <div className="mt-space-2xl">
            <NearbyPlaces place={place} />
          </div>
        </Container>
      </Section>

      <div ref={sentinelRef} aria-hidden="true" className="h-px" />
      <MobileActionBar draft={draft} sentinelRef={sentinelRef} />
    </div>
  );
}

export default function PlaceDetailsPage() {
  const { t } = useTranslation();
  const { slug = '' } = useParams<{ slug: string }>();
  const { place, status, isFixture, retry } = usePlace(slug);

  const metaTitle = place
    ? t('placeDetails.meta.title', { name: place.name.en })
    : status === 'not-found'
      ? t('placeDetails.meta.notFoundTitle')
      : status === 'error'
        ? t('placeDetails.meta.errorTitle')
        : null;
  const metaDescription = place
    ? t('placeDetails.meta.description', {
        name: place.name.en,
        area: t(getAreaLabelKey(place.area)),
      })
    : null;

  usePageMeta(metaTitle, metaDescription);

  if (status === 'loading') {
    return <PlaceDetailsSkeleton />;
  }

  if (status === 'error') {
    return <PlaceDetailsStates status="error" onRetry={retry} />;
  }

  if (status === 'not-found' || !place) {
    return <PlaceDetailsStates status="not-found" />;
  }

  return <PlaceDetailsContent place={place} isFixture={isFixture} />;
}
