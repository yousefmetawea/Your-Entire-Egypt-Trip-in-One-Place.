import { useMemo } from 'react';
import { MapContainer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Accommodation } from '../../types';
import { LuxuryTileLayer } from '../map/LuxuryTileLayer';
import { Button } from '../ui/Button';
import '../../styles/map.css';

export interface AccommodationMapProps {
  accommodations: Accommodation[];
  selectedId: string | null;
  onSelectAccommodation?: (id: string) => void;
  onSetAsStay?: (id: string) => void;
}

export function AccommodationMap({
  accommodations,
  selectedId,
  onSelectAccommodation,
  onSetAsStay,
}: AccommodationMapProps) {
  const mapped = useMemo(() => accommodations.filter((a) => a.location !== null), [accommodations]);

  const markerIcon = useMemo(() => {
    const html = `
      <div class="luxury-marker-container">
        <div class="luxury-marker-pin" style="background-color: var(--color-surface-container-lowest); border-color: var(--color-secondary);">
          <span style="font-size: 14px;">🛏️</span>
        </div>
      </div>
    `;

    return L.divIcon({
      className: 'accommodation-map-marker',
      html,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18],
    });
  }, []);

  if (mapped.length === 0) {
    return null;
  }

  return (
    <div className="relative h-80 w-full overflow-hidden rounded-2xl border border-hairline shadow-resting mb-space-lg">
      <MapContainer
        center={[30.0444, 31.2357]}
        zoom={12}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <LuxuryTileLayer />
        {mapped.map((acc) => (
          <Marker
            key={acc.id}
            position={[acc.location!.lat, acc.location!.lng]}
            icon={markerIcon}
            eventHandlers={{
              click: () => onSelectAccommodation?.(acc.id),
            }}
          >
            <Popup>
              <div className="flex flex-col gap-1 text-start">
                <span className="type-label-sm text-secondary font-semibold uppercase">
                  {acc.type}
                </span>
                <p className="type-title-sm text-primary font-bold m-0">{acc.name.en}</p>
                {acc.priceRange ? (
                  <p className="type-small text-on-surface-variant m-0">
                    From {acc.priceRange.min} {acc.priceRange.currency}/night
                  </p>
                ) : (
                  <p className="type-small text-on-surface-variant m-0 italic">Price not listed</p>
                )}
                {onSetAsStay ? (
                  <div className="mt-2 pt-2 border-t border-hairline">
                    <Button
                      variant={selectedId === acc.id ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => onSetAsStay(acc.id)}
                      disabled={selectedId === acc.id}
                    >
                      {selectedId === acc.id ? '✓ Selected Stay' : 'Set as my stay'}
                    </Button>
                  </div>
                ) : null}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
