import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { MappedStop } from '../../lib/map/markers';

export interface MapBoundsFitterProps {
  stops: MappedStop[];
  fallbackCenter?: [number, number];
  fallbackZoom?: number;
}

/**
 * Fits map viewport bounds automatically to mapped stops with smooth padding.
 */
export function MapBoundsFitter({
  stops,
  fallbackCenter = [30.0444, 31.2357], // Cairo center
  fallbackZoom = 12,
}: MapBoundsFitterProps) {
  const map = useMap();

  useEffect(() => {
    if (stops.length === 0) {
      map.setView(fallbackCenter, fallbackZoom);
      return;
    }

    if (stops.length === 1) {
      map.setView([stops[0].lat, stops[0].lng], 15);
      return;
    }

    const bounds = L.latLngBounds(stops.map((s) => [s.lat, s.lng]));
    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 16,
      animate: true,
    });
  }, [map, stops, fallbackCenter, fallbackZoom]);

  return null;
}
