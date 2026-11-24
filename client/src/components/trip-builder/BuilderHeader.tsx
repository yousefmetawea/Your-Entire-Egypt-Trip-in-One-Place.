import { useTranslation } from 'react-i18next';
import type { Trip } from '../../types';
import { AppLink } from '../../app/AppLink';
import type { ItinerarySaveStatus } from '../../hooks/useTripEditor';
import { formatIsoDate } from '../../lib/date';
import { getBudgetTierLabelKey, isBudgetTier } from '../../lib/planner/options';
import { Badge } from '../ui/Badge';
import { Button, ButtonLink } from '../ui/Button';
import { SplitText } from '../motion/SplitText';
import {
  AlertTriangleIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  CompassIcon,
  InfoIcon,
  PencilIcon,
  RedoIcon,
  RouteIcon,
  UndoIcon,
  UsersIcon,
} from '../ui/icons';

export interface BuilderHeaderProps {
  trip: Trip;
  canUndo: boolean;
  canRedo: boolean;
  saveStatus: ItinerarySaveStatus;
  onRetrySave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onEditTitle: () => void;
}

function SaveStatus({ status, onRetry }: { status: ItinerarySaveStatus; onRetry: () => void }) {
  const { t } = useTranslation();

  if (status === 'error') {
    return (
      <div
        role="alert"
        className="flex flex-wrap items-center gap-space-sm rounded-full bg-error-container px-space-md py-space-xs text-on-error-container"
      >
        <AlertTriangleIcon className="size-4 shrink-0" />
        <span className="type-small">{t('trip.builder.save.error')}</span>
        <button
          type="button"
          onClick={onRetry}
          className="type-label-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
        >
          {t('trip.builder.save.retry')}
        </button>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="inline-flex items-center gap-space-xs type-small text-on-surface-variant"
    >
      {status === 'saving' ? (
        <ClockIcon className="size-4 animate-pulse text-secondary" />
      ) : (
        <CheckIcon className="size-4 text-success" />
      )}
      {status === 'saving' ? t('trip.builder.save.saving') : t('trip.builder.save.saved')}
    </div>
  );
}

export function BuilderHeader({
  trip,
  canUndo,
  canRedo,
  saveStatus,
  onRetrySave,
  onUndo,
  onRedo,
  onEditTitle,
}: BuilderHeaderProps) {
  const { t } = useTranslation();
  const startDate = formatIsoDate(trip.startDate);
  const endDate = formatIsoDate(trip.endDate);
  const dateText =
    startDate && endDate
      ? t('trip.dateRange', { from: startDate, to: endDate })
      : startDate
        ? t('trip.dateFrom', { date: startDate })
        : endDate
          ? t('trip.dateUntil', { date: endDate })
          : t('trip.summary.notSet');
  const budgetTier = trip.budgetTier && isBudgetTier(trip.budgetTier) ? trip.budgetTier : null;

  return (
    <header>
      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <nav aria-label={t('trip.breadcrumbLabel')}>
          <AppLink
            href="/plan"
            className="type-label inline-flex items-center gap-space-xs text-secondary transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
          >
            <RouteIcon className="size-4" />
            {t('trip.backToPlanner')}
          </AppLink>
        </nav>
        <SaveStatus status={saveStatus} onRetry={onRetrySave} />
      </div>

      <div className="mt-space-lg flex flex-wrap items-center gap-space-sm">
        <Badge tone="outline">{t('trip.draftBadge')}</Badge>
        <Badge tone="bronze">{t('trip.demoBadge')}</Badge>
      </div>

      <p className="type-label mt-space-md text-secondary">{t('trip.builder.eyebrow')}</p>
      <div className="mt-space-sm flex flex-wrap items-start gap-space-sm">
        <h1 id="trip-heading" className="type-display max-w-5xl text-balance text-primary">
          <SplitText as="span">{trip.title}</SplitText>
        </h1>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEditTitle}
          startIcon={<PencilIcon />}
          className="mt-space-xs"
        >
          {t('trip.builder.editTitle')}
        </Button>
      </div>

      <div className="mt-space-md flex flex-wrap items-center gap-x-space-lg gap-y-space-sm type-small text-on-surface-variant">
        <span className="inline-flex items-center gap-space-xs">
          <CalendarIcon className="size-4 text-secondary" />
          {dateText}
        </span>
        <span className="inline-flex items-center gap-space-xs">
          <UsersIcon className="size-4 text-secondary" />
          {t('planner.travelers.summary', { count: trip.travelers })}
        </span>
        {budgetTier ? (
          <span className="inline-flex items-center gap-space-xs">
            <InfoIcon className="size-4 text-secondary" />
            {t(getBudgetTierLabelKey(budgetTier))}
          </span>
        ) : null}
      </div>

      <p className="type-small mt-space-md max-w-3xl text-on-surface-variant">
        {t('trip.builder.demoNote')}
      </p>

      <div className="mt-space-lg flex flex-wrap items-center gap-space-sm">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          startIcon={<UndoIcon />}
        >
          {t('trip.builder.undo')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          startIcon={<RedoIcon />}
        >
          {t('trip.builder.redo')}
        </Button>
        <span
          className="mx-space-xs hidden h-6 w-px bg-hairline-strong sm:block"
          aria-hidden="true"
        />
        <ButtonLink
          as={AppLink}
          href="/discover"
          variant="ghost"
          size="sm"
          startIcon={<CompassIcon />}
        >
          {t('trip.addPlaces')}
        </ButtonLink>
      </div>
    </header>
  );
}
