import { useMemo } from 'react';
import { Polyline } from 'react-leaflet';
import type { MappedStop } from '../../lib/map/markers';

export interface RoutePolylineProps {
  stops: MappedStop[];
}

/**
 * Renders dashed luxury route connector polyline between stops in order.
 * No speed/duration/traffic is claimed; purely straight segments connecting consecutive stops.
 */
export function RoutePolyline({ stops }: RoutePolylineProps) {
  const positions = useMemo(() => {
    return stops.map((s) => [s.lat, s.lng] as [number, number]);
  }, [stops]);

  if (positions.length < 2) {
    return null;
  }

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: '#b08d57', // Accent bronze token
        weight: 3,
        opacity: 0.8,
        dashArray: '6, 8', // Dashed line indicating itinerary stop connection
        lineCap: 'round',
        lineJoin: 'round',
      }}
    />
  );
}
