import { lazy, Suspense, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import type { Place, PlaceId, Trip, TripActivity } from '../../types';
import type { TripPhaseInfo } from '../../lib/dashboard/tripPhase';
import { cn } from '../../lib/cn';
import { fmtDate, fmtMoney, fmtNumber, fmtWeekday } from '../../lib/mytrip/format';
import { formatMinutes } from '../../lib/mytrip/summary';
import { getAreaLabelKey, getCategoryLabelKey } from '../../lib/catalog';
import { PlaceMedia } from '../places/PlaceMedia';
import { ArrowRightIcon, ChevronDownIcon, ClockIcon, MapPinIcon } from '../ui/icons';
import { Skeleton } from '../ui/Skeleton';
import { SectionHeading } from './shared';

const LazyItineraryMap = lazy(() =>
  import('../map/ItineraryMap').then((m) => ({ default: m.ItineraryMap })),
);

export interface ItinerarySectionProps {
  trip: Trip;
  tripPhaseInfo: TripPhaseInfo;
  placesById: ReadonlyMap<PlaceId, Place>;
}

function StopCard({
  activity,
  index,
  place,
  selected,
  expanded,
  onSelect,
  onToggle,
  onShowMap,
  tripDate,
}: {
  activity: TripActivity;
  index: number;
  place: Place | null;
  selected: boolean;
  expanded: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onShowMap: () => void;
  tripDate: string;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isAr = lang === 'ar';
  const reduce = useReducedMotion();
  const name =
    activity.source.type === 'place'
      ? place
        ? isAr && place.name.ar
          ? place.name.ar
          : place.name.en
        : t('myTrip.itinerary.placeUnavailable')
      : activity.source.title;
  const description = place
    ? isAr && place.description?.ar
      ? place.description.ar
      : place.description?.en
    : null;
  const detailId = `stop-detail-${activity.id}`;
  const hasDetails = Boolean(description || activity.notes || activity.travelMin || place);

  return (
    <li className="relative ps-14 sm:ps-16" data-stop-id={activity.id} data-date={tripDate}>
      <span
        aria-hidden="true"
        className={cn(
          'absolute start-0 top-5 grid size-10 place-items-center rounded-full border-2 text-sm font-semibold transition-colors duration-300 sm:size-11',
          selected
            ? 'border-(--yt-green) bg-(--yt-lime) text-(--yt-green)'
            : 'border-(--yt-green)/25 bg-(--yt-ivory) text-(--yt-green)',
        )}
      >
        {index + 1}
      </span>
      <article
        className={cn(
          'group/stop overflow-hidden rounded-3xl bg-white transition-[transform,box-shadow] duration-300',
          selected ? 'shadow-[0_0_0_2px_var(--yt-green)]' : 'shadow-[0_0_0_1px_rgba(25,52,38,0.1)]',
        )}
      >
        <div className="flex flex-col sm:flex-row">
          <button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            aria-label={t('myTrip.itinerary.selectStop', { name })}
            className="relative block aspect-[16/9] w-full shrink-0 cursor-pointer overflow-hidden bg-(--yt-green) text-start sm:aspect-auto sm:w-44 md:w-52"
          >
            {place ? (
              <PlaceMedia
                place={place}
                sizes="(min-width: 768px) 14rem, 100vw"
                className="absolute inset-0 size-full"
                imgClassName="transition-transform duration-700 group-hover/stop:scale-[1.06] motion-reduce:group-hover/stop:scale-100"
              />
            ) : (
              <span className="absolute inset-0 grid place-items-center font-display text-3xl text-(--yt-lime)/80">
                {index + 1}
              </span>
            )}
          </button>
          <div className="min-w-0 flex-1 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold tracking-[0.14em] text-(--yt-ink-2) uppercase">
              <span className="inline-flex items-center gap-1.5 text-(--yt-green)">
                <ClockIcon className="size-3.5" />
                {activity.startTime ?? t('myTrip.itinerary.timeNotSet')}
              </span>
              {activity.durationMin ? (
                <span>
                  {formatMinutes(activity.durationMin, t('myTrip.unitH'), t('myTrip.unitMin'))}
                </span>
              ) : null}
              {place ? <span>{t(getCategoryLabelKey(place.category))}</span> : null}
            </div>
            <h3 className="mt-2 font-display text-2xl leading-snug font-medium">
              {place ? (
                <Link to={`/places/${place.slug}`} className="underline-offset-4 hover:underline">
                  {name}
                </Link>
              ) : (
                name
              )}
            </h3>
            {place ? (
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-(--yt-ink-2)">
                <MapPinIcon className="size-4" />
                {t(getAreaLabelKey(place.area))}
              </p>
            ) : null}
            {activity.estimatedCost ? (
              <p className="mt-3 text-sm font-medium">
                {fmtMoney(activity.estimatedCost.amount, activity.estimatedCost.currency, lang)}
                <span className="ms-2 rounded-full bg-(--yt-sage) px-2 py-0.5 text-[0.65rem] font-semibold tracking-wider text-(--yt-ink-2) uppercase">
                  {activity.estimatedCost.isEstimated ? t('myTrip.estimated') : t('myTrip.listed')}
                </span>
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              {hasDetails ? (
                <button
                  type="button"
                  onClick={onToggle}
                  aria-expanded={expanded}
                  aria-controls={detailId}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-(--yt-green)"
                >
                  {expanded ? t('myTrip.itinerary.hideDetails') : t('myTrip.itinerary.details')}
                  <ChevronDownIcon
                    className={cn(
                      'size-4 transition-transform duration-300',
                      expanded && 'rotate-180',
                    )}
                  />
                </button>
              ) : null}
              {place ? (
                <button
                  type="button"
                  onClick={onShowMap}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-(--yt-green) lg:hidden"
                >
                  <MapPinIcon className="size-4" />
                  {t('myTrip.itinerary.showOnMap')}
                </button>
              ) : null}
            </div>
          </div>
        </div>
        <AnimatePresence initial={false}>
          {expanded ? (
            <motion.div
              id={detailId}
              initial={reduce ? false : { height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="space-y-3 border-t border-(--yt-green)/10 px-5 py-5 text-sm leading-relaxed text-(--yt-ink-2) sm:px-6">
                {description ? <p>{description}</p> : null}
                {activity.travelMin ? (
                  <p>
                    <span className="font-semibold text-(--yt-green)">
                      {t('myTrip.itinerary.travelTime')}:{' '}
                    </span>
                    {t('myTrip.itinerary.travelMin', { count: activity.travelMin })}
                  </p>
                ) : null}
                {activity.notes ? (
                  <p className="rounded-2xl bg-(--yt-ivory) p-4 text-(--yt-green) italic">
                    {activity.notes}
                  </p>
                ) : null}
                {place ? (
                  <Link
                    to={`/places/${place.slug}`}
                    className="inline-flex items-center gap-2 font-semibold text-(--yt-green) underline-offset-4 hover:underline"
                  >
                    {t('place.view')}
                    <ArrowRightIcon className="size-4 rtl:rotate-180" />
                  </Link>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </article>
    </li>
  );
}

export function ItinerarySection({ trip, tripPhaseInfo, placesById }: ItinerarySectionProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const reduce = useReducedMotion();
  const defaultIdx = tripPhaseInfo.dayNumber ? tripPhaseInfo.dayNumber - 1 : 0;
  const [dayIdx, setDayIdx] = useState(
    Math.min(Math.max(trip.days.length - 1, 0), Math.max(0, defaultIdx)),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const listRef = useRef<HTMLOListElement>(null);

  const day = trip.days[dayIdx];
  const dayMinutes = useMemo(
    () => (day ? day.activities.reduce((s, a) => s + (a.durationMin ?? 0), 0) : 0),
    [day],
  );

  const selectFromMap = (id: string) => {
    const next = id || null;
    setSelectedId(next);
    if (next) {
      const el = listRef.current?.querySelector(`[data-stop-id="${CSS.escape(next)}"]`);
      el?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    }
  };

  // Small screens stack the map below the list: select the stop, then bring the map into view.
  const showOnMap = (id: string) => {
    setSelectedId(id);
    document
      .getElementById('mt-map')
      ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  };

  const changeDay = (idx: number) => {
    setDayIdx(idx);
    setSelectedId(null);
    setExpandedId(null);
  };

  return (
    <section aria-labelledby="mt-itinerary-heading">
      <SectionHeading
        id="mt-itinerary-heading"
        eyebrow={t('myTrip.itinerary.eyebrow')}
        title={t('myTrip.itinerary.title')}
        aside={
          <Link
            to={`/trip/${trip.id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-(--yt-green) underline-offset-4 hover:underline"
          >
            {t('myTrip.itinerary.editInBuilder')}
            <ArrowRightIcon className="size-4 rtl:rotate-180" />
          </Link>
        }
      />

      {trip.days.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-white p-10 text-center">
          <p className="text-(--yt-ink-2)">{t('myTrip.itinerary.noDays')}</p>
          <Link
            to={`/trip/${trip.id}`}
            className="mt-5 inline-flex h-12 items-center rounded-full bg-(--yt-green) px-7 text-sm font-semibold text-(--yt-on-dark)"
          >
            {t('myTrip.itinerary.addInBuilder')}
          </Link>
        </div>
      ) : (
        <>
          <LayoutGroup id="mt-days">
            <div
              role="tablist"
              aria-label={t('myTrip.itinerary.daySwitcher')}
              className="yt-noscroll -mx-gutter-sm mt-6 flex gap-2 overflow-x-auto bg-(--yt-ivory)/95 px-gutter-sm py-3 backdrop-blur-sm max-lg:sticky max-lg:top-20 max-lg:z-30 md:mx-0 md:px-0 lg:mt-8 lg:bg-transparent lg:py-0 lg:pb-1"
            >
              {trip.days.map((d, i) => {
                const selected = i === dayIdx;
                return (
                  <button
                    key={d.id}
                    role="tab"
                    type="button"
                    id={`mt-day-tab-${i}`}
                    aria-selected={selected}
                    aria-controls="mt-day-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => changeDay(i)}
                    onKeyDown={(e) => {
                      const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
                      if (!dir) return;
                      const rtl = document.documentElement.dir === 'rtl' ? -1 : 1;
                      const next = (i + dir * rtl + trip.days.length) % trip.days.length;
                      changeDay(next);
                      document.getElementById(`mt-day-tab-${next}`)?.focus();
                    }}
                    className={cn(
                      'relative isolate min-w-28 shrink-0 cursor-pointer rounded-2xl border px-5 py-3 text-start transition-colors',
                      selected
                        ? 'border-transparent'
                        : 'border-(--yt-green)/20 hover:border-(--yt-green)/50',
                    )}
                  >
                    {selected ? (
                      <motion.span
                        layoutId="mt-day-indicator"
                        transition={
                          reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 36 }
                        }
                        className="absolute inset-0 -z-10 rounded-2xl bg-(--yt-green)"
                      />
                    ) : null}
                    <span
                      className={cn(
                        'block text-[0.65rem] font-semibold tracking-[0.18em] uppercase',
                        selected ? 'text-(--yt-lime)' : 'text-(--yt-ink-2)',
                      )}
                    >
                      {t('myTrip.itinerary.dayN', { n: fmtNumber(i + 1, lang) })}
                    </span>
                    <span
                      className={cn(
                        'mt-0.5 block text-sm font-semibold',
                        selected ? 'text-(--yt-on-dark)' : '',
                      )}
                    >
                      {fmtDate(d.date, lang, false) ?? ''}
                    </span>
                    <span
                      className={cn(
                        'block text-xs',
                        selected ? 'text-(--yt-on-dark-2)' : 'text-(--yt-ink-2)',
                      )}
                    >
                      {t('myTrip.itinerary.stops', { count: d.activities.length })}
                    </span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>

          <div className="mt-10 grid items-start gap-10 lg:grid-cols-12">
            <div
              id="mt-day-panel"
              role="tabpanel"
              aria-labelledby={`mt-day-tab-${dayIdx}`}
              className="lg:col-span-7"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={day?.id}
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  transition={{ duration: reduce ? 0 : 0.3 }}
                >
                  <p className="mb-6 text-sm text-(--yt-ink-2)">
                    {fmtWeekday(day.date, lang)} · {fmtDate(day.date, lang)} ·{' '}
                    {t('myTrip.itinerary.stops', { count: day.activities.length })}
                    {dayMinutes > 0
                      ? ` · ${t('myTrip.itinerary.visitTime', {
                          time: formatMinutes(dayMinutes, t('myTrip.unitH'), t('myTrip.unitMin')),
                        })}`
                      : ''}
                  </p>
                  {day.activities.length === 0 ? (
                    <div className="rounded-3xl bg-white p-8 text-center text-(--yt-ink-2)">
                      <p>{t('myTrip.itinerary.emptyDay')}</p>
                      <Link
                        to={`/trip/${trip.id}`}
                        className="mt-4 inline-block font-semibold text-(--yt-green) underline underline-offset-4"
                      >
                        {t('myTrip.itinerary.addInBuilder')}
                      </Link>
                    </div>
                  ) : (
                    <div className="relative">
                      <span
                        aria-hidden="true"
                        className="absolute start-5 top-8 bottom-8 w-px bg-(--yt-green)/20 sm:start-[1.375rem]"
                      />
                      <ol ref={listRef} className="space-y-5">
                        {day.activities.map((a, i) => (
                          <StopCard
                            key={a.id}
                            activity={a}
                            index={i}
                            place={
                              a.source.type === 'place'
                                ? (placesById.get(a.source.placeId) ?? null)
                                : null
                            }
                            selected={selectedId === a.id}
                            expanded={expandedId === a.id}
                            onSelect={() => setSelectedId(selectedId === a.id ? null : a.id)}
                            onToggle={() => setExpandedId(expandedId === a.id ? null : a.id)}
                            onShowMap={() => showOnMap(a.id)}
                            tripDate={day.date}
                          />
                        ))}
                      </ol>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div id="mt-map" className="scroll-mt-24 lg:sticky lg:top-24 lg:col-span-5">
              <Suspense fallback={<Skeleton className="h-[520px] w-full rounded-3xl" />}>
                <LazyItineraryMap
                  day={day}
                  dayNumber={dayIdx + 1}
                  placesById={placesById}
                  selectedStopId={selectedId}
                  onSelectStop={selectFromMap}
                  routeColor="#193426"
                />
              </Suspense>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
