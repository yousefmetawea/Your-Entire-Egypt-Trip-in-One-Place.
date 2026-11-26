import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useInView, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LuxuryTileLayer } from '../map/LuxuryTileLayer';
import { buildRoute } from './route-data';
import type { RouteLeg, RouteMode, RouteCity } from './route-data';
import '../../styles/map.css';
import '../../styles/stay-map.css';

const COLOR: Record<RouteMode, string> = { flight: '#B6CE67', train: '#6db3ff', bus: '#5fd4a0' };

const ICON_PATH: Record<RouteMode, string> = {
  flight:
    'M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z',
  train:
    'M12 2c-4 0-8 .5-8 4v9.5C4 17.4 5.6 19 7.5 19L6 20.5V21h2l2-2h4l2 2h2v-.5L16.5 19c1.9 0 3.5-1.6 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM11 11H6V6h5v5zm5.5 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM18 11h-5V6h5v5z',
  bus: 'M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM18 11H6V6h12v5z',
};

function ModeIcon({ mode, className = 'size-4' }: { mode: RouteMode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d={ICON_PATH[mode]} />
    </svg>
  );
}

const COPY = {
  en: {
    eyebrow: 'Route',
    title: 'Your Egypt, leg by leg.',
    play: 'Play route',
    stop: 'Stop',
    km: 'km',
    modes: { flight: 'Flight', train: 'Train', bus: 'Coach' },
    notes: {
      flight: 'Domestic flight, the fastest way south',
      train: 'Rail along the Nile',
      bus: 'Coach or road transfer',
    },
    yourStay: 'Your stay',
    close: 'Close',
    legend: 'Estimated distance and time',
  },
  ar: {
    eyebrow: 'المسار',
    title: 'مصر خطوة بخطوة.',
    play: 'شغّل المسار',
    stop: 'إيقاف',
    km: 'كم',
    modes: { flight: 'طيران', train: 'قطار', bus: 'أتوبيس' },
    notes: {
      flight: 'رحلة داخلية، أسرع طريق للجنوب',
      train: 'قطار على طول النيل',
      bus: 'أتوبيس أو نقل بالطريق',
    },
    yourStay: 'إقامتك',
    close: 'إغلاق',
    legend: 'مسافة ووقت تقديريان',
  },
} as const;

function fmtTime(min: number, isAr: boolean) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (isAr) return `${h ? `${h} س ` : ''}${m ? `${m} د` : ''}`.trim();
  return `${h ? `${h}h ` : ''}${m ? `${m}m` : ''}`.trim();
}

interface LayerProps {
  cities: RouteCity[];
  legs: RouteLeg[];
  stayCityId: string | null;
  active: number | null;
  hover: number | null;
  go: boolean;
  reduce: boolean;
  isAr: boolean;
  yourStay: string;
  onSelect: (i: number) => void;
  onHover: (i: number | null) => void;
}

const DRAW_MS = 1200;
const LOOP_MS = 3200;

function RouteLayer(props: LayerProps) {
  const map = useMap();
  const propsRef = useRef(props);
  useEffect(() => {
    propsRef.current = props;
  });
  const linesRef = useRef<{ line: L.Polyline; glow: L.Polyline }[]>([]);
  const { legs, cities, stayCityId, reduce, go, isAr } = props;

  // Build layers once per route, animate the draw when the map is first seen.
  useEffect(() => {
    const group = L.layerGroup().addTo(map);
    const lines = legs.map((leg) => {
      const color = COLOR[leg.mode];
      const glow = L.polyline([], {
        color,
        weight: 10,
        opacity: 0.16,
        lineCap: 'round',
        interactive: false,
      });
      const line = L.polyline([], {
        color,
        weight: 3,
        opacity: 0.95,
        lineCap: 'round',
        dashArray: leg.mode === 'flight' ? '1 9' : undefined,
        interactive: false,
      });
      const hit = L.polyline(leg.points, {
        color: '#000',
        weight: 22,
        opacity: 0,
        className: 'route-hit',
      });
      hit.on('click', () => propsRef.current.onSelect(leg.index));
      hit.on('mouseover', () => propsRef.current.onHover(leg.index));
      hit.on('mouseout', () => propsRef.current.onHover(null));
      glow.addTo(group);
      line.addTo(group);
      hit.addTo(group);
      return { line, glow };
    });
    linesRef.current = lines;

    cities.forEach((c) => {
      const isStay = c.id === stayCityId;
      const label = c.name[isAr ? 'ar' : 'en'];
      const icon = L.divIcon({
        className: 'route-city-marker',
        html: `<div class="route-pin${isStay ? ' is-stay' : ''}"><span class="stay-pin-pulse"></span><span class="route-pin-core"></span><span class="route-city-label${isStay ? ' is-stay' : ''}">${label}${isStay ? ` · ${propsRef.current.yourStay}` : ''}</span></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker([c.lat, c.lng], { icon, interactive: false, keyboard: false }).addTo(group);
    });

    const vehicle = L.marker([legs[0].points[0][0], legs[0].points[0][1]], {
      icon: L.divIcon({ className: '', html: '', iconSize: [30, 30], iconAnchor: [15, 15] }),
      interactive: false,
      keyboard: false,
      zIndexOffset: 2000,
    });
    let vehicleMode: RouteMode | null = null;
    let vehicleOn = false;

    const setVehicle = (mode: RouteMode, pos: [number, number]) => {
      if (!vehicleOn) {
        vehicle.addTo(group);
        vehicleOn = true;
      }
      if (vehicleMode !== mode) {
        vehicleMode = mode;
        vehicle.setIcon(
          L.divIcon({
            className: '',
            html: `<div class="route-vehicle" style="background:${COLOR[mode]};box-shadow:0 0 22px ${COLOR[mode]}"><svg viewBox="0 0 24 24"><path d="${ICON_PATH[mode]}"/></svg></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          }),
        );
      }
      vehicle.setLatLng(pos);
    };

    let raf = 0;
    let start = 0;
    let drawn = false;
    const total = legs.length * DRAW_MS;
    const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

    const drawAll = () => {
      legs.forEach((leg, i) => {
        lines[i].line.setLatLngs(leg.points);
        lines[i].glow.setLatLngs(leg.points);
      });
      drawn = true;
    };

    const frame = (now: number) => {
      if (!start) start = now;
      const el = now - start;
      if (!drawn) {
        legs.forEach((leg, i) => {
          const p = Math.min(1, Math.max(0, (el - i * DRAW_MS) / DRAW_MS));
          const n = Math.max(2, Math.round(ease(p) * (leg.points.length - 1)) + 1);
          const pts = p <= 0 ? [] : leg.points.slice(0, n);
          lines[i].line.setLatLngs(pts);
          lines[i].glow.setLatLngs(pts);
        });
        if (el >= total) drawn = true;
      } else {
        const a = propsRef.current.active;
        const t = el - total;
        const idx = a !== null ? a : Math.floor(t / LOOP_MS) % legs.length;
        const f = ease((t % LOOP_MS) / LOOP_MS);
        const leg = legs[idx];
        const k = Math.round(f * (leg.points.length - 1));
        setVehicle(leg.mode, leg.points[k]);
      }
      raf = requestAnimationFrame(frame);
    };

    if (reduce) {
      drawAll();
    } else if (go) {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      group.remove();
      linesRef.current = [];
    };
  }, [map, legs, cities, stayCityId, reduce, go, isAr]);

  // Emphasis follows hover and selection.
  const { active, hover } = props;
  useEffect(() => {
    const focus = hover ?? active;
    linesRef.current.forEach(({ line, glow }, i) => {
      const on = focus === i;
      const dim = focus !== null && !on;
      line.setStyle({ weight: on ? 5 : 3, opacity: dim ? 0.3 : 0.95 });
      glow.setStyle({ weight: on ? 16 : 10, opacity: on ? 0.3 : dim ? 0.05 : 0.16 });
    });
  }, [active, hover, go, reduce]);

  // Camera.
  const first = useRef(true);
  useEffect(() => {
    const all = L.latLngBounds(cities.map((c) => [c.lat, c.lng] as [number, number]));
    const target =
      active !== null ? L.latLngBounds(legs[active].points as [number, number][]) : all;
    const opts: L.FitBoundsOptions = { padding: [70, 70], maxZoom: 8 };
    if (first.current || reduce) {
      map.fitBounds(target, { ...opts, animate: false });
      first.current = false;
    } else {
      map.flyToBounds(target, { ...opts, duration: 1.3 });
    }
  }, [active, cities, legs, map, reduce]);

  return null;
}

export function RouteMap({ stayLocation }: { stayLocation: { lat: number; lng: number } | null }) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const copy = COPY[isAr ? 'ar' : 'en'];
  const reduce = !!useReducedMotion();
  const lat = stayLocation?.lat ?? null;
  const lng = stayLocation?.lng ?? null;
  const route = useMemo(
    () => buildRoute(lat !== null && lng !== null ? { lat, lng } : null),
    [lat, lng],
  );
  const [active, setActive] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const holder = useRef<HTMLDivElement>(null);
  const inView = useInView(holder, { once: true, amount: 0.3 });

  useEffect(() => {
    if (!playing) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      if (i >= route.legs.length) {
        window.clearInterval(id);
        setPlaying(false);
        setActive(null);
      } else {
        setActive(i);
      }
    }, 3600);
    return () => window.clearInterval(id);
  }, [playing, route.legs.length]);

  const leg = active !== null ? route.legs[active] : null;
  const dirName = (c: RouteCity) => c.name[isAr ? 'ar' : 'en'];

  return (
    <div
      ref={holder}
      className="relative isolate overflow-hidden rounded-[2rem] bg-[#101C15] p-5 text-white shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)] ring-1 ring-white/10 md:p-8"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(600px_280px_at_80%_0%,rgba(182,206,103,0.14),transparent_70%)]" />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#B6CE67]">
            <span className="h-px w-10 bg-[#B6CE67]" />
            {copy.eyebrow}
          </span>
          <h3 className="text-3xl font-semibold leading-tight md:text-4xl">{copy.title}</h3>
        </div>
        {!reduce ? (
          <button
            type="button"
            onClick={() => {
              if (playing) {
                setPlaying(false);
                setActive(null);
              } else {
                setActive(0);
                setPlaying(true);
              }
            }}
            className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#101C15] transition-colors hover:bg-[#B6CE67] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-4 fill-current rtl:-scale-x-100"
              aria-hidden="true"
            >
              {playing ? <path d="M6 5h4v14H6zM14 5h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}
            </svg>
            {playing ? copy.stop : copy.play}
          </button>
        ) : null}
      </div>

      <div
        className="stay-map relative isolate h-[26rem] overflow-hidden rounded-3xl bg-[#101C15] ring-1 ring-white/10 md:h-[30rem]"
        dir="ltr"
      >
        <MapContainer
          center={[27.5, 31.5]}
          zoom={6}
          zoomSnap={0.25}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <LuxuryTileLayer />
          <RouteLayer
            cities={route.cities}
            legs={route.legs}
            stayCityId={route.stayCityId}
            active={active}
            hover={hover}
            go={inView}
            reduce={reduce}
            isAr={isAr}
            yourStay={copy.yourStay}
            onSelect={(i) => {
              setPlaying(false);
              setActive((a) => (a === i ? null : i));
            }}
            onHover={setHover}
          />
        </MapContainer>
        <div className="pointer-events-none absolute inset-0 z-[500] rounded-3xl shadow-[inset_0_0_80px_rgba(11,21,16,0.65)]" />

        {leg ? (
          <div
            dir={isAr ? 'rtl' : 'ltr'}
            className="absolute bottom-4 left-4 right-4 z-[700] flex items-center gap-4 rounded-2xl border border-white/15 bg-[#101C15]/80 p-4 backdrop-blur-xl sm:right-auto sm:max-w-sm"
          >
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-full text-[#101C15]"
              style={{ background: COLOR[leg.mode] }}
            >
              <ModeIcon mode={leg.mode} className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif text-lg font-semibold">
                {dirName(leg.from)}{' '}
                <span className="font-sans font-normal text-white/60">{isAr ? '←' : '→'}</span>{' '}
                {dirName(leg.to)}
              </p>
              <p className="text-xs text-white/65">{copy.notes[leg.mode]}</p>
              <p className="mt-1 text-sm tabular-nums text-white/90">
                {copy.modes[leg.mode]} · {leg.km} {copy.km} · ≈ {fmtTime(leg.minutes, isAr)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setActive(null);
              }}
              aria-label={copy.close}
              className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:bg-white hover:text-[#101C15]"
            >
              ×
            </button>
          </div>
        ) : null}
      </div>

      {/* Timeline: hover lights the leg on the map, click flies to it */}
      <ol
        className="mt-5 flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] md:grid md:overflow-visible"
        style={{ gridTemplateColumns: `repeat(${route.legs.length}, minmax(0, 1fr))` }}
      >
        {route.legs.map((l) => {
          const on = active === l.index || hover === l.index;
          return (
            <li key={l.index} className="min-w-[15rem] shrink-0 snap-start md:min-w-0">
              <button
                type="button"
                aria-pressed={active === l.index}
                onMouseEnter={() => setHover(l.index)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(l.index)}
                onBlur={() => setHover(null)}
                onClick={() => {
                  setPlaying(false);
                  setActive((a) => (a === l.index ? null : l.index));
                }}
                className={`group relative flex h-full w-full flex-col gap-2 rounded-2xl border p-4 text-start transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
                  on
                    ? 'border-white/40 bg-white/10'
                    : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08]'
                }`}
              >
                <span
                  className="absolute inset-x-4 top-0 h-0.5 rounded-full transition-opacity duration-300"
                  style={{ background: COLOR[l.mode], opacity: on ? 1 : 0.45 }}
                />
                <span className="flex items-center justify-between text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/55">
                  <span>{String(l.index + 1).padStart(2, '0')}</span>
                  <span className="flex items-center gap-1.5" style={{ color: COLOR[l.mode] }}>
                    <ModeIcon mode={l.mode} className="size-4" />
                    {copy.modes[l.mode]}
                  </span>
                </span>
                <span className="font-serif text-lg font-semibold leading-tight">
                  {dirName(l.from)}{' '}
                  <span className="font-sans font-normal text-white/60">{isAr ? '←' : '→'}</span>{' '}
                  {dirName(l.to)}
                </span>
                <span className="text-sm tabular-nums text-white/65">
                  {l.km} {copy.km} · ≈ {fmtTime(l.minutes, isAr)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-xs text-white/40">{copy.legend}</p>
    </div>
  );
}
