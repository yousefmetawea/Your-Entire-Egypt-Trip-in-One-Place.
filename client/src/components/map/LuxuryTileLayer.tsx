import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TileLayer, useMap } from 'react-leaflet';
import { getActiveTileConfig } from '../../lib/map/tileProvider';
import { Button } from '../ui/Button';

export interface LuxuryTileLayerProps {
  onTileError?: () => void;
}

/**
 * Tile layer wrapped with Luxury CSS filter and tile-load error handling with Retry.
 */
export function LuxuryTileLayer({ onTileError }: LuxuryTileLayerProps) {
  const { t } = useTranslation();
  const map = useMap();
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const config = getActiveTileConfig();

  useEffect(() => {
    // If map container is resized, Leaflet needs invalidateSize
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);

  const handleRetry = () => {
    setHasError(false);
    setRetryKey((prev) => prev + 1);
  };

  return (
    <>
      <TileLayer
        key={retryKey}
        url={config.url}
        attribution={config.attribution}
        maxZoom={config.maxZoom}
        subdomains={config.subdomains || 'abc'}
        className="luxury-tile-layer"
        eventHandlers={{
          tileerror: () => {
            setHasError(true);
            onTileError?.();
          },
        }}
      />
      {hasError ? (
        <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-surface-container/85 p-space-md text-center backdrop-blur-sm">
          <p className="type-title-sm text-primary">
            {t('map.tileErrorTitle', 'Map tiles unavailable')}
          </p>
          <p className="type-small mt-space-xs text-on-surface-variant">
            {t(
              'map.tileErrorDesc',
              'We could not load the map tiles. You can retry loading or continue viewing the schedule.',
            )}
          </p>
          <Button variant="secondary" size="sm" className="mt-space-sm" onClick={handleRetry}>
            {t('common.retry', 'Retry')}
          </Button>
        </div>
      ) : null}
    </>
  );
}
