import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import type { Accommodation, Place, Trip } from '../../types';
import type { TripPhaseInfo } from '../../lib/dashboard/tripPhase';
import { cn } from '../../lib/cn';
import { fmtDate, fmtNumber } from '../../lib/mytrip/format';
import { getDisplayStatus, phaseMatchesStatus } from '../../lib/mytrip/summary';
import { getAreaLabelKey } from '../../lib/catalog';
import { SplitText } from '../motion/SplitText';
import { PlaceMedia } from '../places/PlaceMedia';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ArrowRightIcon } from '../ui/icons';

export interface TripHeroProps {
  trip: Trip;
  trips: Trip[];
  tripPhaseInfo: TripPhaseInfo;
  heroPlace: Place | null;
  placesById: Map<string, Place>;
  accommodation: Accommodation | null;
  destinations: number;
  activities: number;
  onSelectTrip: (tripId: string) => void;
  onCancelTrip: (tripId: string) => void;
  actionLoading?: boolean;
}

export function TripHero({
  trip,
  trips,
  tripPhaseInfo,
  heroPlace,
  placesById,
  accommodation,
  destinations,
  activities,
  onSelectTrip,
  onCancelTrip,
  actionLoading = false,
}: TripHeroProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isAr = lang === 'ar';
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);

  const status = getDisplayStatus(tripPhaseInfo);
  const matches = phaseMatchesStatus(tripPhaseInfo);
  const start = fmtDate(trip.startDate, lang);
  const end = fmtDate(trip.endDate, lang);
  const dates = start && end ? `${start} – ${end}` : (start ?? t('myTrip.hero.noDates'));
  const stayName = accommodation
    ? isAr && accommodation.name.ar
      ? accommodation.name.ar
      : accommodation.name.en
    : null;

  // Calendar line that agrees with the status. A draft or cancelled trip never claims a calendar phase.
  let timeline: string | null = null;
  if (matches) {
    if (tripPhaseInfo.phase === 'before') {
      timeline = t('myTrip.hero.startsIn', { count: tripPhaseInfo.daysRemaining ?? 0 });
    } else if (tripPhaseInfo.phase === 'during') {
      timeline = t('myTrip.hero.dayOf', {
        day: tripPhaseInfo.dayNumber ?? 1,
        total: tripPhaseInfo.totalDays,
      });
    } else if (tripPhaseInfo.phase === 'after') {
      timeline = t('myTrip.hero.endedAgo', { count: tripPhaseInfo.daysSinceEnd ?? 0 });
    }
  } else if (status === 'draft' && tripPhaseInfo.phase !== 'no-dates') {
    timeline = t(
      tripPhaseInfo.phase === 'after' ? 'myTrip.hero.draftPast' : 'myTrip.hero.draftFuture',
    );
  }

  const progress =
    status === 'active' && tripPhaseInfo.dayNumber
      ? tripPhaseInfo.dayNumber / Math.max(1, tripPhaseInfo.totalDays)
      : null;

  // Focus panel: only real data (countdown, current day, first stop of the relevant day).
  const focusDay =
    status === 'active' && tripPhaseInfo.activeDay ? tripPhaseInfo.activeDay : trip.days[0];
  const focusActivity = focusDay
    ? [...focusDay.activities].sort((a, b) => a.order - b.order)[0]
    : undefined;
  let focusName: string | null = null;
  if (focusActivity) {
    if (focusActivity.source.type === 'place') {
      const fp = placesById.get(focusActivity.source.placeId);
      focusName = fp ? (isAr && fp.name.ar ? fp.name.ar : fp.name.en) : null;
    } else {
      focusName = focusActivity.source.title;
    }
  }
  let figure: number;
  let figureLabel: string;
  let eyebrow: string;
  if (matches && tripPhaseInfo.phase === 'before') {
    figure = tripPhaseInfo.daysRemaining ?? 0;
    figureLabel = t('myTrip.hero.panel.toGo', { count: figure });
    eyebrow = t('myTrip.hero.panel.countdown');
  } else if (matches && tripPhaseInfo.phase === 'during' && tripPhaseInfo.dayNumber) {
    figure = tripPhaseInfo.dayNumber;
    figureLabel = t('myTrip.hero.panel.ofDays', { total: tripPhaseInfo.totalDays });
    eyebrow = t('myTrip.hero.panel.today');
  } else {
    figure = trip.days.length;
    figureLabel = t('myTrip.hero.panel.planned', { count: figure });
    eyebrow = t('myTrip.hero.panel.plan');
  }

  const metaItems = [
    { k: 'dates', label: t('myTrip.hero.dates'), value: dates },
    {
      k: 'guests',
      label: t('myTrip.hero.guests'),
      value: t('myTrip.hero.guestsValue', { count: trip.travelers }),
    },
    ...(stayName ? [{ k: 'stay', label: t('myTrip.hero.stay'), value: stayName }] : []),
  ];

  return (
    <header
      ref={ref}
      className="yt-dark relative isolate overflow-hidden bg-(--yt-forest) pt-32 pb-24 text-(--yt-on-dark) md:pt-40 md:pb-28"
    >
      <div className="yt-trip-clip absolute inset-0 -z-10">
        {heroPlace ? (
          <motion.div
            style={reduce ? undefined : { y: imgY }}
            className="absolute inset-x-0 -top-[6%] h-[112%]"
          >
            <PlaceMedia place={heroPlace} priority sizes="100vw" className="size-full" />
          </motion.div>
        ) : null}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-(--yt-forest) via-(--yt-forest)/80 to-(--yt-forest)/55"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-(--yt-forest)/80 via-transparent to-transparent rtl:bg-linear-to-l"
        />
      </div>

      <div className="relative mx-auto w-full max-w-page px-gutter-sm md:px-margin-md lg:px-margin-lg">
        <div className="flex flex-wrap items-center gap-3">
          <motion.span
            key={status}
            initial={reduce ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-[0.16em] uppercase',
              status === 'cancelled'
                ? 'bg-white/10 text-(--yt-on-dark-2) line-through'
                : status === 'active' || status === 'upcoming'
                  ? 'bg-(--yt-lime) text-(--yt-green)'
                  : 'bg-white/12 text-(--yt-on-dark) ring-1 ring-white/25',
            )}
          >
            <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
            {t(`myTrip.status.${status}`)}
          </motion.span>
          {timeline ? (
            <span className="text-sm font-medium text-(--yt-on-dark-2)">{timeline}</span>
          ) : null}
          {trips.length > 1 ? (
            <span className="ms-auto">
              <label htmlFor="trip-switcher" className="sr-only">
                {t('myTrip.hero.switchTrip')}
              </label>
              <select
                id="trip-switcher"
                value={trip.id}
                onChange={(e) => onSelectTrip(e.target.value)}
                className="cursor-pointer rounded-full border border-white/25 bg-(--yt-forest)/60 px-4 py-1.5 text-xs text-(--yt-on-dark)"
              >
                {trips.map((x) => (
                  <option key={x.id} value={x.id} className="bg-(--yt-forest)">
                    {x.title}
                  </option>
                ))}
              </select>
            </span>
          ) : null}
        </div>

        <h1
          dir="auto"
          className="mt-6 w-fit max-w-4xl font-display text-[2.8rem] leading-[1.02] font-medium tracking-tight sm:text-7xl lg:text-[5.5rem] rtl:leading-[1.2]"
        >
          <SplitText>{trip.title}</SplitText>
        </h1>

        {heroPlace ? (
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-5 text-xs font-semibold tracking-[0.22em] text-(--yt-lime) uppercase"
          >
            {t('myTrip.hero.country')} · {t(getAreaLabelKey(heroPlace.area))}
          </motion.p>
        ) : (
          <p className="mt-5 text-xs font-semibold tracking-[0.22em] text-(--yt-lime) uppercase">
            {t('myTrip.hero.country')}
          </p>
        )}

        <motion.dl
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 grid max-w-4xl gap-x-10 gap-y-5 border-t border-white/15 pt-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {metaItems.map((m) => (
            <div key={m.k} className="min-w-0">
              <dt className="text-[0.68rem] font-semibold tracking-[0.2em] text-(--yt-on-dark-2) uppercase">
                {m.label}
              </dt>
              <dd className="mt-1 break-words text-base font-medium text-(--yt-on-dark)">
                {m.value}
              </dd>
            </div>
          ))}
          <div className="min-w-0">
            <dt className="text-[0.68rem] font-semibold tracking-[0.2em] text-(--yt-on-dark-2) uppercase">
              {t('myTrip.hero.plan')}
            </dt>
            <dd className="mt-1 text-base font-medium text-(--yt-on-dark)">
              {t('myTrip.hero.planValue', {
                destinations: fmtNumber(destinations, lang),
                activities: fmtNumber(activities, lang),
              })}
            </dd>
          </div>
        </motion.dl>

        {trip.days.length > 0 ? (
          <motion.aside
            aria-label={eyebrow}
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 w-full max-w-sm rounded-3xl border border-white/15 bg-(--yt-forest)/55 p-6 backdrop-blur-md lg:absolute lg:end-0 lg:bottom-0 lg:mt-0 lg:w-80"
          >
            <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-(--yt-lime) uppercase">
              {eyebrow}
            </p>
            <p className="mt-3 flex items-baseline gap-3">
              <span className="font-display text-6xl leading-none font-medium">
                {fmtNumber(figure, lang)}
              </span>
              <span className="text-sm text-(--yt-on-dark-2)">{figureLabel}</span>
            </p>
            {focusName ? (
              <div className="mt-5 border-t border-white/15 pt-4">
                <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-(--yt-on-dark-2) uppercase">
                  {status === 'active'
                    ? t('myTrip.hero.panel.firstToday')
                    : t('myTrip.hero.panel.first')}
                </p>
                <p className="mt-1 font-display text-lg leading-snug">
                  <bdi>{focusName}</bdi>
                  {focusActivity?.startTime ? (
                    <span className="text-(--yt-on-dark-2)"> · {focusActivity.startTime}</span>
                  ) : null}
                </p>
              </div>
            ) : null}
          </motion.aside>
        ) : null}

        {progress !== null ? (
          <div
            className="mt-8 max-w-xl"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            aria-label={t('myTrip.hero.progress')}
          >
            <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
              <motion.div
                initial={reduce ? false : { scaleX: 0 }}
                animate={{ scaleX: progress }}
                transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="h-full origin-left rounded-full bg-(--yt-lime) rtl:origin-right"
              />
            </div>
          </div>
        ) : null}

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            to={`/trip/${trip.id}`}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-(--yt-lime) px-7 text-sm font-semibold text-(--yt-green) transition-transform duration-200 hover:-translate-y-0.5"
          >
            {t('myTrip.hero.openBuilder')}
            <ArrowRightIcon className="size-4 rtl:rotate-180" />
          </Link>
          <Link
            to="/stay-transport"
            className="inline-flex h-12 items-center rounded-full border border-white/30 px-7 text-sm font-semibold text-(--yt-on-dark) transition-colors hover:bg-white/10"
          >
            {t('myTrip.hero.stayTransport')}
          </Link>
          {trip.status !== 'cancelled' ? (
            <button
              type="button"
              onClick={() => setCancelOpen(true)}
              disabled={actionLoading}
              className="inline-flex h-12 cursor-pointer items-center rounded-full px-5 text-sm font-medium text-(--yt-on-dark-2) underline-offset-4 transition-colors hover:text-(--yt-on-dark) hover:underline disabled:opacity-50"
            >
              {t('myTrip.hero.cancelTrip')}
            </button>
          ) : null}
        </div>
      </div>

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        closeLabel={t('myTrip.close')}
        title={t('myTrip.hero.cancelTitle')}
        description={t('myTrip.hero.cancelBody')}
      >
        <div className="flex items-center justify-end gap-space-sm pt-space-md">
          <Button variant="ghost" onClick={() => setCancelOpen(false)} disabled={actionLoading}>
            {t('myTrip.hero.keepTrip')}
          </Button>
          <Button
            variant="primary"
            className="!bg-danger !border-danger hover:!bg-danger-soft"
            onClick={() => {
              onCancelTrip(trip.id);
              setCancelOpen(false);
            }}
            disabled={actionLoading}
          >
            {t('myTrip.hero.confirmCancel')}
          </Button>
        </div>
      </Modal>
    </header>
  );
}
