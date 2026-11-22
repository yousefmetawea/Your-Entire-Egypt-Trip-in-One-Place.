import { useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useDroppable } from '@dnd-kit/core';
import type { TripDay } from '../../types';
import { cn } from '../../lib/cn';
import { formatIsoDate } from '../../lib/date';
import { Button } from '../ui/Button';
import { GripIcon, PlusIcon, TrashIcon } from '../ui/icons';
import { getDayDropId } from './dndIds';

export interface DayTabsProps {
  days: TripDay[];
  selectedDayId: string;
  onSelect: (dayId: string) => void;
  onAddDay: () => void;
  onRequestRemoveLastDay: () => void;
  atDayLimit: boolean;
  isDragging: boolean;
}

interface DayTabProps {
  day: TripDay;
  index: number;
  selected: boolean;
  onSelect: (dayId: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, index: number) => void;
  buttonRef: (element: HTMLButtonElement | null) => void;
  isDragging: boolean;
}

function DayTab({ day, index, selected, onSelect, onKeyDown, buttonRef, isDragging }: DayTabProps) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ id: getDayDropId(day.id) });
  const date = formatIsoDate(day.date) ?? day.date;

  return (
    <button
      ref={(element) => {
        setNodeRef(element);
        buttonRef(element);
      }}
      id={`builder-day-tab-${day.id}`}
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls={`builder-day-panel-${day.id}`}
      tabIndex={selected ? 0 : -1}
      onClick={() => onSelect(day.id)}
      onKeyDown={(event) => onKeyDown(event, index)}
      className={cn(
        'inline-flex min-h-12 shrink-0 items-center gap-space-sm rounded-full border px-space-md py-space-xs text-start font-sans transition-[background-color,border-color,color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary',
        selected
          ? 'border-secondary bg-secondary text-on-secondary shadow-resting'
          : 'border-hairline-strong bg-surface-container-lowest text-on-surface-variant hover:border-secondary/60 hover:text-primary',
        isDragging &&
          (isOver
            ? 'border-secondary bg-secondary-fixed/70 text-on-secondary-fixed ring-2 ring-secondary'
            : 'border-dashed border-secondary/60'),
      )}
    >
      <span className="min-w-0">
        <span className="type-label-sm block whitespace-nowrap">
          {t('trip.builder.dayTabs.day', { number: index + 1 })}
        </span>
        <span
          className={cn(
            'type-small block whitespace-nowrap',
            selected ? 'text-on-secondary/80' : 'text-on-surface-variant',
          )}
        >
          {date}
        </span>
      </span>
      <span
        className={cn(
          'inline-flex min-w-6 items-center justify-center rounded-full px-space-xs py-0.5 type-label-sm',
          selected ? 'bg-on-secondary/15 text-on-secondary' : 'bg-surface-container text-primary',
        )}
      >
        {day.activities.length}
      </span>
    </button>
  );
}

export function DayTabs({
  days,
  selectedDayId,
  onSelect,
  onAddDay,
  onRequestRemoveLastDay,
  atDayLimit,
  isDragging,
}: DayTabsProps) {
  const { t } = useTranslation();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number): void {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const direction =
      event.currentTarget.closest<HTMLElement>('[dir]')?.dir ?? document.documentElement.dir;
    const isRtl = direction === 'rtl';
    let nextIndex: number;

    if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = days.length - 1;
    } else if (event.key === 'ArrowRight') {
      nextIndex = index + (isRtl ? -1 : 1);
    } else {
      nextIndex = index + (isRtl ? 1 : -1);
    }

    nextIndex = (nextIndex + days.length) % days.length;
    const nextDay = days[nextIndex];

    if (!nextDay) {
      return;
    }

    onSelect(nextDay.id);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <div>
      <div className="flex flex-col gap-space-sm xl:flex-row xl:items-center xl:justify-between">
        <div
          role="tablist"
          aria-label={t('trip.builder.dayTabs.label')}
          className="flex max-w-full items-center gap-space-xs overflow-x-auto pb-space-xs scrollbar-none"
        >
          {days.map((day, index) => (
            <DayTab
              key={day.id}
              day={day}
              index={index}
              selected={day.id === selectedDayId}
              onSelect={onSelect}
              onKeyDown={handleKeyDown}
              buttonRef={(element) => {
                tabRefs.current[index] = element;
              }}
              isDragging={isDragging}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-space-xs">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onAddDay}
            disabled={atDayLimit}
            startIcon={<PlusIcon />}
          >
            {t('trip.builder.dayTabs.addDay')}
          </Button>
          {days.length > 1 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRequestRemoveLastDay}
              startIcon={<TrashIcon />}
            >
              {t('trip.builder.dayTabs.removeLastDay')}
            </Button>
          ) : null}
        </div>
      </div>

      <p className="type-small mt-space-xs flex items-start gap-space-xs text-on-surface-variant">
        <GripIcon className="mt-0.5 size-4 shrink-0 text-secondary" />
        <span>
          {isDragging
            ? t('trip.builder.dayTabs.dropHint')
            : atDayLimit
              ? t('trip.builder.dayTabs.dayLimit')
              : t('trip.builder.dayTabs.dragHint')}
        </span>
      </p>
    </div>
  );
}
