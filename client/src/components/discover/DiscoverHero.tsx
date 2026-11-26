import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import type { Place } from '../../types';
import { cn } from '../../lib/cn';
import { getAreaLabelKey, getCategoryLabelKey } from '../../lib/catalog';
import { SplitText } from '../motion/SplitText';
import { PlaceMedia } from '../places/PlaceMedia';
import { ArrowRightIcon } from '../ui/icons';

export interface DiscoverHeroProps {
  totalCount: number;
  /** Real catalog places to feature. Empty while loading. */
  featured: Place[];
}

const CYCLE_MS = 6000;

function placeName(place: Place, isAr: boolean): string {
  return isAr && place.name.ar ? place.name.ar : place.name.en;
}

export function DiscoverHero({ totalCount, featured }: DiscoverHeroProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const ghostX = useTransform(scrollYProgress, [0, 1], ['0%', '-8%']);
  const photoY = useTransform(scrollYProgress, [0, 1], ['0%', '6%']);

  const count = featured.length;
  useEffect(() => {
    if (reduce || paused || count < 2) return undefined;
    const id = window.setInterval(() => setActive((i) => (i + 1) % count), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [reduce, paused, count]);

  const current = featured[Math.min(active, Math.max(count - 1, 0))];

  return (
    <header
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-(--yt-forest) pt-28 pb-24 text-(--yt-on-dark) md:pt-32 md:pb-28"
    >
      {/* Oversized decorative type */}
      <motion.div
        aria-hidden="true"
        dir="ltr"
        style={reduce ? undefined : { x: ghostX }}
        className="pointer-events-none absolute inset-x-0 top-24 -z-10 select-none whitespace-nowrap text-center font-display text-[26vw] leading-none font-semibold tracking-tighter text-(--yt-on-dark) opacity-[0.045] md:top-20"
      >
        YOURTRIP
      </motion.div>

      <div className="mx-auto w-full max-w-page px-gutter-sm md:px-margin-md lg:px-margin-lg">
        <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold tracking-[0.22em] text-(--yt-lime) uppercase">
              <span className="inline-block h-px w-8 bg-(--yt-lime)" aria-hidden="true" />
              <span>{t('discover.hero.location')}</span>
              <span aria-hidden="true">·</span>
              <span>{t('discover.hero.countLabel', { count: totalCount })}</span>
            </p>
            <h1
              id="discover-heading"
              className="mt-6 font-display text-[2.6rem] leading-[1.05] font-medium tracking-tight text-(--yt-on-dark) sm:text-6xl lg:text-[4.25rem] rtl:leading-[1.25]"
            >
              <SplitText>{t('discover.title')}</SplitText>
            </h1>
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 max-w-md text-base leading-relaxed text-(--yt-on-dark-2)"
            >
              {t('discover.description')}
            </motion.p>
            <motion.p
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-3 text-sm text-(--yt-on-dark-2)/80"
            >
              {t('discover.demoNote')}
            </motion.p>
          </div>

          <div className="lg:col-span-7">
            {current ? (
              <div
                className="yt-clip-in relative aspect-[4/3] overflow-hidden rounded-3xl bg-(--yt-green) sm:aspect-[16/10]"
                onPointerEnter={() => setPaused(true)}
                onPointerLeave={() => setPaused(false)}
              >
                <motion.div
                  style={reduce ? undefined : { y: photoY }}
                  className="absolute inset-0 scale-110"
                >
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={current.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: reduce ? 0 : 1.1, ease: 'easeInOut' }}
                      className="absolute inset-0"
                    >
                      <PlaceMedia
                        place={current}
                        priority
                        sizes="(min-width: 1024px) 58vw, 100vw"
                        className="size-full"
                      />
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-linear-to-t from-(--yt-forest)/85 via-(--yt-forest)/10 to-transparent"
                />
                <Link
                  to={`/places/${current.slug}`}
                  className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7"
                >
                  <span>
                    <span className="block text-[0.7rem] font-semibold tracking-[0.2em] text-(--yt-lime) uppercase [text-shadow:0_1px_10px_rgba(16,28,21,0.9)]">
                      {t(getAreaLabelKey(current.area))} ·{' '}
                      {t(getCategoryLabelKey(current.category))}
                    </span>
                    <span className="mt-1 block font-display text-2xl font-medium text-(--yt-on-dark) sm:text-4xl rtl:leading-snug">
                      {placeName(current, isAr)}
                    </span>
                  </span>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-(--yt-lime) text-(--yt-green)">
                    <ArrowRightIcon className="size-5 rtl:rotate-180" />
                  </span>
                </Link>
              </div>
            ) : (
              <div
                className="aspect-[4/3] animate-pulse rounded-3xl bg-(--yt-green)/60 sm:aspect-[16/10]"
                aria-hidden="true"
              />
            )}
          </div>
        </div>

        {count > 0 ? (
          <nav aria-label={t('discover.hero.featuredLabel')} className="mt-10 md:mt-14">
            <p className="mb-4 text-xs font-semibold tracking-[0.22em] text-(--yt-on-dark-2) uppercase">
              {t('discover.hero.featuredLabel')}
            </p>
            <ul className="yt-noscroll -mx-gutter-sm flex snap-x gap-3 overflow-x-auto px-gutter-sm pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-6">
              {featured.map((place, index) => {
                const isActive = index === active;
                return (
                  <li key={place.id} className="w-[62%] shrink-0 snap-start sm:w-[40%] md:w-auto">
                    <Link
                      to={`/places/${place.slug}`}
                      onPointerEnter={(event) => {
                        if (event.pointerType === 'mouse') setActive(index);
                      }}
                      onFocus={() => setActive(index)}
                      className={cn(
                        'group/strip block overflow-hidden rounded-2xl border bg-(--yt-green)/40 transition-transform duration-300 hover:-translate-y-1',
                        isActive ? 'border-(--yt-lime)' : 'border-white/10',
                      )}
                    >
                      <PlaceMedia
                        place={place}
                        sizes="(min-width: 1024px) 16vw, 40vw"
                        className="aspect-[16/10]"
                        imgClassName="group-hover/strip:scale-105"
                      />
                      <span className="relative block px-3 pt-2.5 pb-3">
                        <span className="block truncate text-sm font-medium text-(--yt-on-dark)">
                          {placeName(place, isAr)}
                        </span>
                        <span className="mt-0.5 block truncate text-[0.68rem] tracking-[0.14em] text-(--yt-on-dark-2) uppercase">
                          {t(getAreaLabelKey(place.area))}
                        </span>
                        <span
                          aria-hidden="true"
                          className={cn(
                            'absolute inset-x-3 bottom-0 h-0.5 origin-left bg-(--yt-lime) transition-transform duration-500 rtl:origin-right',
                            isActive ? 'scale-x-100' : 'scale-x-0',
                          )}
                        />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
