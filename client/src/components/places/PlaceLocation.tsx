import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { Place } from '../../types';
import { Card } from '../ui/Card';
import { MapPreview } from './MapPreview';
import { PlaceSectionHeading } from './PlaceSectionHeading';

export interface PlaceLocationProps {
  place: Place;
}

export function PlaceLocation({ place }: PlaceLocationProps) {
  const { t } = useTranslation();
  const headingId = useId();

  return (
    <Card
      as="section"
      variant="surface"
      padding="none"
      aria-labelledby={headingId}
      className="p-space-xl md:p-space-2xl"
    >
      <PlaceSectionHeading
        eyebrow={t('placeDetails.map.eyebrow')}
        title={t('placeDetails.map.title')}
        id={headingId}
      />
      <div className="mt-space-lg">
        <MapPreview place={place} />
      </div>
    </Card>
  );
}
