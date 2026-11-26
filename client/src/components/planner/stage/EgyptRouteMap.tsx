import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { PlaceCategory } from '../../../types';
import {
  getRouteCities,
  LAND_DOTS,
  MAP_HEIGHT,
  MAP_WIDTH,
  NILE,
  orderRoute,
  project,
  ROUTE_CITIES,
  type RouteCity,
  type RouteCityId,
} from '../../../lib/planner/routeMap';

interface EgyptRouteMapProps {
  interests?: readonly PlaceCategory[];
  /** Light up exactly these cities instead of deriving them from interests. */
  cityIds?: readonly RouteCityId[];
  className?: string;
}

function curve(a: RouteCity, b: RouteCity): string {
  const p = project(a.lat, a.lon);
  const q = project(b.lat, b.lon);
  const mx = (p.x + q.x) / 2;
  const my = (p.y + q.y) / 2;
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const bend = 0.16;
  return `M${p.x.toFixed(1)} ${p.y.toFixed(1)} Q${(mx - dy * bend).toFixed(1)} ${(my + dx * bend).toFixed(1)} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
}

const NILE_PATH = NILE.map(([lat, lon], i) => {
  const { x, y } = project(lat, lon);
  return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
}).join(' ');

/** Lightweight dot-matrix map of Egypt. Cities light up and the route draws as choices are made. */
export function EgyptRouteMap({ interests, cityIds, className }: EgyptRouteMapProps) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const lit = useMemo(
    () =>
      orderRoute(
        cityIds
          ? ROUTE_CITIES.filter((city) => cityIds.includes(city.id))
          : getRouteCities(interests ?? []),
      ),
    [interests, cityIds],
  );
  const litIds = useMemo(() => new Set(lit.map((city) => city.id)), [lit]);
  const names = lit.map((city) => t(`planner.stage.cities.${city.id}`));

  const dots = useMemo(() => {
    const points = lit.map((city) => project(city.lat, city.lon));
    return LAND_DOTS.map((dot) => {
      let nearest = Infinity;
      for (const p of points) nearest = Math.min(nearest, Math.hypot(dot.x - p.x, dot.y - p.y));
      return { ...dot, glow: nearest < 70 ? 1 - nearest / 70 : 0 };
    });
  }, [lit]);

  return (
    <svg
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      role="img"
      aria-label={t('planner.stage.mapLabel', { route: names.join(', ') })}
      className={className}
      style={{ direction: 'ltr' }}
    >
      <g>
        {dots.map((dot, index) => (
          <circle
            key={index}
            cx={dot.x}
            cy={dot.y}
            r={dot.glow > 0 ? 2.2 + dot.glow * 1.2 : 2}
            className="route-dot"
            data-lit={dot.glow > 0 ? '' : undefined}
            style={{ opacity: dot.glow > 0 ? 0.35 + dot.glow * 0.65 : 0.3 }}
          />
        ))}
      </g>

      <motion.path
        d={NILE_PATH}
        fill="none"
        className="route-nile"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.6, ease: [0.16, 1, 0.3, 1] }}
      />

      <g className="route-lines">
        {lit.slice(1).map((city, index) => (
          <motion.path
            key={`${lit[index].id}-${city.id}`}
            d={curve(lit[index], city)}
            fill="none"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray="1 7"
            className="route-line"
            initial={reduce ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.1, delay: index * 0.18, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </g>

      {ROUTE_CITIES.map((city) => {
        const { x, y } = project(city.lat, city.lon);
        const on = litIds.has(city.id);
        return (
          <g key={city.id} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
            {on && !reduce ? (
              <motion.circle
                r={5}
                className="route-ping"
                initial={{ r: 5, opacity: 0.7 }}
                animate={{ r: 24, opacity: 0 }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
              />
            ) : null}
            <circle r={on ? 6 : 3.5} className={on ? 'route-node route-node-on' : 'route-node'} />
            {on ? (
              <text
                x={city.label.dx}
                y={city.label.dy}
                textAnchor={city.label.anchor}
                className="route-label"
              >
                {t(`planner.stage.cities.${city.id}`)}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
