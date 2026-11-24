import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AppLink } from '../../app/AppLink';
import { usePlaces } from '../../hooks/useCatalog';
import { selectFeaturedPlaces } from '../../lib/featured';
import { ScrollReveal } from '../motion/ScrollReveal';
import { SplitText } from '../motion/SplitText';
import { Container } from '../ui/Container';
import { Section } from '../ui/Section';
import { LuxuryButton } from '../ui/LuxuryButton';
import { ArrowRightIcon } from '../ui/icons';
import { cn } from '../../lib/cn';
import { getPlaceImageSources } from '../../lib/placeImages';
import type { Place } from '../../types';

interface ProjectCardProps {
  place: Place;
  config: { span: string; aspect: string };
  index: number;
}

/**
 * Recreates the exact OVO Legion "Project Animation" (a-81):
 *
 * Continuous scroll-linked 3D perspective rotation:
 * - Entering viewport: rotateX: 14deg, y: 50px, scale: 0.97
 * - Viewport center: rotateX: 0deg, y: 0px, scale: 1.0
 * - Exiting viewport: rotateX: -10deg, y: -30px, scale: 0.98
 */
function ProjectCard({ place, config, index }: ProjectCardProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const shouldReduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.45, 1], [14, 0, -10]);
  const y = useTransform(scrollYProgress, [0, 0.45, 1], [50, 0, -30]);
  const scale = useTransform(scrollYProgress, [0, 0.45, 1], [0.97, 1, 0.98]);

  const title = isAr && place.name.ar ? place.name.ar : place.name.en;
  const region = isAr && place.area ? t(`catalog.areas.${place.area}`, place.area) : place.area;
  const category = t(`catalog.categories.${place.category}`, place.category);
  const { primary: image } = getPlaceImageSources({ slug: place.slug }, place.images[0]?.src);

  return (
    <div ref={cardRef} className={cn('col-span-12', config.span)}>
      <motion.div
        style={{
          perspective: 1200,
          rotateX: shouldReduceMotion ? 0 : rotateX,
          y: shouldReduceMotion ? 0 : y,
          scale: shouldReduceMotion ? 1 : scale,
        }}
        className="transform-gpu"
      >
        <ScrollReveal delay={index * 0.08}>
          <AppLink
            href={`/places/${place.slug}`}
            className="group block overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
          >
            {/* Clean Image Container — ABSOLUTELY NO text over image */}
            <div
              className={cn(
                'w-full overflow-hidden rounded-2xl border border-hairline bg-surface-container-low shadow-sm transition-all duration-700 group-hover:shadow-floating group-hover:border-secondary',
                config.aspect,
              )}
            >
              <img
                src={image || '/images/placeholder.svg'}
                alt={isAr && place.name.ar ? place.name.ar : place.name.en}
                className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                loading={index < 2 ? 'eager' : 'lazy'}
              />
            </div>

            {/* External Details Bar — strictly OUTSIDE image container */}
            <div className="mt-space-md flex flex-wrap items-center justify-between gap-space-xs px-space-xs">
              <div className="flex items-center gap-space-xs">
                <span
                  className="size-2 rounded-full bg-secondary shrink-0 transition-transform duration-300 group-hover:scale-125"
                  aria-hidden="true"
                />
                <h3 className="font-serif text-xl sm:text-2xl text-primary font-medium group-hover:text-secondary transition-colors">
                  {title}
                </h3>
              </div>

              <div className="type-label text-on-surface-variant font-mono text-xs uppercase tracking-wider">
                ( {region} · {category} )
              </div>
            </div>
          </AppLink>
        </ScrollReveal>
      </motion.div>
    </div>
  );
}

export function DestinationsShowcase() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { data: places } = usePlaces();
  const featured = selectFeaturedPlaces(places);

  // Take all 6 nationwide iconic destinations for the asymmetric showcase
  const displayPlaces = featured.slice(0, 6);

  // Asymmetric layout span patterns matching OVO Legion (8/4, 5/7, 7/5)
  const layoutConfigs = [
    { span: 'lg:col-span-8', aspect: 'aspect-[16/10]' },
    { span: 'lg:col-span-4', aspect: 'aspect-[4/5]' },
    { span: 'lg:col-span-5', aspect: 'aspect-[4/5]' },
    { span: 'lg:col-span-7', aspect: 'aspect-[16/10]' },
    { span: 'lg:col-span-7', aspect: 'aspect-[16/10]' },
    { span: 'lg:col-span-5', aspect: 'aspect-[4/5]' },
  ];

  return (
    <Section tone="surface" spacing="md" className="overflow-hidden">
      <Container>
        {/* Header matching OVO Legion "Selected Work" */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-2xl pb-space-lg border-b border-hairline">
          <div>
            <ScrollReveal>
              <span className="type-label-sm uppercase tracking-widest text-secondary font-semibold">
                {isAr ? '(وجهات مختارة)' : '(Curated Destinations)'}
              </span>
            </ScrollReveal>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-primary tracking-tight mt-space-xs">
              <SplitText>{isAr ? 'روائع مصر الخالدة' : 'Iconic Egyptian Sanctuaries'}</SplitText>
            </h2>
          </div>

          <ScrollReveal delay={0.1}>
            <div className="flex items-center gap-space-md">
              <span className="type-label-sm uppercase tracking-wider text-on-surface-variant hidden sm:inline">
                2026 — NATIONWIDE
              </span>
              <LuxuryButton
                href="/discover"
                variant="glass"
                size="sm"
                endIcon={<ArrowRightIcon className="rtl:rotate-180" />}
              >
                {isAr ? 'استكشف كافة الوجهات الـ 26' : 'View All 26 Places'}
              </LuxuryButton>
            </div>
          </ScrollReveal>
        </div>

        {/* Asymmetrical Showcase Grid with 3D Tilt Scroll Animation */}
        <div className="grid grid-cols-1 gap-gutter-lg lg:grid-cols-12 items-start">
          {displayPlaces.map((place, index) => (
            <ProjectCard
              key={place.id}
              place={place}
              config={layoutConfigs[index % layoutConfigs.length]}
              index={index}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
