import { useTranslation } from 'react-i18next';
import { Container } from '../ui/Container';
import { Section } from '../ui/Section';
import { Skeleton } from '../ui/Skeleton';

export function PlaceDetailsSkeleton() {
  const { t } = useTranslation();

  return (
    <Section
      tone="canvas"
      spacing="none"
      className="pb-space-2xl"
      aria-busy="true"
      aria-labelledby="place-loading-heading"
    >
      <Container className="pt-space-lg">
        <h1 id="place-loading-heading" className="sr-only">
          {t('placeDetails.states.loading')}
        </h1>
        <p className="sr-only" role="status" aria-live="polite">
          {t('placeDetails.states.loading')}
        </p>

        <Skeleton className="h-8 w-72 max-w-full rounded-full" />

        <div className="mt-space-lg space-y-space-md">
          <div className="flex flex-wrap gap-space-xs">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-14 w-full max-w-4xl md:h-20" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>

        <div className="mt-space-lg grid grid-cols-1 gap-space-md rounded-card border border-hairline bg-surface-container-lowest p-space-md sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex items-start gap-space-sm">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="flex-1 space-y-space-xs">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          ))}
        </div>

        <Skeleton className="mt-space-xl h-[420px] w-full rounded-card md:h-[580px]" />

        <div className="mt-space-2xl grid grid-cols-1 gap-gutter-lg lg:grid-cols-12">
          <div className="space-y-gutter-lg lg:order-2 lg:col-span-4">
            <div className="space-y-space-md rounded-card border border-hairline bg-surface-container-lowest p-space-lg">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-7 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-12 w-full rounded-full" />
            </div>
          </div>
          <div className="space-y-gutter-lg lg:order-1 lg:col-span-8">
            {Array.from({ length: 2 }, (_, index) => (
              <div
                key={index}
                className="space-y-space-md rounded-card border border-hairline bg-surface-container-lowest p-space-xl"
              >
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
