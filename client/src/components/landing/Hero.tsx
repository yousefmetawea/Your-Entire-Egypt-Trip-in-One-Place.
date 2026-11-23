import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { createPlanHref } from '../../lib/planner/prefill';
import { Badge } from '../ui/Badge';
import { LuxuryButton } from '../ui/LuxuryButton';
import { ArrowRightIcon } from '../ui/icons';
import { HeroSearch } from './HeroSearch';
import { SplitText } from '../motion/SplitText';
import { Marquee } from '../motion/Marquee';
import { HeroImageDeck } from './HeroImageDeck';

const EGYPT_DESTINATION_TICKER_EN = [
  'Giza & Ancient Cairo',
  'Luxor & The Valley of Kings',
  'Aswan & Philae Island',
  'Siwa Oasis Salt Sanctuaries',
  'White Desert Sculptures',
  'Alexandria Mediterranean Port',
  'Red Sea Coral Reefs',
  'Mount Sinai & Saint Catherine',
];

const EGYPT_DESTINATION_TICKER_AR = [
  'الجيزة والقاهرة التاريخية',
  'الأقصر ووادي الملوك',
  'أسوان ومعبد فيلة',
  'ملاذات سيوة الملحية',
  'منحوتات الصحراء البيضاء',
  'الإسكندرية عروس المتوسط',
  'شعاب البحر الأحمر المرجانية',
  'جبل موسى ودير سانت كاترين',
];

export function Hero() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [travelers, setTravelers] = useState('');

  const marqueeText = isAr
    ? 'استكشف مصر — على طريقتك — رحلات استثنائية تفوق الخيال'
    : 'DISCOVER EGYPT — YOUR WAY — TIMELESS SANCTUARIES — BESPOKE TRAVEL';

  const tickerItems = isAr ? EGYPT_DESTINATION_TICKER_AR : EGYPT_DESTINATION_TICKER_EN;

  return (
    <section className="relative isolate -mt-24 flex min-h-[52rem] flex-col justify-between overflow-hidden bg-surface-container-low text-on-surface md:-mt-28 md:min-h-[58rem]">
      {/* Subtle OVO Ambient Lighting */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,40,43,0.03),transparent_70%)]" />
      </div>

      {/* Infinite Horizontal Typography Marquee Layer (OVO Legion Pattern) */}
      <div className="pointer-events-none absolute inset-x-0 top-24 md:top-28 z-0 overflow-hidden opacity-5 select-none">
        <Marquee
          items={[marqueeText, marqueeText]}
          speed={35}
          className="py-space-xs"
          itemClassName="font-serif text-[4.5rem] sm:text-[6.5rem] md:text-[8.5rem] lg:text-[10rem] font-black uppercase tracking-tight text-primary leading-none"
          separator="·"
        />
      </div>

      {/* Main Asymmetric Hero Composition */}
      <div className="relative z-10 mx-auto flex w-full max-w-page flex-1 flex-col justify-center px-gutter-sm pb-space-xl pt-36 md:px-margin-md md:pt-44 lg:px-margin-lg">
        <div className="grid grid-cols-1 items-center gap-gutter-lg lg:grid-cols-12">
          {/* Left Editorial Headline & Controls */}
          <div className="flex flex-col gap-space-md lg:col-span-7">
            <div>
              <Badge
                tone="outline"
                dot
                size="md"
                className="bg-surface/80 border-hairline text-on-surface font-medium"
              >
                {t('home.hero.badge')}
              </Badge>
            </div>

            <div className="type-display text-primary leading-[1.06] max-w-2xl font-serif">
              <SplitText as="h1" delay={0.1}>
                {t('home.hero.title')}
              </SplitText>{' '}
              <span className="italic text-secondary inline-block">
                <SplitText delay={0.28}>{t('home.hero.titleAccent')}</SplitText>
              </span>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="type-body-lg max-w-xl text-on-surface-variant leading-relaxed font-sans"
            >
              {t('home.hero.description')}
            </motion.p>

            {/* Seamless Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-space-sm w-full max-w-2xl"
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

            {/* CTA with expanding circle hover effect + Trust Disclosure */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-space-xs flex flex-wrap items-center gap-space-md"
            >
              <LuxuryButton
                href={createPlanHref({ from, to, travelers })}
                variant="primary"
                size="md"
                endIcon={<ArrowRightIcon className="rtl:rotate-180" />}
              >
                {t('home.hero.search.plan')}
              </LuxuryButton>

              <p className="type-small flex items-center gap-space-xs text-on-surface-variant">
                <span className="size-1.5 rounded-full bg-secondary" aria-hidden="true" />
                {t('home.hero.demo')}
              </p>
            </motion.div>
          </div>

          {/* Right Layered Animated Image Deck (Highest Priority Reference Pattern) */}
          <div className="flex items-center justify-center lg:col-span-5 mt-space-lg lg:mt-0">
            <HeroImageDeck />
          </div>
        </div>
      </div>

      {/* Moving Regional Ticker Strip across bottom (OVO Legion Partners / Showcase pattern) */}
      <div className="relative z-10 border-t border-hairline bg-surface/90 py-space-sm backdrop-blur-md">
        <Marquee
          items={tickerItems}
          speed={40}
          itemClassName="type-label-sm uppercase tracking-widest text-on-surface-variant font-medium"
          separator="·"
        />
      </div>
    </section>
  );
}
