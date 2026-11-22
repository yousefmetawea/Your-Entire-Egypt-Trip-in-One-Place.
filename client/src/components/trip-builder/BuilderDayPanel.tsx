import { useTranslation } from 'react-i18next';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Place, PlaceId, TripActivity, TripDay } from '../../types';
import type { ActivityPatch } from '../../lib/builder/editor';
import { getActivityPlace } from '../../lib/builder/display';
import { getDayTiming } from '../../lib/builder/summary';
import { formatIsoDate } from '../../lib/date';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { AlertTriangleIcon, PlusIcon } from '../ui/icons';
import { ActivityCard } from './ActivityCard';

export interface BuilderDayPanelProps {
  day: TripDay;
  dayNumber: number;
  days: TripDay[];
  placesById: ReadonlyMap<PlaceId, Place>;
  onAddActivity: () => void;
  onUpdateActivity: (dayId: string, activityId: string, patch: ActivityPatch) => void;
  onMoveActivity: (activityId: string, fromDayId: string, toDayId: string, toIndex: number) => void;
  onRequestRemoveActivity: (day: TripDay, activity: TripActivity) => void;
}

export function BuilderDayPanel({
  day,
  dayNumber,
  days,
  placesById,
  onAddActivity,
  onUpdateActivity,
  onMoveActivity,
  onRequestRemoveActivity,
}: BuilderDayPanelProps) {
  const { t } = useTranslation();
  const date = formatIsoDate(day.date) ?? day.date;
  const timing = getDayTiming(day);
  const activityIds = day.activities.map((activity) => activity.id);
  const hasScheduleWarning = timing.hasOrderIssue || timing.hasOverlap;

  function handleSave(activityId: string, patch: ActivityPatch, targetDayId: string): void {
    onUpdateActivity(day.id, activityId, patch);

    if (targetDayId === day.id) {
      return;
    }

    const targetDay = days.find((item) => item.id === targetDayId);

    if (targetDay) {
      onMoveActivity(activityId, day.id, targetDay.id, targetDay.activities.length);
    }
  }

  return (
    <Card
      as="section"
      variant="surface"
      padding="none"
      role="tabpanel"
      id={`builder-day-panel-${day.id}`}
      aria-labelledby={`builder-day-tab-${day.id}`}
      tabIndex={0}
      className="overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
    >
      <div className="flex flex-wrap items-start justify-between gap-space-md border-b border-hairline p-space-lg">
        <div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <p className="type-label text-secondary">
              {t('trip.builder.dayTabs.day', { number: dayNumber })}
            </p>
            <Badge tone="outline" size="sm">
              {t('trip.builder.dayTabs.activityCount', { count: day.activities.length })}
            </Badge>
          </div>
          <h2 className="type-section mt-space-xs text-primary">{date}</h2>
          <p className="type-small mt-space-xs max-w-xl text-on-surface-variant">
            {t('trip.builder.dayPanel.description')}
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onAddActivity}
          startIcon={<PlusIcon />}
        >
          {t('trip.builder.dayPanel.addActivity')}
        </Button>
      </div>

      {hasScheduleWarning || timing.missingStartCount > 0 ? (
        <div className="mx-space-lg mt-space-lg rounded-xl bg-secondary-fixed/30 p-space-md">
          <p className="type-label-sm flex items-center gap-space-xs text-on-secondary-fixed-variant">
            <AlertTriangleIcon className="size-4 shrink-0" />
            {t('trip.builder.dayPanel.scheduleTitle')}
          </p>
          <ul className="mt-space-xs list-disc space-y-0.5 ps-space-lg type-small text-on-secondary-fixed-variant">
            {timing.missingStartCount > 0 ? (
              <li>
                {t('trip.builder.dayPanel.missingStart', {
                  count: timing.missingStartCount,
                })}
              </li>
            ) : null}
            {timing.hasOrderIssue ? <li>{t('trip.builder.dayPanel.orderIssue')}</li> : null}
            {timing.hasOverlap ? <li>{t('trip.builder.dayPanel.overlap')}</li> : null}
          </ul>
        </div>
      ) : null}

      <div className="p-space-lg">
        {day.activities.length > 0 ? (
          <SortableContext items={activityIds} strategy={verticalListSortingStrategy}>
            <ol className="space-y-space-sm" aria-label={t('trip.days.activitiesLabel', { date })}>
              {day.activities.map((activity, index) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  day={day}
                  days={days}
                  index={index}
                  place={getActivityPlace(activity, placesById)}
                  onSave={handleSave}
                  onRequestRemove={(item) => onRequestRemoveActivity(day, item)}
                />
              ))}
            </ol>
          </SortableContext>
        ) : (
          <div className="rounded-xl border border-dashed border-hairline-strong bg-surface-container-low/60 px-space-lg py-space-xl text-center">
            <p className="type-title-md text-primary">{t('trip.builder.dayPanel.emptyTitle')}</p>
            <p className="type-small mx-auto mt-space-xs max-w-md text-on-surface-variant">
              {t('trip.builder.dayPanel.emptyDescription')}
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onAddActivity}
              startIcon={<PlusIcon />}
              className="mt-space-md"
            >
              {t('trip.builder.dayPanel.addActivity')}
            </Button>
          </div>
        )}

        {day.activities.length > 0 ? (
          <button
            type="button"
            onClick={onAddActivity}
            className="mt-space-sm flex w-full items-center justify-center gap-space-xs rounded-xl border border-dashed border-hairline-strong px-space-md py-space-md type-label-sm text-on-surface-variant transition-colors hover:border-secondary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
          >
            <PlusIcon className="size-4" />
            {t('trip.builder.dayPanel.addAnother')}
          </button>
        ) : null}
      </div>
    </Card>
  );
}
