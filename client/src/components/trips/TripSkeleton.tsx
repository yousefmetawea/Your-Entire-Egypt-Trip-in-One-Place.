import { useTranslation } from 'react-i18next';
import { Container } from '../ui/Container';
import { Section } from '../ui/Section';
import { Skeleton } from '../ui/Skeleton';

export function TripSkeleton() {
  const { t } = useTranslation();

  return (
    <Section
      tone="canvas"
      spacing="none"
      className="min-h-screen py-space-2xl"
      aria-busy="true"
      aria-labelledby="trip-loading-heading"
    >
      <Container>
        <h1 id="trip-loading-heading" className="sr-only">
          {t('trip.states.loading')}
        </h1>
        <p className="sr-only" role="status" aria-live="polite">
          {t('trip.states.loading')}
        </p>

        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="mt-space-md h-12 w-full max-w-2xl" />
        <div className="mt-space-md flex flex-wrap gap-space-sm">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="mt-space-md h-4 w-full max-w-3xl" />

        <div className="mt-space-xl grid grid-cols-1 gap-gutter-lg lg:grid-cols-12">
          <div className="space-y-gutter-lg lg:col-span-8">
            {Array.from({ length: 2 }, (_, index) => (
              <div
                key={index}
                className="rounded-card border border-hairline bg-surface-container-lowest p-space-lg"
              >
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-space-sm h-8 w-48" />
                <div className="mt-space-md space-y-space-sm">
                  <Skeleton className="h-24 w-full rounded-xl" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-4">
            <div className="rounded-card border border-hairline bg-surface-container-lowest p-space-lg">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-space-sm h-8 w-2/3" />
              <div className="mt-space-md space-y-space-sm">
                {Array.from({ length: 5 }, (_, index) => (
                  <Skeleton key={index} className="h-5 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
