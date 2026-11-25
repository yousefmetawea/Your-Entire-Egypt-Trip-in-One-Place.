import { useRef } from 'react';
import type { PointerEvent, ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Accommodation } from '../../types';
import { STAY_IMAGES } from './stay-images';

export interface AccommodationCardProps {
  accommodation: Accommodation;
  isSelected?: boolean;
  /** Highlighted briefly after its pin is clicked on the map. */
  isFlashing?: boolean;
  featured?: boolean;
  index?: number;
  onSetAsStay?: () => void;
  onOpenExternalModal?: (url: string) => void;
  onHover?: (id: string | null) => void;
  onFocusCard?: (id: string) => void;
}

type IconKey = 'wifi' | 'cup' | 'waves' | 'view' | 'leaf' | 'car' | 'key' | 'snow' | 'book' | 'spark';

const ICON_RULES: [RegExp, IconKey][] = [
  [/wi-?fi|internet/i, 'wifi'],
  [/garden|park|eco/i, 'leaf'],
  [/breakfast|kitchen|cafe|café|coffee/i, 'cup'],
  [/pool|beach|reef|diving|scuba|swim/i, 'waves'],
  [/view|balcony|terrace|rooftop|star|felucca|dock/i, 'view'],
  [/shuttle|airport|bicycle|bike|luggage|parking/i, 'car'],
  [/concierge|desk|cowork|reception/i, 'key'],
  [/air cond|a\/c|cooling/i, 'snow'],
  [/library|book/i, 'book'],
];

function iconFor(label: string): IconKey {
  for (const [re, key] of ICON_RULES) if (re.test(label)) return key;
  return 'spark';
}

const PATHS: Record<IconKey, ReactNode> = {
  wifi: <path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01" />,
  cup: <path d="M5 8h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8zM16 9h2a2 2 0 0 1 0 4h-2" />,
  waves: <path d="M3 9c2.3 0 2.3 1.6 4.5 1.6S9.800 9 12 9s2.300 1.600 4.500 1.600S19 9 21 9M3 15c2.300 0 2.300 1.600 4.500 1.600S9.800 15 12 15s2.300 1.600 4.500 1.600S19 15 21 15" />,
  view: (
    <>
      <path d="M2 12s3.500-6 10-6 10 6 10 6-3.500 6-10 6S2 12 2 12z" />
      <circle cx="12" cy="12" r="2.600" />
    </>
  ),
  leaf: <path d="M5 19c0-8 5-13 14-14 0 9-5 14-14 14zM5 19l7-7" />,
  car: <path d="M5 16v-5l2-4h10l2 4v5H5zM8 16v2M16 16v2M5 11h14" />,
  key: (
    <>
      <circle cx="8" cy="15" r="3" />
      <path d="M10 13l8-8M15 8l2 2" />
    </>
  ),
  snow: <path d="M12 3v18M4.500 7.500l15 9M4.500 16.500l15-9" />,
  book: <path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z" />,
  spark: <path d="M12 3l1.800 5.200L19 10l-5.200 1.800L12 17l-1.800-5.200L5 10l5.200-1.800z" />,
};

function Icon({ k, className = 'size-4' }: { k: IconKey; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[k]}
    </svg>
  );
}

export function AccommodationCard({
  accommodation,
  isSelected = false,
  isFlashing = false,
  featured = false,
  index = 0,
  onSetAsStay,
  onOpenExternalModal,
  onHover,
  onFocusCard,
}: AccommodationCardProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const name = isAr && accommodation.name.ar ? accommodation.name.ar : accommodation.name.en;

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-7%', '7%']);

  const photo = STAY_IMAGES[accommodation.id];
  const fallback = accommodation.images?.[0];
  const src = photo?.src ?? fallback?.src;

  const amenities = accommodation.amenities;
  const seen = new Set<IconKey>();
  const icons: { k: IconKey; label: string }[] = [];
  amenities.forEach((a) => {
    const k = iconFor(a);
    if (!seen.has(k)) {
      seen.add(k);
      icons.push({ k, label: a });
    }
  });
  const shownIcons = icons.slice(0, 3);
  const extra = Math.max(0, amenities.length - shownIcons.length);

  const onMove = (e: PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  const price = accommodation.priceRange;
  const stayLabel = isSelected
    ? isAr
      ? '✓ إقامتك'
      : '✓ Your stay'
    : isAr
      ? 'اجعلها إقامتي'
      : 'Set as my stay';

  return (
    <article
      ref={ref}
      id={`stay-card-${accommodation.id}`}
      onPointerMove={reduce ? undefined : onMove}
      onMouseEnter={() => onHover?.(accommodation.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onFocusCard?.(accommodation.id)}
      className={`group relative isolate flex h-full w-full flex-col justify-between overflow-hidden rounded-[1.75rem] bg-[#0a0e17] text-white shadow-[0_30px_60px_-34px_rgba(0,0,0,0.9)] ring-1 transition-[box-shadow,transform] duration-500 ${
        featured ? 'min-h-[34rem]' : 'min-h-[22rem]'
      } ${
        isSelected
          ? 'ring-2 ring-[#ffb25a]'
          : isFlashing
            ? 'ring-2 ring-white/80 stay-flash'
            : 'ring-white/10 hover:ring-white/30'
      }`}
    >
      {/* Photo with slow scroll parallax and a calm idle drift */}
      <motion.div
        aria-hidden="true"
        style={reduce ? undefined : { y }}
        className="absolute inset-x-0 -inset-y-[9%] -z-30"
      >
        {src ? (
          <img
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            style={{ objectPosition: photo?.pos }}
            className="size-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.07] motion-safe:animate-[stay-drift_22s_ease-in-out_infinite_alternate]"
          />
        ) : null}
      </motion.div>
      <div className="absolute inset-0 -z-20 bg-gradient-to-t from-[#05070d] via-[#05070d]/55 to-[#05070d]/10" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:hidden"
        style={{
          background:
            'radial-gradient(380px circle at var(--mx, 50%) var(--my, 40%), rgba(255,196,130,0.20), transparent 62%)',
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

      {/* Top row */}
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.22em] backdrop-blur-md">
            {accommodation.type}
          </span>
          <span className="text-[0.7rem] font-medium tabular-nums tracking-[0.2em] text-white/55">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isSelected ? (
            <span className="flex size-9 items-center justify-center rounded-full bg-[#ffb25a] text-sm font-bold text-black">
              ✓
            </span>
          ) : null}
          {accommodation.externalUrl && onOpenExternalModal ? (
            <button
              type="button"
              aria-label={isAr ? 'عرض عند المزوّد' : 'View on provider'}
              title={isAr ? 'عرض عند المزوّد' : 'View on provider'}
              onClick={(e) => {
                e.stopPropagation();
                onOpenExternalModal(accommodation.externalUrl!);
              }}
              className="flex size-9 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white/85 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-4 rtl:-scale-x-100"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {/* Bottom block */}
      <div className="flex flex-col gap-3 p-4 pt-0">
        <div className="px-2">
          <h3
            className={`font-serif font-semibold leading-tight transition-transform duration-500 group-hover:-translate-y-0.5 ${
              featured ? 'text-3xl md:text-4xl' : 'text-[1.55rem]'
            }`}
          >
            {name}
          </h3>
          {shownIcons.length > 0 ? (
            <div className="mt-3 flex items-center gap-2">
              {shownIcons.map((it) => (
                <span
                  key={it.k}
                  title={it.label}
                  className="flex size-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/90 backdrop-blur-md"
                >
                  <Icon k={it.k} />
                  <span className="sr-only">{it.label}</span>
                </span>
              ))}
              {extra > 0 ? (
                <span className="text-xs font-medium text-white/60">+{extra}</span>
              ) : null}
            </div>
          ) : null}
          {amenities.length > 0 ? (
            <p className="mt-0 max-h-0 overflow-hidden text-xs leading-relaxed text-white/65 opacity-0 transition-all duration-500 group-hover:mt-3 group-hover:max-h-16 group-hover:opacity-100 group-focus-within:mt-3 group-focus-within:max-h-16 group-focus-within:opacity-100">
              {amenities.join(' · ')}
            </p>
          ) : null}
        </div>

        {/* Glass strip: price always, the action unfolds on hover or focus */}
        <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-xl transition-colors duration-500 group-hover:bg-white/15">
          <span
            className="block whitespace-nowrap text-lg font-semibold leading-tight tabular-nums"
            title={isAr ? 'سعر تقريبي' : 'Estimated price'}
          >
            {price ? (
              <>
                <bdi dir="ltr">
                  {price.min} – {price.max}
                </bdi>
                <span className="ms-1.5 text-xs font-medium text-white/65">
                  {price.currency} / {isAr ? 'الليلة' : 'night'}
                </span>
              </>
            ) : (
              <span className="text-sm font-normal text-white/70">
                {isAr ? 'السعر عند الطلب' : 'Price on request'}
              </span>
            )}
          </span>
          {onSetAsStay ? (
            <div
              className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${
                isSelected
                  ? 'grid-rows-[1fr]'
                  : 'grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 [@media(hover:none)]:grid-rows-[1fr] [@media(hover:none)]:opacity-100 motion-reduce:grid-rows-[1fr] motion-reduce:opacity-100'
              }`}
            >
              <div className="overflow-hidden">
                <button
                  type="button"
                  disabled={isSelected}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetAsStay();
                  }}
                  className={`mt-3 w-full rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                    isSelected
                      ? 'bg-[#ffb25a] text-black'
                      : 'bg-white text-[#0a0e17] hover:bg-[#ffb25a]'
                  }`}
                >
                  {stayLabel}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
