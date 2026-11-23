import { useRef } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { CairoArea } from '../../types';
import {
  EGYPT_AREAS,
  DURATION_FILTERS,
  getAreaLabelKey,
  getDurationFilterLabelKey,
} from '../../lib/catalog';
import type { DurationFilter } from '../../lib/catalog';
import type { DiscoverState } from '../../lib/discover';
import { hasActiveFilters } from '../../lib/discover';
import { CategoryChips } from '../places/CategoryChips';
import type { CategoryChipValue } from '../places/CategoryChips';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { CloseIcon, SearchIcon } from '../ui/icons';

export interface DiscoverFiltersProps {
  state: DiscoverState;
  defaultQuery: string;
  resultCount: number | null;
  totalCount: number;
  onSearch: (query: string) => void;
  onCategoryChange: (value: CategoryChipValue) => void;
  onAreaChange: (area: CairoArea | null) => void;
  onDurationChange: (duration: DurationFilter | null) => void;
  onClear: () => void;
}

export function DiscoverFilters({
  state,
  defaultQuery,
  resultCount,
  totalCount,
  onSearch,
  onCategoryChange,
  onAreaChange,
  onDurationChange,
  onClear,
}: DiscoverFiltersProps) {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSearch(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const query = String(data.get('q') ?? '').trim();

    if (!query) {
      event.currentTarget.reset();
    }

    onSearch(query);
  }

  function handleClear(): void {
    formRef.current?.reset();
    onClear();
  }

  const areaOptions = [
    { value: '', label: t('discover.filters.allAreas') },
    ...EGYPT_AREAS.map((area) => ({
      value: area,
      label: t(getAreaLabelKey(area)),
    })),
  ];

  const durationOptions = [
    { value: '', label: t('discover.filters.allDurations') },
    ...DURATION_FILTERS.map((duration) => ({
      value: duration,
      label: t(getDurationFilterLabelKey(duration)),
    })),
  ];

  return (
    <Card
      as="section"
      variant="surface"
      padding="lg"
      aria-labelledby="discover-filters-heading"
      className="mt-space-xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <h2 id="discover-filters-heading" className="type-title text-primary">
          {t('discover.filters.title')}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={!hasActiveFilters(state.filters)}
          startIcon={<CloseIcon />}
        >
          {t('discover.filters.clear')}
        </Button>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSearch}
        className="mt-space-lg flex flex-col gap-space-sm md:flex-row md:items-end"
      >
        <Input
          key={defaultQuery}
          name="q"
          label={t('discover.filters.searchLabel')}
          type="search"
          defaultValue={defaultQuery}
          placeholder={t('discover.filters.searchPlaceholder')}
          autoComplete="off"
          startIcon={<SearchIcon />}
          containerClassName="flex-1"
        />
        <Button type="submit" size="md" startIcon={<SearchIcon />}>
          {t('discover.filters.submit')}
        </Button>
      </form>

      <div className="mt-space-lg">
        <p className="type-label mb-space-sm text-on-surface-variant">
          {t('discover.filters.categoryLabel')}
        </p>
        <CategoryChips value={state.filters.category ?? 'all'} onChange={onCategoryChange} />
      </div>

      <div className="mt-space-lg grid gap-space-md md:grid-cols-2">
        <Select
          label={t('discover.filters.areaLabel')}
          value={state.filters.area ?? ''}
          options={areaOptions}
          onChange={(event) => onAreaChange((event.target.value || null) as CairoArea | null)}
        />
        <Select
          label={t('discover.filters.durationLabel')}
          value={state.filters.duration ?? ''}
          options={durationOptions}
          hint={t('discover.filters.durationNote')}
          onChange={(event) =>
            onDurationChange((event.target.value || null) as DurationFilter | null)
          }
        />
      </div>

      {resultCount !== null ? (
        <p
          className="type-small mt-space-lg border-t border-hairline pt-space-md text-on-surface-variant"
          aria-live="polite"
        >
          {t('discover.filters.resultCount', {
            shown: resultCount,
            total: totalCount,
            count: totalCount,
          })}
        </p>
      ) : null}
    </Card>
  );
}
