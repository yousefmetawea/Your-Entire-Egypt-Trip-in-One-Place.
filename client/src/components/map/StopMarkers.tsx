import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { MappedStop } from '../../lib/map/markers';
import { AppLink } from '../../app/AppLink';

export interface StopMarkersProps {
  stops: MappedStop[];
  selectedStopId: string | null;
  hoveredStopId: string | null;
  onSelectStop: (stopId: string) => void;
  onHoverStop?: (stopId: string | null) => void;
}

export function StopMarkers({
  stops,
  selectedStopId,
  hoveredStopId,
  onSelectStop,
  onHoverStop,
}: StopMarkersProps) {
  const { t } = useTranslation();
  const showAllLabels = stops.length <= 4;

  const markersWithIcons = useMemo(() => {
    return stops.map((stop) => {
      const isSelected = selectedStopId === stop.activityId;
      const isHovered = hoveredStopId === stop.activityId;
      const shouldShowLabel = showAllLabels || isSelected || isHovered;

      const containerClass = [
        'luxury-marker-container',
        isSelected ? 'is-selected' : '',
        isHovered ? 'is-hovered' : '',
      ]
        .filter(Boolean)
        .join(' ');

      const html = `
        <div class="${containerClass}">
          <div class="luxury-marker-pin">
            <span class="luxury-marker-order">${stop.order}</span>
            <span class="luxury-marker-category" title="${stop.category}">${stop.categoryGlyph}</span>
          </div>
          ${shouldShowLabel ? `<div class="luxury-marker-label">${escapeHtml(stop.title)}</div>` : ''}
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-div-icon',
        html,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -20],
      });

      return { stop, icon, isSelected };
    });
  }, [stops, selectedStopId, hoveredStopId, showAllLabels]);

  return (
    <>
      {markersWithIcons.map(({ stop, icon }) => (
        <Marker
          key={stop.activityId}
          position={[stop.lat, stop.lng]}
          icon={icon}
          eventHandlers={{
            click: () => onSelectStop(stop.activityId),
            mouseover: () => onHoverStop?.(stop.activityId),
            mouseout: () => onHoverStop?.(null),
          }}
        >
          <Popup>
            <div className="flex flex-col gap-1 text-start">
              <span className="type-label-sm text-secondary font-semibold">
                {t('map.stopNumber', { order: stop.order })} · {stop.category}
              </span>
              <p className="type-title-sm text-primary font-bold m-0">{stop.title}</p>
              {stop.startTime ? (
                <p className="type-small text-on-surface-variant m-0">
                  {t('map.startsAt', 'Starts at {{time}}', { time: stop.startTime })}
                </p>
              ) : null}
              {stop.durationMin ? (
                <p className="type-small text-on-surface-variant m-0">
                  {t('map.duration', '~{{count}} min', { count: stop.durationMin })}
                </p>
              ) : null}
              {stop.placeSlug ? (
                <div className="mt-2 pt-2 border-t border-hairline">
                  <AppLink
                    href={`/places/${stop.placeSlug}`}
                    className="type-label-sm text-secondary hover:underline inline-block"
                  >
                    {t('map.viewPlaceDetails', 'View place details →')}
                  </AppLink>
                </div>
              ) : null}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
