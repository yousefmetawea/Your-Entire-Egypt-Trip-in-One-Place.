import { useRef } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import type { CairoArea, PlaceCategory } from '../../types';
import {
  DURATION_FILTERS,
  EGYPT_AREAS,
  PLACE_CATEGORIES,
  getAreaLabelKey,
  getCategoryLabelKey,
  getDurationFilterLabelKey,
} from '../../lib/catalog';
import type { DurationFilter } from '../../lib/catalog';
import type { DiscoverState } from '../../lib/discover';
import { hasActiveFilters } from '../../lib/discover';
import type { CategoryChipValue } from '../places/CategoryChips';
import { cn } from '../../lib/cn';
import { ChevronDownIcon, CloseIcon, SearchIcon } from '../ui/icons';

export interface DiscoverToolbarProps {
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

function countActive(state: DiscoverState): number {
  const f = state.filters;
  return [f.q.trim(), f.category, f.area, f.duration].filter(Boolean).length;
}

interface PillSelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function PillSelect({ label, value, options, onChange }: PillSelectProps) {
  const active = value !== '';
  return (
    <label className="relative block">
      <span className="mb-1.5 block px-1 text-[0.68rem] font-semibold tracking-[0.18em] text-(--yt-ink-2) uppercase">
        {label}
      </span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            'h-12 w-full cursor-pointer appearance-none rounded-full border bg-white/60 ps-5 pe-11 text-sm font-medium text-(--yt-green) transition-colors',
            active
              ? 'border-(--yt-green) bg-(--yt-lime)/40'
              : 'border-(--yt-green)/15 hover:border-(--yt-green)/40',
          )}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-(--yt-green)"
        />
      </span>
    </label>
  );
}

export function DiscoverToolbar({
  state,
  defaultQuery,
  resultCount,
  totalCount,
  onSearch,
  onCategoryChange,
  onAreaChange,
  onDurationChange,
  onClear,
}: DiscoverToolbarProps) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const formRef = useRef<HTMLFormElement>(null);
  const activeCount = countActive(state);
  const selectedCategory: CategoryChipValue = state.filters.category ?? 'all';

  function handleSearch(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const query = String(data.get('q') ?? '').trim();
    if (!query) event.currentTarget.reset();
    onSearch(query);
  }

  function handleClear(): void {
    formRef.current?.reset();
    onClear();
  }

  const categories: { value: CategoryChipValue; label: string }[] = [
    { value: 'all', label: t('home.chips.all') },
    ...PLACE_CATEGORIES.map((category: PlaceCategory) => ({
      value: category,
      label: t(getCategoryLabelKey(category)),
    })),
  ];

  const areaOptions = [
    { value: '', label: t('discover.filters.allAreas') },
    ...EGYPT_AREAS.map((area) => ({ value: area, label: t(getAreaLabelKey(area)) })),
  ];
  const durationOptions = [
    { value: '', label: t('discover.filters.allDurations') },
    ...DURATION_FILTERS.map((d) => ({ value: d, label: t(getDurationFilterLabelKey(d)) })),
  ];

  return (
    <section aria-labelledby="discover-filters-heading" className="relative">
      <h2 id="discover-filters-heading" className="sr-only">
        {t('discover.filters.title')}
      </h2>

      <form
        ref={formRef}
        onSubmit={handleSearch}
        role="search"
        className="flex flex-col gap-3 sm:flex-row"
      >
        <label className="relative block flex-1">
          <span className="sr-only">{t('discover.filters.searchLabel')}</span>
          <SearchIcon
            aria-hidden="true"
            className="pointer-events-none absolute start-5 top-1/2 size-5 -translate-y-1/2 text-(--yt-ink-2)"
          />
          <input
            key={defaultQuery}
            name="q"
            type="search"
            defaultValue={defaultQuery}
            placeholder={t('discover.filters.searchPlaceholder')}
            autoComplete="off"
            className="h-14 w-full rounded-full border border-(--yt-green)/15 bg-white/70 ps-13 pe-5 text-base text-(--yt-green) placeholder:text-(--yt-ink-2) focus:border-(--yt-green)"
          />
        </label>
        <button
          type="submit"
          className="h-14 shrink-0 cursor-pointer rounded-full bg-(--yt-green) px-8 text-sm font-semibold text-(--yt-on-dark) transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          {t('discover.filters.submit')}
        </button>
      </form>

      <div
        role="group"
        aria-label={t('discover.filters.categoryLabel')}
        className="yt-noscroll -mx-gutter-sm mt-6 flex gap-2 overflow-x-auto px-gutter-sm pb-1 md:mx-0 md:flex-wrap md:px-0"
      >
        {categories.map((category) => {
          const selected = selectedCategory === category.value;
          return (
            <button
              key={category.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onCategoryChange(category.value)}
              className={cn(
                'relative isolate shrink-0 cursor-pointer rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors',
                selected
                  ? 'border-transparent text-(--yt-green)'
                  : 'border-(--yt-green)/20 text-(--yt-green) hover:border-(--yt-green)/50',
              )}
            >
              {selected ? (
                <motion.span
                  layoutId="yt-category-indicator"
                  transition={
                    reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 36 }
                  }
                  className="absolute inset-0 -z-10 rounded-full bg-(--yt-lime)"
                />
              ) : null}
              {category.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:max-w-2xl">
        <PillSelect
          label={t('discover.filters.areaLabel')}
          value={state.filters.area ?? ''}
          options={areaOptions}
          onChange={(v) => onAreaChange((v || null) as CairoArea | null)}
        />
        <PillSelect
          label={t('discover.filters.durationLabel')}
          value={state.filters.duration ?? ''}
          options={durationOptions}
          onChange={(v) => onDurationChange((v || null) as DurationFilter | null)}
        />
      </div>
      <p className="mt-2 px-1 text-xs text-(--yt-ink-2)">{t('discover.filters.durationNote')}</p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-(--yt-green)/15 pt-4">
        <div className="flex flex-wrap items-center gap-3">
          {resultCount !== null ? (
            <p className="text-sm font-medium text-(--yt-green)" aria-live="polite">
              {t('discover.filters.resultCount', {
                shown: resultCount,
                total: totalCount,
                count: totalCount,
              })}
            </p>
          ) : null}
          <motion.span
            key={activeCount}
            initial={reduce || activeCount === 0 ? false : { scale: 0.85, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
              activeCount > 0
                ? 'bg-(--yt-green) text-(--yt-on-dark)'
                : 'bg-(--yt-sage) text-(--yt-ink-2)',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'size-1.5 rounded-full',
                activeCount > 0 ? 'bg-(--yt-lime)' : 'bg-(--yt-ink-2)/50',
              )}
            />
            {activeCount > 0
              ? t('discover.toolbar.active', { count: activeCount })
              : t('discover.toolbar.none')}
          </motion.span>
        </div>
        <button
          type="button"
          onClick={handleClear}
          disabled={!hasActiveFilters(state.filters)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-(--yt-green) underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
        >
          <CloseIcon className="size-4" />
          {t('discover.filters.clear')}
        </button>
      </div>
    </section>
  );
}
