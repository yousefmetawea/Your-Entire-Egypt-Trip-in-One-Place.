import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { createDiscoverHref } from '../../lib/discover';
import { Button } from '../ui/Button';
import { CalendarIcon, SearchIcon, UsersIcon } from '../ui/icons';

const fieldClasses =
  'min-w-0 w-full rounded-sm bg-transparent font-sans text-body-md text-on-surface placeholder:text-on-surface-variant/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary';

const segmentClasses =
  'flex min-w-0 items-center gap-space-sm rounded-xl px-space-md py-space-sm transition-colors hover:bg-surface-container-low/60 focus-within:bg-surface-container-low/60';

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
      className="w-full rounded-[20px] border border-hairline-strong/60 bg-surface-container-lowest/95 p-space-xs shadow-[0_20px_48px_-12px_rgba(6,6,7,0.35)] backdrop-blur-xl md:p-space-sm"
    >
      <div className="flex flex-col gap-space-xs lg:flex-row lg:items-center">
        <div className={`${segmentClasses} flex-1`}>
          <SearchIcon className="size-5 shrink-0 text-secondary" />
          <div className="min-w-0 flex-1">
            <label
              htmlFor={`${fieldId}-where`}
              className="type-label block text-on-surface-variant"
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
              className={fieldClasses}
            />
          </div>
        </div>

        <span
          className="hidden h-10 w-px shrink-0 bg-surface-variant lg:block"
          aria-hidden="true"
        />

        <div className={`${segmentClasses} lg:w-72`}>
          <CalendarIcon className="size-5 shrink-0 text-secondary" />
          <div className="min-w-0 flex-1">
            <span className="type-label block text-on-surface-variant">
              {t('home.hero.search.datesLabel')}
            </span>
            <div className="flex flex-col gap-space-xs sm:flex-row sm:items-center">
              <input
                type="date"
                aria-label={t('home.hero.search.fromLabel')}
                value={from}
                onChange={(event) => onFromChange(event.target.value)}
                className={fieldClasses}
              />
              <span className="hidden text-on-surface-variant sm:inline" aria-hidden="true">
                –
              </span>
              <input
                type="date"
                aria-label={t('home.hero.search.toLabel')}
                value={to}
                min={from || undefined}
                onChange={(event) => onToChange(event.target.value)}
                className={fieldClasses}
              />
            </div>
          </div>
        </div>

        <span
          className="hidden h-10 w-px shrink-0 bg-surface-variant lg:block"
          aria-hidden="true"
        />

        <div className={`${segmentClasses} lg:w-48`}>
          <UsersIcon className="size-5 shrink-0 text-secondary" />
          <div className="min-w-0 flex-1">
            <label
              htmlFor={`${fieldId}-travelers`}
              className="type-label block text-on-surface-variant"
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
              className={fieldClasses}
            />
          </div>
        </div>

        <Button type="submit" size="md" startIcon={<SearchIcon />} className="lg:ms-space-xs">
          {t('home.hero.search.submit')}
        </Button>
      </div>
    </form>
  );
}
