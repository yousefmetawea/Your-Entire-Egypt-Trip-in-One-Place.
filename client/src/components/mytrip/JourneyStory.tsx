import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import type { Place, PlaceId, Trip } from '../../types';
import type { TripPhaseInfo } from '../../lib/dashboard/tripPhase';
import type { TripStats } from '../../lib/mytrip/summary';
import type { BudgetAnalyticsResult } from '../../lib/dashboard/budgetAnalytics';
import { cn } from '../../lib/cn';
import { fmtDate, fmtMoney, fmtNumber } from '../../lib/mytrip/format';
import { getDisplayStatus } from '../../lib/mytrip/summary';
import { getAreaLabelKey } from '../../lib/catalog';
import { PlaceMedia } from '../places/PlaceMedia';
import { SectionHeading } from './shared';

interface Props {
  trip: Trip;
  tripPhaseInfo: TripPhaseInfo;
  placesById: ReadonlyMap<PlaceId, Place>;
  stats: TripStats;
  budget: BudgetAnalyticsResult | null;
}

/** Day-by-day editorial timeline. Built only from itinerary data and stop notes the traveler wrote. */
function JourneyMemoryTimeline({
  trip,
  tripPhaseInfo,
  placesById,
}: Omit<Props, 'stats' | 'budget'>) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isAr = lang === 'ar';
  const reduce = useReducedMotion();
  const currentIdx = tripPhaseInfo.phase === 'during' ? (tripPhaseInfo.dayNumber ?? 1) - 1 : -1;

  return (
    <ol className="mt-14 space-y-16">
      {trip.days.map((day, i) => {
        const places = day.activities.flatMap((a) =>
          a.source.type === 'place'
            ? [placesById.get(a.source.placeId)].filter((p): p is Place => Boolean(p))
            : [],
        );
        const cover = places[0] ?? null;
        const notes = day.activities.filter((a) => a.notes);
        return (
          <motion.li
            key={day.id}
            initial={reduce ? false : { opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-8 md:grid-cols-12"
          >
            <div className="md:col-span-5">
              <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.22em] text-(--yt-lime) uppercase">
                {t('myTrip.itinerary.dayN', { n: fmtNumber(i + 1, lang) })}
                {i === currentIdx ? (
                  <span className="rounded-full bg-(--yt-lime) px-2.5 py-0.5 text-[0.62rem] tracking-wider text-(--yt-green)">
                    {t('myTrip.story.today')}
                  </span>
                ) : null}
              </p>
              <h3 className="mt-3 font-display text-3xl leading-tight font-medium rtl:leading-snug">
                {fmtDate(day.date, lang)}
              </h3>
              {places.length > 0 ? (
                <ul className="mt-5 space-y-2 text-(--yt-on-dark-2)">
                  {places.map((p) => (
                    <li key={p.id}>
                      <Link
                        to={`/places/${p.slug}`}
                        className="underline-offset-4 hover:text-(--yt-on-dark) hover:underline"
                      >
                        {isAr && p.name.ar ? p.name.ar : p.name.en}
                      </Link>
                      <span className="text-(--yt-on-dark-2)/70">
                        {' '}
                        · {t(getAreaLabelKey(p.area))}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 text-(--yt-on-dark-2)">{t('myTrip.story.noStops')}</p>
              )}
              {notes.length > 0 ? (
                <div className="mt-6 space-y-3 border-s-2 border-(--yt-lime) ps-4">
                  <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-(--yt-lime) uppercase">
                    {t('myTrip.story.notes')}
                  </p>
                  {notes.map((a) => (
                    <p key={a.id} className="font-display text-lg leading-snug italic">
                      {a.notes}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
            <div className={cn('md:col-span-7', i % 2 === 1 && 'md:order-first')}>
              {cover ? (
                <div className="group/story relative aspect-[16/10] overflow-hidden rounded-[2rem]">
                  <PlaceMedia
                    place={cover}
                    sizes="(min-width: 768px) 58vw, 100vw"
                    className="absolute inset-0 size-full"
                    imgClassName="transition-transform duration-1000 group-hover/story:scale-[1.04] motion-reduce:group-hover/story:scale-100"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-linear-to-t from-(--yt-forest)/70 via-transparent to-transparent"
                  />
                </div>
              ) : (
                <div className="grid aspect-[16/10] place-items-center rounded-[2rem] border border-dashed border-white/25 text-(--yt-on-dark-2)">
                  {t('myTrip.story.noPhoto')}
                </div>
              )}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}

export function JourneyStory({ trip, tripPhaseInfo, placesById, stats, budget }: Props) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const status = getDisplayStatus(tripPhaseInfo);
  const mode =
    status === 'completed'
      ? 'completed'
      : status === 'active'
        ? 'active'
        : status === 'cancelled'
          ? 'cancelled'
          : 'planned';

  return (
    <section
      aria-labelledby="mt-story-heading"
      className="yt-dark relative overflow-hidden bg-(--yt-forest) py-24 text-(--yt-on-dark) md:py-32"
    >
      <div className="mx-auto w-full max-w-page px-gutter-sm md:px-margin-md lg:px-margin-lg">
        <SectionHeading
          id="mt-story-heading"
          dark
          eyebrow={t(`myTrip.story.eyebrow.${mode}`)}
          title={t('myTrip.story.title')}
        />
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-(--yt-on-dark-2)">
          {t(`myTrip.story.intro.${mode}`)}
        </p>

        <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-white/15 pt-8 md:grid-cols-4">
          {[
            {
              k: 'dest',
              label: t('myTrip.overview.destinations'),
              value: fmtNumber(stats.destinations, lang),
            },
            { k: 'days', label: t('myTrip.overview.days'), value: fmtNumber(stats.days, lang) },
            {
              k: 'dates',
              label: t('myTrip.hero.dates'),
              value: `${fmtDate(trip.startDate, lang, false) ?? ''} – ${fmtDate(trip.endDate, lang, false) ?? ''}`,
            },
            {
              k: 'spend',
              label: t('myTrip.story.spend'),
              value:
                budget && budget.totalUtilized > 0
                  ? fmtMoney(budget.totalUtilized, budget.currency, lang)
                  : t('myTrip.overview.na'),
            },
          ].map((s) => (
            <div key={s.k}>
              <dt className="text-[0.68rem] font-semibold tracking-[0.2em] text-(--yt-on-dark-2) uppercase">
                {s.label}
              </dt>
              <dd className="mt-2 font-display text-3xl font-medium">{s.value}</dd>
              {s.k === 'spend' ? (
                <p className="mt-1 text-xs text-(--yt-on-dark-2)">{t('myTrip.estimated')}</p>
              ) : null}
            </div>
          ))}
        </dl>

        {trip.days.length > 0 ? (
          <JourneyMemoryTimeline
            trip={trip}
            tripPhaseInfo={tripPhaseInfo}
            placesById={placesById}
          />
        ) : null}

        <div className="mt-20 rounded-[2rem] border border-dashed border-white/25 p-8 sm:p-12">
          <h3 className="font-display text-2xl font-medium">{t('myTrip.story.memoriesTitle')}</h3>
          <p className="mt-3 max-w-2xl leading-relaxed text-(--yt-on-dark-2)">
            {t('myTrip.story.memoriesBody')}
          </p>
          {trip.status !== 'cancelled' ? (
            <Link
              to={`/trip/${trip.id}`}
              className="mt-6 inline-flex h-12 items-center rounded-full bg-(--yt-lime) px-7 text-sm font-semibold text-(--yt-green) transition-transform hover:-translate-y-0.5"
            >
              {t('myTrip.story.addNotes')}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
