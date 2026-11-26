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
import { DiscoverHero } from '../components/discover/DiscoverHero';
import { DiscoverToolbar } from '../components/discover/DiscoverToolbar';
import { DiscoverCard } from '../components/discover/DiscoverCard';
import { buildEditorialLayout } from '../components/discover/editorialLayout';
import '../components/discover/discover.css';
import type { CategoryChipValue } from '../components/places/CategoryChips';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { InfoIcon } from '../components/ui/icons';
import { Reveal } from '../components/motion/Reveal';
import { selectFeaturedPlaces } from '../lib/featured';

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

  const featuredPlaces = useMemo(() => {
    const picked = selectFeaturedPlaces(places);
    return picked.length > 0 ? picked : places.slice(0, 6);
  }, [places]);
  const filtersActive = hasActiveFilters(state.filters);
  const layout = useMemo(
    () => buildEditorialLayout(filteredPlaces.length, filtersActive),
    [filteredPlaces.length, filtersActive],
  );

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

  const gridClass =
    'grid grid-cols-1 auto-rows-[22rem] gap-4 md:grid-cols-2 md:auto-rows-[20rem] md:gap-5 lg:grid-cols-12 lg:auto-rows-[17rem]';

  return (
    <div className="yt-discover min-h-screen" aria-busy={status === 'loading'}>
      <DiscoverHero
        totalCount={places.length}
        featured={status === 'ready' ? featuredPlaces : []}
      />

      <section
        aria-label={t('discover.filters.title')}
        className="yt-ivory relative -mt-10 rounded-t-[2.5rem] bg-(--yt-ivory) pt-12 pb-24 text-(--yt-green) md:-mt-12 md:rounded-t-[3.5rem] md:pt-16"
      >
        <Container>
          {contextSummary ? (
            <div className="mb-8 flex flex-wrap items-start gap-3 rounded-2xl bg-(--yt-sage) p-4">
              <span className="rounded-full bg-(--yt-green) px-3 py-1 text-xs font-semibold text-(--yt-on-dark)">
                {t('discover.context.label')}
              </span>
              <p className="text-sm text-(--yt-ink-2)">
                {t('discover.context.note', { summary: contextSummary })}
              </p>
            </div>
          ) : null}

          <DiscoverToolbar
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

          <div className="mt-10">
            {status === 'loading' ? (
              <>
                <p className="sr-only" role="status" aria-live="polite">
                  {t('discover.states.loading')}
                </p>
                <div className={gridClass} aria-hidden="true">
                  {Array.from({ length: 6 }, (_, index) => (
                    <div
                      key={index}
                      className="animate-pulse rounded-3xl bg-(--yt-sage) lg:col-span-4"
                    />
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
              <ul className={gridClass}>
                {filteredPlaces.map((place, index) => {
                  const slot = layout[index];
                  return (
                    <li key={place.id} className={slot.cell}>
                      <Reveal className="h-full" delay={(index % 3) * 0.06}>
                        <DiscoverCard place={place} variant={slot.variant} priority={index < 3} />
                      </Reveal>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Container>
      </section>
    </div>
  );
}
