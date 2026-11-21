import { useTranslation } from 'react-i18next';
import type { Place } from '../../types';
import { getAreaLabelKey } from '../../lib/catalog';
import { Badge } from '../ui/Badge';
import { MapPinIcon } from '../ui/icons';

export interface MapPreviewProps {
  place: Pick<Place, 'name' | 'area' | 'location'>;
}

export function MapPreview({ place }: MapPreviewProps) {
  const { t } = useTranslation();

  return (
    <div className="relative isolate min-h-80 overflow-hidden rounded-card border border-hairline bg-surface-container">
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(119,89,40,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(119,89,40,0.09)_1px,transparent_1px)] bg-[size:2rem_2rem]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_28%_30%,rgba(217,199,163,0.42),transparent_42%),radial-gradient(circle_at_76%_72%,rgba(176,141,87,0.2),transparent_38%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface-container/70 to-transparent"
        aria-hidden="true"
      />

      <div className="absolute inset-0 flex items-center justify-center p-space-lg">
        <div className="max-w-sm rounded-card border border-hairline-strong bg-surface-container-lowest/90 p-space-lg text-center shadow-floating backdrop-blur-md">
          <span
            className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-secondary-fixed/50 text-secondary"
            aria-hidden="true"
          >
            <MapPinIcon className="size-5" />
          </span>
          <p className="type-label mt-space-sm text-secondary">{t('placeDetails.map.mapLabel')}</p>
          <p className="type-title-sm mt-space-xs text-primary">{place.name.en}</p>
          <p className="type-small mt-space-xs text-on-surface-variant">
            {t(getAreaLabelKey(place.area))}
          </p>
          <p className="type-small mt-space-sm text-on-surface-variant">
            {place.location ? t('placeDetails.map.available') : t('placeDetails.map.missing')}
          </p>
          <Badge tone={place.location ? 'success' : 'outline'} size="sm" className="mt-space-sm">
            {t('placeDetails.map.phase')}
          </Badge>
        </div>
      </div>
    </div>
  );
}
