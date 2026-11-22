import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Place } from '../../types';
import { getAreaLabelKey } from '../../lib/catalog';
import { LuxuryTileLayer } from './LuxuryTileLayer';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MapPinIcon } from '../ui/icons';
import '../../styles/map.css';

export interface DestinationMapProps {
  place: Pick<Place, 'name' | 'area' | 'location'>;
}

export function DestinationMap({ place }: DestinationMapProps) {
  const { t } = useTranslation();
  const [isMobileActive, setIsMobileActive] = useState(false);

  const markerIcon = useMemo(() => {
    const html = `
      <div class="luxury-marker-container">
        <div class="luxury-destination-marker">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      </div>
    `;

    return L.divIcon({
      className: 'destination-marker-icon',
      html,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
      popupAnchor: [0, -22],
    });
  }, []);

  if (!place.location) {
    return (
      <div className="relative isolate min-h-80 overflow-hidden rounded-card border border-hairline bg-surface-container flex items-center justify-center p-space-lg text-center">
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
            {t('placeDetails.map.missing')}
          </p>
          <Badge tone="outline" size="sm" className="mt-space-sm">
            {t('map.noCoordinates', 'No map location')}
          </Badge>
        </div>
      </div>
    );
  }

  const coords: [number, number] = [place.location.lat, place.location.lng];

  return (
    <div className="relative isolate h-96 overflow-hidden rounded-card border border-hairline bg-surface-container shadow-resting">
      {/* Mobile Overlay */}
      {!isMobileActive ? (
        <div
          className="absolute inset-0 z-[500] flex flex-col items-center justify-center bg-surface/40 backdrop-blur-[2px] p-space-md text-center lg:hidden"
          onClick={() => setIsMobileActive(true)}
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsMobileActive(true)}
            aria-label={t('map.activateMobile', 'Tap to explore interactive map')}
          >
            <MapPinIcon className="size-4 me-2 text-secondary" />
            {t('map.activateMobile', 'Tap to explore interactive map')}
          </Button>
          <p className="type-small mt-space-xs text-on-surface-variant">
            {t('map.touchScrollHint', 'Scroll past or tap to interact')}
          </p>
        </div>
      ) : null}

      <MapContainer
        center={coords}
        zoom={15}
        scrollWheelZoom={false}
        dragging={isMobileActive || window.innerWidth >= 1024}
        className="h-full w-full"
      >
        <LuxuryTileLayer />
        <Marker position={coords} icon={markerIcon}>
          <Popup>
            <div className="flex flex-col gap-1 text-start">
              <span className="type-label-sm text-secondary font-semibold">
                {t(getAreaLabelKey(place.area))}
              </span>
              <p className="type-title-sm text-primary font-bold m-0">{place.name.en}</p>
              <p className="type-small text-on-surface-variant m-0">
                {t('map.entranceLocation', 'Verified visitor entrance')}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
