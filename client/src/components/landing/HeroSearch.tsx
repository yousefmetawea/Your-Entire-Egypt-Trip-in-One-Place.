import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { createDiscoverHref } from '../../lib/discover';
import { Button } from '../ui/Button';
import { CalendarIcon, SearchIcon, UsersIcon } from '../ui/icons';

export interface HeroSearchProps {
  from: string;
  to: string;
  travelers: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onTravelersChange: (value: string) => void;
}

export function HeroSearch({
  from,
  to,
  travelers,
  onFromChange,
  onToChange,
  onTravelersChange,
}: HeroSearchProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fieldId = useId();
  const [query, setQuery] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    navigate(
      createDiscoverHref({
        filters: { q: query },
        context: { from, to, travelers },
      }),
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-[24px] border border-hairline bg-surface p-space-xs sm:p-space-sm shadow-floating"
    >
      <div className="grid grid-cols-1 gap-space-xs md:grid-cols-2 lg:grid-cols-12 items-center">
        {/* Destination / Where (4 cols) */}
        <div className="md:col-span-2 lg:col-span-4 flex items-center gap-space-sm rounded-xl px-space-md py-space-sm bg-surface-container-low/50 hover:bg-surface-container-low/80 focus-within:bg-surface-container-low/90 focus-within:ring-1 focus-within:ring-secondary transition-all border border-hairline/40">
          <SearchIcon className="size-5 shrink-0 text-secondary" />
          <div className="min-w-0 flex-1">
            <label
              htmlFor={`${fieldId}-where`}
              className="type-label-sm block text-on-surface-variant uppercase tracking-wider font-semibold text-[11px]"
            >
              {t('home.hero.search.whereLabel')}
            </label>
            <input
              id={`${fieldId}-where`}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('home.hero.search.wherePlaceholder')}
              autoComplete="off"
              className="w-full min-w-0 bg-transparent font-sans text-sm sm:text-base text-primary placeholder:text-on-surface-variant/60 focus:outline-none"
            />
          </div>
        </div>

        {/* Date: From / Arrival (2 cols) */}
        <div className="md:col-span-1 lg:col-span-2 flex items-center gap-space-sm rounded-xl px-space-md py-space-sm bg-surface-container-low/50 hover:bg-surface-container-low/80 focus-within:bg-surface-container-low/90 focus-within:ring-1 focus-within:ring-secondary transition-all border border-hairline/40">
          <CalendarIcon className="size-5 shrink-0 text-secondary" />
          <div className="min-w-0 flex-1">
            <label
              htmlFor={`${fieldId}-from`}
              className="type-label-sm block text-on-surface-variant uppercase tracking-wider font-semibold text-[11px]"
            >
              {t('home.hero.search.fromLabel')}
            </label>
            <input
              id={`${fieldId}-from`}
              type="date"
              value={from}
              onChange={(event) => onFromChange(event.target.value)}
              className="w-full min-w-0 bg-transparent font-sans text-xs sm:text-sm text-primary focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Date: To / Departure (2 cols) */}
        <div className="md:col-span-1 lg:col-span-2 flex items-center gap-space-sm rounded-xl px-space-md py-space-sm bg-surface-container-low/50 hover:bg-surface-container-low/80 focus-within:bg-surface-container-low/90 focus-within:ring-1 focus-within:ring-secondary transition-all border border-hairline/40">
          <CalendarIcon className="size-5 shrink-0 text-secondary" />
          <div className="min-w-0 flex-1">
            <label
              htmlFor={`${fieldId}-to`}
              className="type-label-sm block text-on-surface-variant uppercase tracking-wider font-semibold text-[11px]"
            >
              {t('home.hero.search.toLabel')}
            </label>
            <input
              id={`${fieldId}-to`}
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => onToChange(event.target.value)}
              className="w-full min-w-0 bg-transparent font-sans text-xs sm:text-sm text-primary focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Travelers / Guests (2 cols) */}
        <div className="md:col-span-1 lg:col-span-2 flex items-center gap-space-sm rounded-xl px-space-md py-space-sm bg-surface-container-low/50 hover:bg-surface-container-low/80 focus-within:bg-surface-container-low/90 focus-within:ring-1 focus-within:ring-secondary transition-all border border-hairline/40">
          <UsersIcon className="size-5 shrink-0 text-secondary" />
          <div className="min-w-0 flex-1">
            <label
              htmlFor={`${fieldId}-travelers`}
              className="type-label-sm block text-on-surface-variant uppercase tracking-wider font-semibold text-[11px]"
            >
              {t('home.hero.search.travelersLabel')}
            </label>
            <input
              id={`${fieldId}-travelers`}
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              value={travelers}
              onChange={(event) => onTravelersChange(event.target.value)}
              placeholder={t('home.hero.search.travelersPlaceholder')}
              className="w-full min-w-0 bg-transparent font-sans text-sm sm:text-base text-primary placeholder:text-on-surface-variant/60 focus:outline-none"
            />
          </div>
        </div>

        {/* Action Button (2 cols) */}
        <div className="md:col-span-1 lg:col-span-2 flex items-center">
          <Button
            type="submit"
            size="md"
            startIcon={<SearchIcon />}
            className="w-full h-full min-h-[52px] justify-center text-sm font-semibold tracking-wide"
          >
            {t('home.hero.search.submit')}
          </Button>
        </div>
      </div>
    </form>
  );
}
