import { useTranslation } from 'react-i18next';
import { AppLink } from '../../app/AppLink';
import { useReadyMadeTrips } from '../../hooks/useCatalog';
import { ScrollReveal } from '../motion/ScrollReveal';
import { SplitText } from '../motion/SplitText';
import { Container } from '../ui/Container';
import { Section } from '../ui/Section';
import { LuxuryButton } from '../ui/LuxuryButton';
import { ArrowRightIcon, CalendarIcon } from '../ui/icons';

export function CuratedJourneysSection() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { data: trips } = useReadyMadeTrips();

  return (
    <Section tone="canvas" spacing="md" className="border-b border-hairline overflow-hidden">
      <Container>
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-2xl pb-space-lg border-b border-hairline">
          <div>
            <ScrollReveal>
              <span className="type-label-sm uppercase tracking-widest text-secondary font-semibold">
                {isAr ? '(مسارات جاهزة)' : '(Signature Journeys)'}
              </span>
            </ScrollReveal>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-primary tracking-tight mt-space-xs">
              <SplitText>
                {isAr ? 'مسارات متقنة تعبر بك مصر' : 'Curated Itineraries Across Egypt'}
              </SplitText>
            </h2>
          </div>

          <ScrollReveal delay={0.1}>
            <LuxuryButton
              href="/plan"
              variant="primary"
              size="sm"
              endIcon={<ArrowRightIcon className="rtl:rotate-180" />}
            >
              {isAr ? 'صمّم مساراً مخصصاً' : 'Build Custom Itinerary'}
            </LuxuryButton>
          </ScrollReveal>
        </div>

        {/* 3 Asymmetric Journey Cards */}
        <div className="grid grid-cols-1 gap-gutter-lg lg:grid-cols-3">
          {trips.map((trip, index) => {
            const title = isAr && trip.title.ar ? trip.title.ar : trip.title.en;
            const description =
              isAr && trip.description?.ar ? trip.description.ar : trip.description?.en;
            const daysCount = trip.durationDays || trip.days.length;
            const coverImage =
              trip.images?.[0]?.src ||
              'https://images.unsplash.com/photo-1781624617165-1058040d1906?auto=format&fit=crop&w=1200&q=80';

            return (
              <ScrollReveal key={trip.id} delay={index * 0.12} className="h-full">
                <article className="group flex h-full flex-col rounded-2xl border border-hairline bg-surface p-space-lg shadow-sm transition-all duration-500 hover:shadow-floating hover:border-secondary">
                  {/* Clean Image Container — NO text on top of image */}
                  <div className="aspect-[16/10] w-full overflow-hidden rounded-xl bg-surface-container-low border border-hairline/60">
                    <img
                      src={coverImage}
                      alt={title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Content Area — strictly OUTSIDE image */}
                  <div className="mt-space-md flex flex-1 flex-col justify-between">
                    <div>
                      {/* Meta Pills */}
                      <div className="flex flex-wrap items-center gap-space-sm text-xs text-on-surface-variant mb-space-xs">
                        <span className="inline-flex items-center gap-1 font-medium text-secondary">
                          <CalendarIcon className="size-3.5" />
                          {daysCount} {isAr ? 'أيام' : 'Days'}
                        </span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1 font-medium text-primary">
                          {trip.days.length} {isAr ? 'محطات' : 'Stops'}
                        </span>
                      </div>

                      <h3 className="font-serif text-2xl font-medium text-primary group-hover:text-secondary transition-colors">
                        {title}
                      </h3>

                      {description && (
                        <p className="type-body text-sm text-on-surface-variant mt-space-xs line-clamp-3 leading-relaxed">
                          {description}
                        </p>
                      )}
                    </div>

                    {/* Bottom Action */}
                    <div className="mt-space-lg pt-space-md border-t border-hairline/80 flex items-center justify-between">
                      <span className="type-label-sm text-secondary font-semibold">
                        {isAr ? 'قابل للتعديل بالكامل' : '100% Customizable'}
                      </span>
                      <AppLink
                        href={`/trip/${trip.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-secondary transition-colors group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                      >
                        <span>{isAr ? 'استكشف المسار' : 'View Journey'}</span>
                        <ArrowRightIcon className="size-4 rtl:rotate-180" />
                      </AppLink>
                    </div>
                  </div>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
