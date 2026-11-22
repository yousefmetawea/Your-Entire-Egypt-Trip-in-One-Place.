import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer } from 'react-leaflet';
import type { Place, PlaceId, TripDay } from '../../types';
import { countUnmappedActivities, extractMappedStops } from '../../lib/map/markers';
import { LuxuryTileLayer } from './LuxuryTileLayer';
import { MapBoundsFitter } from './MapBoundsFitter';
import { RoutePolyline } from './RoutePolyline';
import { StopMarkers } from './StopMarkers';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { InfoIcon, MapPinIcon } from '../ui/icons';
import '../../styles/map.css';

export interface ItineraryMapProps {
  day: TripDay;
  dayNumber: number;
  placesById: ReadonlyMap<PlaceId, Place>;
  selectedStopId?: string | null;
  hoveredStopId?: string | null;
  onSelectStop?: (stopId: string) => void;
  onHoverStop?: (stopId: string | null) => void;
}

export function ItineraryMap({
  day,
  dayNumber,
  placesById,
  selectedStopId: externalSelectedId,
  hoveredStopId: externalHoveredId,
  onSelectStop: externalOnSelect,
  onHoverStop: externalOnHover,
}: ItineraryMapProps) {
  const { t } = useTranslation();
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const [internalHoveredId, setInternalHoveredId] = useState<string | null>(null);
  const [isMobileMapActive, setIsMobileMapActive] = useState(false);

  const selectedStopId = externalSelectedId !== undefined ? externalSelectedId : internalSelectedId;
  const hoveredStopId = externalHoveredId !== undefined ? externalHoveredId : internalHoveredId;

  const handleSelect = (id: string) => {
    if (externalOnSelect) {
      externalOnSelect(id);
    } else {
      setInternalSelectedId(id);
    }
  };

  const handleHover = (id: string | null) => {
    if (externalOnHover) {
      externalOnHover(id);
    } else {
      setInternalHoveredId(id);
    }
  };

  const mappedStops = useMemo(() => extractMappedStops(day, placesById), [day, placesById]);

  const unmappedCount = useMemo(() => countUnmappedActivities(day, placesById), [day, placesById]);

  const selectedStop = useMemo(
    () => mappedStops.find((s) => s.activityId === selectedStopId) || null,
    [mappedStops, selectedStopId],
  );

  return (
    <Card
      variant="surface"
      padding="none"
      className="relative flex flex-col overflow-hidden rounded-2xl border border-hairline shadow-resting"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-hairline bg-surface-container-low px-space-md py-space-sm">
        <div className="flex items-center gap-space-xs">
          <MapPinIcon className="size-4 text-secondary" />
          <h3 className="type-title-sm text-primary">
            {t('trip.builder.map.title', { day: dayNumber })}
          </h3>
          <Badge tone="neutral" size="sm">
            {t('map.stopsCount', '{{count}} mapped stops', { count: mappedStops.length })}
          </Badge>
        </div>
        {unmappedCount > 0 ? (
          <span
            className="type-label-sm text-on-surface-variant"
            title={t('map.unmappedHint', 'Activities without coordinates')}
          >
            {t('map.unmappedNotice', '{{count}} without map location', { count: unmappedCount })}
          </span>
        ) : null}
      </div>

      {/* Map Container Area */}
      <div className="relative h-[420px] w-full bg-surface-container-low">
        {mappedStops.length > 0 ? (
          <>
            {/* Mobile Tap-To-Activate Overlay */}
            {!isMobileMapActive ? (
              <div
                className="absolute inset-0 z-[500] flex flex-col items-center justify-center bg-surface/40 backdrop-blur-[2px] p-space-md text-center lg:hidden"
                onClick={() => setIsMobileMapActive(true)}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsMobileMapActive(true)}
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
              center={[30.0444, 31.2357]}
              zoom={12}
              scrollWheelZoom={false}
              dragging={isMobileMapActive || window.innerWidth >= 1024}
              className="h-full w-full"
            >
              <LuxuryTileLayer />
              <MapBoundsFitter stops={mappedStops} />
              <RoutePolyline stops={mappedStops} />
              <StopMarkers
                stops={mappedStops}
                selectedStopId={selectedStopId}
                hoveredStopId={hoveredStopId}
                onSelectStop={handleSelect}
                onHoverStop={handleHover}
              />
            </MapContainer>

            {/* Static Bottom Sheet on Mobile / Stop Details Callout */}
            {selectedStop ? (
              <div className="absolute inset-x-0 bottom-0 z-[600] border-t border-hairline bg-surface-container-lowest/95 p-space-sm shadow-floating backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 pr-space-sm">
                    <span className="type-label-sm text-secondary">
                      {t('map.stopNumber', { order: selectedStop.order })} · {selectedStop.category}
                    </span>
                    <p className="type-title-sm truncate font-bold text-primary">
                      {selectedStop.title}
                    </p>
                    {selectedStop.startTime ? (
                      <span className="type-small text-on-surface-variant">
                        {t('map.startsAt', 'Starts at {{time}}', { time: selectedStop.startTime })}
                      </span>
                    ) : null}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelect('')}
                    aria-label={t('common.close', 'Close')}
                  >
                    ×
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-space-lg text-center">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-secondary-fixed/40 text-secondary">
              <InfoIcon className="size-6" />
            </span>
            <p className="type-title-sm mt-space-sm text-primary">
              {t('map.noMappedStopsTitle', 'No mapped stops for Day {{day}}', { day: dayNumber })}
            </p>
            <p className="type-small mt-space-xs max-w-xs text-on-surface-variant">
              {day.activities.length === 0
                ? t('trip.builder.map.empty', 'Add activities to preview their order.')
                : t(
                    'map.allUnmappedDesc',
                    'Activities scheduled on this day do not have verified geographic coordinates.',
                  )}
            </p>
          </div>
        )}
      </div>

      {/* Footer Honest Notes */}
      <div className="flex flex-col gap-1 border-t border-hairline bg-surface-container-lowest px-space-md py-space-sm">
        <p className="type-small text-on-surface-variant">
          {t(
            'map.straightLineDisclaimer',
            'Dashed connectors show itinerary order only. Distance and transit times are straight-line estimates or omitted.',
          )}
        </p>
      </div>
    </Card>
  );
}
