import { useTranslation } from 'react-i18next';
import { AppLink } from '../../app/AppLink';
import { useReadyMadeTrips } from '../../hooks/useCatalog';
import { ArchPattern } from '../common/ArchPattern';
import { EmptyState } from '../common/EmptyState';
import { SectionHeader } from '../common/SectionHeader';
import { TripCarousel } from '../trips/TripCarousel';
import { Button, ButtonLink } from '../ui/Button';
import { Card } from '../ui/Card';
import { Container } from '../ui/Container';
import { Section } from '../ui/Section';
import { Skeleton } from '../ui/Skeleton';
import { ArrowRightIcon, CompassIcon } from '../ui/icons';

export function ReadyMadeTrips() {
  const { t } = useTranslation();
  const { data: trips, status, retry } = useReadyMadeTrips();

  if (status === 'loading') {
    return (
      <Section tone="surface" spacing="md" aria-busy="true">
        <Container>
          <p className="sr-only" role="status" aria-live="polite">
            {t('home.trips.loading')}
          </p>
          <Card variant="surface" padding="lg">
            <div className="space-y-space-md">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-4 w-full max-w-xl" />
              <Skeleton className="h-10 w-40" />
            </div>
          </Card>
        </Container>
      </Section>
    );
  }

  if (status === 'error') {
    return (
      <Section tone="surface" spacing="md">
        <Container>
          <EmptyState
            title={t('home.trips.errorTitle')}
            description={t('home.trips.errorDescription')}
            role="alert"
            icon={<CompassIcon />}
            actions={
              <Button variant="secondary" size="sm" onClick={retry}>
                {t('home.trips.retry')}
              </Button>
            }
          />
        </Container>
      </Section>
    );
  }

  if (trips.length === 0) {
    return (
      <Section tone="surface" spacing="md" aria-labelledby="ready-trips-heading">
        <Container>
          <Card variant="surface" padding="lg" className="overflow-hidden">
            <div className="grid gap-gutter-lg lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <p className="type-label flex items-center gap-space-xs text-secondary">
                  <span className="size-2 rounded-full bg-secondary" aria-hidden="true" />
                  {t('home.trips.eyebrow')}
                </p>
                <h2 id="ready-trips-heading" className="type-headline mt-space-sm text-primary">
                  {t('home.trips.title')}
                </h2>
                <p className="type-body-lg mt-space-sm max-w-xl text-on-surface-variant">
                  {t('home.trips.description')}
                </p>
                <div className="mt-space-lg flex flex-wrap items-center gap-space-sm">
                  <ButtonLink
                    as={AppLink}
                    href="/discover"
                    variant="primary"
                    size="md"
                    endIcon={<ArrowRightIcon className="rtl:rotate-180" />}
                  >
                    {t('home.trips.explore')}
                  </ButtonLink>
                  <ButtonLink as={AppLink} href="/plan" variant="secondary" size="md">
                    {t('home.trips.plan')}
                  </ButtonLink>
                </div>
              </div>

              <div
                className="relative min-h-56 overflow-hidden rounded-card bg-gradient-to-br from-primary-container via-secondary to-sand"
                aria-hidden="true"
              >
                <ArchPattern className="text-sand/35" />
              </div>
            </div>
          </Card>
        </Container>
      </Section>
    );
  }

  return (
    <Section tone="surface" spacing="md" aria-labelledby="ready-trips-heading">
      <Container>
        <SectionHeader
          eyebrow={t('home.trips.eyebrow')}
          title={t('home.trips.readyTitle')}
          description={t('home.trips.readyDescription')}
          id="ready-trips-heading"
        />
        <div className="mt-space-xl">
          <TripCarousel trips={trips} />
        </div>
      </Container>
    </Section>
  );
}
