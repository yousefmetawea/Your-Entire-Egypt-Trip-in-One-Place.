import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Accommodation } from '../../types';
import { LuxuryTileLayer } from '../map/LuxuryTileLayer';
import '../../styles/map.css';
import '../../styles/stay-map.css';

export interface AccommodationMapProps {
  accommodations: Accommodation[];
  selectedId: string | null;
  hoveredId?: string | null;
  /** Changing `n` flies the map to the stay, even when the id repeats. */
  focus?: { id: string; n: number } | null;
  onSelectAccommodation?: (id: string) => void;
  onHoverAccommodation?: (id: string | null) => void;
  onSetAsStay?: (id: string) => void;
}

const BED =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="1.6"/></svg>';

function makeIcon(state: { hovered: boolean; selected: boolean }) {
  const cls = `stay-pin${state.hovered ? ' is-hovered' : ''}${state.selected ? ' is-selected' : ''}`;
  return L.divIcon({
    className: 'accommodation-map-marker',
    html: `<div class="${cls}"><span class="stay-pin-pulse"></span><span class="stay-pin-core">${BED}</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

function FlyTo({
  target,
  instant,
}: {
  target: { lat: number; lng: number; n: number } | null;
  instant: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    const zoom = Math.max(map.getZoom(), 13);
    if (instant) map.setView([target.lat, target.lng], zoom, { animate: false });
    else map.flyTo([target.lat, target.lng], zoom, { duration: 1.4 });
  }, [target, map, instant]);
  return null;
}

export function AccommodationMap({
  accommodations,
  selectedId,
  hoveredId = null,
  focus = null,
  onSelectAccommodation,
  onHoverAccommodation,
  onSetAsStay,
}: AccommodationMapProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const reduce = useReducedMotion();
  const mapped = useMemo(() => accommodations.filter((a) => a.location !== null), [accommodations]);

  const icons = useMemo(
    () => ({
      base: makeIcon({ hovered: false, selected: false }),
      hover: makeIcon({ hovered: true, selected: false }),
      sel: makeIcon({ hovered: false, selected: true }),
      selHover: makeIcon({ hovered: true, selected: true }),
    }),
    [],
  );

  const target = useMemo(() => {
    if (!focus) return null;
    const a = mapped.find((m) => m.id === focus.id);
    return a ? { lat: a.location!.lat, lng: a.location!.lng, n: focus.n } : null;
  }, [focus, mapped]);

  if (mapped.length === 0) {
    return null;
  }

  return (
    <div className="stay-map relative isolate h-[26rem] w-full overflow-hidden rounded-3xl bg-[#0a0e17] shadow-[0_30px_60px_-34px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
      <MapContainer
        center={[28.2, 30.9]}
        zoom={6}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <LuxuryTileLayer />
        <FlyTo target={target} instant={!!reduce} />
        {mapped.map((acc) => {
          const sel = selectedId === acc.id;
          const hov = hoveredId === acc.id;
          const icon = sel ? (hov ? icons.selHover : icons.sel) : hov ? icons.hover : icons.base;
          return (
            <Marker
              key={acc.id}
              position={[acc.location!.lat, acc.location!.lng]}
              icon={icon}
              zIndexOffset={hov ? 1000 : sel ? 500 : 0}
              eventHandlers={{
                click: () => onSelectAccommodation?.(acc.id),
                mouseover: () => onHoverAccommodation?.(acc.id),
                mouseout: () => onHoverAccommodation?.(null),
              }}
            >
              <Popup>
                <div className="flex flex-col gap-1 text-start">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#ffb25a]">
                    {acc.type}
                  </span>
                  <p className="m-0 font-serif text-base font-semibold text-white">
                    {isAr && acc.name.ar ? acc.name.ar : acc.name.en}
                  </p>
                  {acc.priceRange ? (
                    <p className="m-0 text-xs text-white/70">
                      {acc.priceRange.min} – {acc.priceRange.max} {acc.priceRange.currency} /{' '}
                      {isAr ? 'الليلة' : 'night'}
                    </p>
                  ) : null}
                  {onSetAsStay ? (
                    <button
                      type="button"
                      disabled={sel}
                      onClick={() => onSetAsStay(acc.id)}
                      className="mt-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#0a0e17] transition-colors hover:bg-[#ffb25a] disabled:bg-[#ffb25a]"
                    >
                      {sel
                        ? isAr
                          ? '✓ إقامتك'
                          : '✓ Your stay'
                        : isAr
                          ? 'اجعلها إقامتي'
                          : 'Set as my stay'}
                    </button>
                  ) : null}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      <div className="pointer-events-none absolute inset-0 z-[500] rounded-3xl shadow-[inset_0_0_80px_rgba(5,7,13,0.65)]" />
      <div className="pointer-events-none absolute right-4 top-4 z-[600] flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5 text-xs font-medium tracking-wide text-white/85 backdrop-blur-md">
        <span className="size-1.5 rounded-full bg-[#ffb25a]" aria-hidden="true" />
        {mapped.length}{' '}
        {isAr ? 'إقامة على الخريطة' : mapped.length === 1 ? 'stay on the map' : 'stays on the map'}
      </div>
    </div>
  );
}
