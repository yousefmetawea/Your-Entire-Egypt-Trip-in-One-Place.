import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AppLink } from '../../app/AppLink';
import { staggerContainer, staggerItem } from '../../lib/motion';
import { createPlanHref } from '../../lib/planner/prefill';
import { ArchPattern } from '../common/ArchPattern';
import { Badge } from '../ui/Badge';
import { ButtonLink } from '../ui/Button';
import { ArrowRightIcon, CompassIcon, InfoIcon, LandmarkIcon, MapPinIcon } from '../ui/icons';
import { HeroSearch } from './HeroSearch';
import { SplitText } from '../motion/SplitText';

const stats = [
  { key: 'areas', Icon: CompassIcon },
  { key: 'places', Icon: LandmarkIcon },
  { key: 'categories', Icon: MapPinIcon },
  { key: 'labels', Icon: InfoIcon },
] as const;

export function Hero() {
  const { t } = useTranslation();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [travelers, setTravelers] = useState('');

  return (
    <section className="relative isolate -mt-24 flex min-h-[46rem] flex-col justify-between overflow-hidden bg-primary text-on-primary md:-mt-28 md:min-h-[52rem]">
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_16%,rgba(214,169,107,0.22),transparent_45%),radial-gradient(circle_at_14%_86%,rgba(214,169,107,0.18),transparent_45%)]" />
        <ArchPattern variant="hero" className="text-secondary/15" />
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-primary via-primary/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/40 to-primary/80" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-page flex-1 flex-col justify-center px-gutter-sm pb-space-xl pt-36 md:px-margin-md md:pt-44 lg:px-margin-lg">
        <motion.div
          className="max-w-3xl"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={staggerItem}>
            <Badge tone="glass-dark" dot size="md">
              {t('home.hero.badge')}
            </Badge>
          </motion.div>

          <div className="type-display mt-space-lg text-surface-container-lowest leading-[1.08]">
            <SplitText as="h1" delay={0.1}>
              {t('home.hero.title')}
            </SplitText>{' '}
            <span className="italic text-secondary-fixed inline-block">
              <SplitText delay={0.28}>{t('home.hero.titleAccent')}</SplitText>
            </span>
          </div>

          <motion.p
            variants={staggerItem}
            className="type-body-lg mt-space-md max-w-2xl text-surface-container-high/90 leading-relaxed font-sans"
          >
            {t('home.hero.description')}
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-space-xl w-full max-w-[71rem]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <HeroSearch
            from={from}
            to={to}
            travelers={travelers}
            onFromChange={setFrom}
            onToChange={setTo}
            onTravelersChange={setTravelers}
          />
        </motion.div>

        <motion.div
          className="mt-space-md flex flex-wrap items-center gap-space-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <ButtonLink
            as={AppLink}
            href={createPlanHref({ from, to, travelers })}
            variant="inverse"
            size="md"
            endIcon={<ArrowRightIcon className="rtl:rotate-180" />}
          >
            {t('home.hero.search.plan')}
          </ButtonLink>

          <p className="type-small flex items-center gap-space-xs text-surface-container-high/75">
            <span className="size-1.5 rounded-full bg-secondary-fixed" aria-hidden="true" />
            {t('home.hero.demo')}
          </p>
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-page px-gutter-sm pb-space-xl md:px-margin-md lg:px-margin-lg">
        <div className="flex flex-wrap items-center justify-between gap-space-sm rounded-[1.5rem] border border-sand/20 bg-primary/90 px-space-lg py-space-sm text-surface-container-low shadow-floating backdrop-blur-md sm:rounded-full">
          {stats.map(({ key, Icon }, index) => (
            <div key={key} className="flex items-center gap-space-sm">
              {index > 0 ? (
                <span
                  className="me-space-sm hidden size-1.5 rounded-full bg-secondary/30 md:block"
                  aria-hidden="true"
                />
              ) : null}
              <Icon className="size-4 text-secondary-fixed" />
              <span className="type-title-sm text-surface-container-lowest font-sans">
                {t(`home.hero.stats.${key}`)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
