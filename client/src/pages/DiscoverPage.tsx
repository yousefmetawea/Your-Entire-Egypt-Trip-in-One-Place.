import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import type { CairoArea } from '../types';
import type { DurationFilter } from '../lib/catalog';
import {
  EMPTY_DISCOVER_FILTERS,
  filterPlaces,
  hasActiveFilters,
  parseDiscoverState,
  serializeDiscoverState,
} from '../lib/discover';
import type { DiscoverState } from '../lib/discover';
import { usePlaces } from '../hooks/useCatalog';
import { DiscoverFilters } from '../components/discover/DiscoverFilters';
import type { CategoryChipValue } from '../components/places/CategoryChips';
import { PlaceCard, PlaceCardSkeleton } from '../components/places/PlaceCard';
import { EmptyState } from '../components/common/EmptyState';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { Section } from '../components/ui/Section';
import { InfoIcon } from '../components/ui/icons';
import { SplitText } from '../components/motion/SplitText';

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

function formatDate(value: string): string {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

export default function DiscoverPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const state = useMemo(() => parseDiscoverState(searchParams), [searchParams]);
  const { data: places, status, retry } = usePlaces();

  const filteredPlaces = useMemo(
    () => filterPlaces(places, state.filters),
    [places, state.filters],
  );

  const contextParts = useMemo(() => {
    const parts: string[] = [];

    if (state.context.travelers !== null) {
      parts.push(t('discover.context.travelers', { count: state.context.travelers }));
    }

    if (state.context.from && state.context.to) {
      parts.push(
        t('discover.context.dates', {
          from: formatDate(state.context.from),
          to: formatDate(state.context.to),
        }),
      );
    } else if (state.context.from) {
      parts.push(t('discover.context.from', { date: formatDate(state.context.from) }));
    } else if (state.context.to) {
      parts.push(t('discover.context.until', { date: formatDate(state.context.to) }));
    }

    return parts;
  }, [state.context, t]);

  const contextSummary = contextParts.join(' · ');

  function updateState(next: DiscoverState): void {
    setSearchParams(serializeDiscoverState(next));
  }

  function updateFilters(patch: Partial<DiscoverState['filters']>): void {
    updateState({
      filters: { ...state.filters, ...patch },
      context: state.context,
    });
  }

  function handleSearch(query: string): void {
    updateFilters({ q: query });
  }

  function handleCategoryChange(value: CategoryChipValue): void {
    updateFilters({ category: value === 'all' ? null : value });
  }

  function handleAreaChange(area: CairoArea | null): void {
    updateFilters({ area });
  }

  function handleDurationChange(duration: DurationFilter | null): void {
    updateFilters({ duration });
  }

  function handleClear(): void {
    setSearchParams(
      serializeDiscoverState({
        filters: EMPTY_DISCOVER_FILTERS,
        context: state.context,
      }),
    );
  }

  return (
    <Section
      tone="canvas"
      spacing="md"
      className="min-h-screen"
      aria-labelledby="discover-heading"
      aria-busy={status === 'loading'}
    >
      <Container>
        <div className="flex flex-wrap items-start justify-between gap-space-md">
          <div className="max-w-3xl">
            <p className="type-label flex items-center gap-space-xs text-secondary">
              <span className="size-2 rounded-full bg-secondary" aria-hidden="true" />
              {t('discover.eyebrow')}
            </p>
            <h1 id="discover-heading" className="type-headline mt-space-sm text-primary">
              <SplitText>{t('discover.title')}</SplitText>
            </h1>
            <p className="type-body-lg mt-space-sm max-w-2xl text-on-surface-variant font-sans">
              {t('discover.description')}
            </p>
          </div>
          <Badge tone="outline">{t('discover.demoBadge')}</Badge>
        </div>

        <p className="type-small mt-space-md text-on-surface-variant">{t('discover.demoNote')}</p>

        {contextSummary ? (
          <div className="mt-space-md flex flex-wrap items-start gap-space-sm rounded-card border border-hairline bg-surface-container-lowest p-space-md">
            <Badge tone="bronze" size="sm">
              {t('discover.context.label')}
            </Badge>
            <p className="type-small text-on-surface-variant">
              {t('discover.context.note', { summary: contextSummary })}
            </p>
          </div>
        ) : null}

        <DiscoverFilters
          state={state}
          defaultQuery={state.filters.q}
          resultCount={status === 'ready' ? filteredPlaces.length : null}
          totalCount={places.length}
          onSearch={handleSearch}
          onCategoryChange={handleCategoryChange}
          onAreaChange={handleAreaChange}
          onDurationChange={handleDurationChange}
          onClear={handleClear}
        />

        <div className="mt-space-xl">
          {status === 'loading' ? (
            <>
              <p className="sr-only" role="status" aria-live="polite">
                {t('discover.states.loading')}
              </p>
              <div className="grid grid-cols-1 gap-gutter-lg md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <PlaceCardSkeleton key={index} />
                ))}
              </div>
            </>
          ) : status === 'error' ? (
            <EmptyState
              title={t('discover.states.errorTitle')}
              description={t('discover.states.errorDescription')}
              role="alert"
              icon={<InfoIcon />}
              actions={
                <Button variant="secondary" size="sm" onClick={retry}>
                  {t('discover.states.retry')}
                </Button>
              }
            />
          ) : places.length === 0 ? (
            <EmptyState
              title={t('discover.states.catalogEmptyTitle')}
              description={t('discover.states.catalogEmptyDescription')}
              icon={<InfoIcon />}
              actions={
                <Button variant="secondary" size="sm" onClick={retry}>
                  {t('discover.states.retry')}
                </Button>
              }
            />
          ) : filteredPlaces.length === 0 ? (
            <EmptyState
              title={t('discover.states.emptyTitle')}
              description={t('discover.states.emptyDescription')}
              icon={<InfoIcon />}
              actions={
                <Button variant="secondary" size="sm" onClick={handleClear}>
                  {t('discover.states.clear')}
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-gutter-lg md:grid-cols-2 lg:grid-cols-3">
              {filteredPlaces.map((place, index) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  variant={index === 0 && !hasActiveFilters(state.filters) ? 'feature' : 'compact'}
                  className={
                    index === 0 && !hasActiveFilters(state.filters) ? 'md:col-span-2' : undefined
                  }
                  priority={index < 3}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
