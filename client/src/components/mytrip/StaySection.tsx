import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import type { Accommodation, Trip } from '../../types';
import { computeStaySummary } from '../../lib/builder/summary';
import { fmtDate, fmtMoney, fmtNumber } from '../../lib/mytrip/format';
import { ArrowRightIcon, BedIcon, CheckIcon } from '../ui/icons';
import { SectionHeading } from './shared';

function StayImage({ accommodation, alt }: { accommodation: Accommodation; alt: string }) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  const src = accommodation.images[0]?.src;
  const real = Boolean(src) && !accommodation.placeholders.includes('images') && !failed;
  if (!real) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-(--yt-forest) text-center text-(--yt-on-dark-2)">
        <div>
          <BedIcon className="mx-auto size-10 text-(--yt-lime)" />
          <p className="mt-3 text-sm">{t('myTrip.stay.noPhoto')}</p>
        </div>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      width={1200}
      height={800}
      onError={() => setFailed(true)}
      className="size-full object-cover transition-transform duration-700 group-hover/stay:scale-[1.04] motion-reduce:group-hover/stay:scale-100"
    />
  );
}

export function StaySection({
  trip,
  accommodation,
}: {
  trip: Trip;
  accommodation: Accommodation | null;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isAr = lang === 'ar';
  const reduce = useReducedMotion();
  const name = accommodation
    ? isAr && accommodation.name.ar
      ? accommodation.name.ar
      : accommodation.name.en
    : '';
  const alt = accommodation?.images[0]?.alt
    ? isAr && accommodation.images[0].alt.ar
      ? accommodation.images[0].alt.ar
      : accommodation.images[0].alt.en
    : name;
  const summary = accommodation
    ? computeStaySummary(trip, accommodation.name.en, accommodation.priceRange)
    : null;

  return (
    <section aria-labelledby="mt-stay-heading" className="py-20 md:py-28">
      <div className="mx-auto w-full max-w-page px-gutter-sm md:px-margin-md lg:px-margin-lg">
        <SectionHeading
          id="mt-stay-heading"
          eyebrow={t('myTrip.stay.eyebrow')}
          title={t('myTrip.stay.title')}
          aside={
            <Link
              to="/stay-transport?tab=accommodation"
              className="inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
            >
              {accommodation ? t('myTrip.stay.change') : t('myTrip.stay.browse')}
              <ArrowRightIcon className="size-4 rtl:rotate-180" />
            </Link>
          }
        />
        {!accommodation ? (
          <div className="mt-10 rounded-[2rem] border border-dashed border-(--yt-green)/30 p-10 text-center">
            <BedIcon className="mx-auto size-8 text-(--yt-ink-2)" />
            <p className="mt-3 text-(--yt-ink-2)">{t('myTrip.stay.none')}</p>
            <Link
              to="/stay-transport?tab=accommodation"
              className="mt-5 inline-flex h-12 items-center rounded-full bg-(--yt-green) px-7 text-sm font-semibold text-(--yt-on-dark)"
            >
              {t('myTrip.stay.select')}
            </Link>
          </div>
        ) : (
          <motion.article
            initial={reduce ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="group/stay mt-10 grid overflow-hidden rounded-[2rem] bg-(--yt-green) text-(--yt-on-dark) lg:grid-cols-12"
          >
            <div className="relative aspect-[16/10] overflow-hidden lg:col-span-7 lg:aspect-auto lg:min-h-[28rem]">
              <StayImage accommodation={accommodation} alt={alt} />
            </div>
            <div className="flex flex-col justify-between p-8 sm:p-10 lg:col-span-5">
              <div>
                <p className="flex flex-wrap items-center gap-3 text-xs font-semibold tracking-[0.2em] text-(--yt-lime) uppercase">
                  <span>{t(`myTrip.stay.type.${accommodation.type}`)}</span>
                  <span className="rounded-full bg-white/10 px-3 py-1 tracking-wider text-(--yt-on-dark)">
                    {t('myTrip.stay.status')}
                  </span>
                </p>
                <h3 className="mt-4 font-display text-3xl leading-tight font-medium sm:text-4xl rtl:leading-snug">
                  {name}
                </h3>
                <dl className="mt-8 space-y-5">
                  <div>
                    <dt className="text-[0.68rem] font-semibold tracking-[0.2em] text-(--yt-on-dark-2) uppercase">
                      {t('myTrip.stay.dates')}
                    </dt>
                    <dd className="mt-1 font-medium">
                      {fmtDate(trip.startDate, lang)} – {fmtDate(trip.endDate, lang)}
                      {summary?.nights ? (
                        <span className="ms-2 text-(--yt-on-dark-2)">
                          · {t('myTrip.stay.nights', { count: summary.nights })}
                        </span>
                      ) : null}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[0.68rem] font-semibold tracking-[0.2em] text-(--yt-on-dark-2) uppercase">
                      {t('myTrip.stay.price')}
                    </dt>
                    <dd className="mt-1">
                      {accommodation.priceRange ? (
                        <>
                          <span className="font-display text-3xl">
                            {fmtMoney(
                              accommodation.priceRange.min,
                              accommodation.priceRange.currency,
                              lang,
                            )}{' '}
                            – {fmtNumber(accommodation.priceRange.max, lang)}
                          </span>
                          <span className="ms-2 text-sm text-(--yt-on-dark-2)">
                            {t('myTrip.stay.perNight')} · {t('myTrip.estimated')}
                          </span>
                          {summary?.estimatedTotalMin ? (
                            <p className="mt-1 text-sm text-(--yt-on-dark-2)">
                              {t('myTrip.stay.totalFrom', {
                                total: fmtMoney(
                                  summary.estimatedTotalMin,
                                  accommodation.priceRange.currency,
                                  lang,
                                ),
                              })}
                            </p>
                          ) : null}
                        </>
                      ) : (
                        <span className="text-(--yt-on-dark-2)">{t('myTrip.stay.noPrice')}</span>
                      )}
                    </dd>
                  </div>
                </dl>
                {accommodation.amenities.length > 0 ? (
                  <ul className="mt-6 flex flex-wrap gap-2" aria-label={t('myTrip.stay.amenities')}>
                    {accommodation.amenities.map((a) => (
                      <li
                        key={a}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-xs"
                      >
                        <CheckIcon className="size-3.5 text-(--yt-lime)" />
                        {a}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <div className="mt-10 border-t border-white/15 pt-6">
                <p className="text-sm text-(--yt-on-dark-2)">{t('myTrip.stay.statusNote')}</p>
                {accommodation.externalUrl ? (
                  <a
                    href={accommodation.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex h-12 items-center gap-2 rounded-full bg-(--yt-lime) px-7 text-sm font-semibold text-(--yt-green) transition-transform hover:-translate-y-0.5"
                  >
                    {t('myTrip.stay.provider')}
                    <ArrowRightIcon className="size-4 rtl:rotate-180" />
                  </a>
                ) : (
                  <p className="mt-4 text-sm italic text-(--yt-on-dark-2)">
                    {t('myTrip.stay.noLink')}
                  </p>
                )}
              </div>
            </div>
          </motion.article>
        )}
      </div>
    </section>
  );
}
