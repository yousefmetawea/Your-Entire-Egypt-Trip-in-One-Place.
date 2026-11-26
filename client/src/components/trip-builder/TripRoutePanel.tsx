import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Place, PlaceId, Trip } from '../../types';
import { project, ROUTE_CITIES, type RouteCityId } from '../../lib/planner/routeMap';
import { EgyptRouteMap } from '../planner/stage/EgyptRouteMap';
import { ObeliskPanel } from '../planner/stage/ObeliskPanel';

/** The route map for this trip: each stop snaps to the nearest route city. Cairo is always the hub. */
function getTripCityIds(trip: Trip, placesById: ReadonlyMap<PlaceId, Place>): RouteCityId[] {
  const ids = new Set<RouteCityId>(['cairo']);
  for (const day of trip.days) {
    for (const activity of day.activities) {
      if (activity.source.type !== 'place') continue;
      const location = placesById.get(activity.source.placeId)?.location;
      if (!location) continue;
      const at = project(location.lat, location.lng);
      let best: RouteCityId = 'cairo';
      let bestDistance = Infinity;
      for (const city of ROUTE_CITIES) {
        const point = project(city.lat, city.lon);
        const distance = Math.hypot(point.x - at.x, point.y - at.y);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = city.id;
        }
      }
      ids.add(best);
    }
  }
  return [...ids];
}

export function TripRoutePanel({
  trip,
  placesById,
  dayIndex,
}: {
  trip: Trip;
  placesById: ReadonlyMap<PlaceId, Place>;
  dayIndex: number;
}) {
  const { t, i18n } = useTranslation();
  const reduce = useReducedMotion();
  const cityIds = useMemo(() => getTripCityIds(trip, placesById), [trip, placesById]);
  const arrow = i18n.dir() === 'rtl' ? ' ← ' : ' → ';
  const names = ROUTE_CITIES.filter((city) => cityIds.includes(city.id)).map((city) =>
    t(`planner.stage.cities.${city.id}`),
  );

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl border border-[#B6CE67]/20 bg-[#183a2a]/70 p-4 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-md sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="type-label-sm tracking-[0.2em] text-[#B6CE67]">
          {t('trip.builder.routePanel.title')}
        </p>
        <p className="type-small text-[#b4c6ba]">
          {t('trip.builder.routePanel.count', { count: names.length })}
        </p>
      </div>
      <div className="relative mt-3">
        <EgyptRouteMap cityIds={cityIds} className="block max-h-[300px] w-full" />
        <ObeliskPanel
          stepIndex={dayIndex}
          className="pointer-events-none absolute bottom-[1%] left-[1%] h-[40%] w-[19%]"
        />
      </div>
      <p className="mt-3 border-t border-white/10 pt-3 font-display text-base leading-snug text-[#eef3e8]">
        {names.join(arrow)}
      </p>
    </motion.div>
  );
}
