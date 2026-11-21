import { useTranslation } from 'react-i18next';
import { AppLink } from '../../app/AppLink';
import { usePlaces } from '../../hooks/useCatalog';
import { selectFeaturedPlaces } from '../../lib/featured';
import { EmptyState } from '../common/EmptyState';
import { SectionHeader } from '../common/SectionHeader';
import { Reveal } from '../motion/Reveal';
import { PlaceCard, PlaceCardSkeleton } from '../places/PlaceCard';
import { Button, ButtonLink } from '../ui/Button';
import { Container } from '../ui/Container';
import { Section } from '../ui/Section';
import { ArrowRightIcon } from '../ui/icons';

const cardSpans = [
  'md:col-span-6 lg:col-span-7',
  'md:col-span-6 lg:col-span-5',
  'md:col-span-6 lg:col-span-4',
  'md:col-span-6 lg:col-span-4',
  'md:col-span-12 lg:col-span-4',
] as const;

export function FeaturedPlaces() {
  const { t } = useTranslation();
  const { data: places, status, retry } = usePlaces();
  const featured = selectFeaturedPlaces(places);

  return (
    <Section tone="canvas" spacing="md" aria-labelledby="featured-heading">
      <Container>
        <SectionHeader
          eyebrow={t('home.featured.eyebrow')}
          title={t('home.featured.title')}
          description={t('home.featured.description')}
          id="featured-heading"
          action={
            <ButtonLink
              as={AppLink}
              href="/discover"
              variant="ghost"
              size="sm"
              endIcon={<ArrowRightIcon className="rtl:rotate-180" />}
            >
              {t('home.featured.action')}
            </ButtonLink>
          }
        />

        <p className="type-small mt-space-md text-on-surface-variant">
          {t('home.featured.demoNote')}
        </p>

        {status === 'loading' ? (
          <>
            <p className="sr-only" role="status" aria-live="polite">
              {t('home.featured.loading')}
            </p>
            <div className="mt-space-xl grid grid-cols-1 gap-gutter-lg md:grid-cols-12">
              {cardSpans.map((span, index) => (
                <PlaceCardSkeleton
                  key={`${span}-${index}`}
                  variant={index < 2 ? 'feature' : 'compact'}
                  className={span}
                />
              ))}
            </div>
          </>
        ) : status === 'error' ? (
          <EmptyState
            title={t('home.featured.errorTitle')}
            description={t('home.featured.errorDescription')}
            role="alert"
            className="mt-space-xl"
            actions={
              <Button variant="secondary" size="sm" onClick={retry}>
                {t('home.featured.retry')}
              </Button>
            }
          />
        ) : featured.length === 0 ? (
          <EmptyState
            title={t('home.featured.emptyTitle')}
            description={t('home.featured.emptyDescription')}
            className="mt-space-xl"
            actions={
              <ButtonLink
                as={AppLink}
                href="/discover"
                variant="primary"
                size="sm"
                endIcon={<ArrowRightIcon className="rtl:rotate-180" />}
              >
                {t('home.featured.action')}
              </ButtonLink>
            }
          />
        ) : (
          <Reveal className="mt-space-xl">
            <div className="grid grid-cols-1 gap-gutter-lg md:grid-cols-12">
              {featured.map((place, index) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  variant={index < 2 ? 'feature' : 'compact'}
                  priority={index < 2}
                  className={cardSpans[index]}
                />
              ))}
            </div>
          </Reveal>
        )}
      </Container>
    </Section>
  );
}
