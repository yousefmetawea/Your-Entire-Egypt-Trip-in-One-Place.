import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Place, TripActivity, TripDay } from '../../types';
import type { ActivityPatch } from '../../lib/builder/editor';
import { getActivityTitle } from '../../lib/builder/display';
import { getAreaLabelKey, getCategoryLabelKey, getDurationLabel } from '../../lib/catalog';
import { formatPriceQuote, formatTime, formatUpdatedDate } from '../../lib/placeDetails';
import { cn } from '../../lib/cn';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { ClockIcon, GripIcon, PencilIcon, TrashIcon } from '../ui/icons';
import { ActivityEditForm } from './ActivityEditForm';

export interface ActivityCardProps {
  activity: TripActivity;
  day: TripDay;
  days: TripDay[];
  index: number;
  place: Place | undefined;
  onSave: (activityId: string, patch: ActivityPatch, targetDayId: string) => void;
  onRequestRemove: (activity: TripActivity) => void;
}

const actionButtonClasses =
  'inline-flex size-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary';

export function ActivityCard({
  activity,
  day,
  days,
  index,
  place,
  onSave,
  onRequestRemove,
}: ActivityCardProps) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id, disabled: editing });
  const title =
    getActivityTitle(activity, place) ??
    (activity.source.type === 'place'
      ? t('trip.activity.placeUnavailable')
      : t('trip.builder.activities.untitled'));
  const time = formatTime(activity.startTime) ?? t('trip.activity.timeMissing');
  const duration = getDurationLabel(activity.durationMin);
  const updated = formatUpdatedDate(activity.estimatedCost?.priceUpdatedAt);
  const isCustom = activity.source.type === 'custom';

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn('relative list-none', isDragging && 'z-10 opacity-60')}
    >
      <Card
        variant="surface"
        padding="md"
        className={cn(
          'border-s-4 border-s-secondary/70 transition-[box-shadow,border-color]',
          isDragging && 'shadow-floating',
          editing && 'border-s-primary',
        )}
      >
        <div className="flex items-start gap-space-sm">
          <div className="flex shrink-0 flex-col items-center gap-space-xs">
            <button
              ref={setActivatorNodeRef}
              type="button"
              {...attributes}
              {...listeners}
              aria-label={t('trip.builder.activities.drag', { title })}
              className={cn(
                actionButtonClasses,
                'cursor-grab touch-none active:cursor-grabbing',
                editing && 'pointer-events-none opacity-40',
              )}
            >
              <GripIcon className="size-4" />
            </button>
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-surface-container-high type-label-sm text-primary">
              {index + 1}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-space-sm">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-space-xs">
                  <span className="type-label-sm inline-flex items-center gap-space-xs text-secondary">
                    <ClockIcon className="size-4" />
                    {time}
                  </span>
                  {duration ? (
                    <span className="type-small text-on-surface-variant">
                      · {t(duration.key, duration.values)}
                    </span>
                  ) : (
                    <span className="type-small text-on-surface-variant">
                      · {t('trip.activity.durationMissing')}
                    </span>
                  )}
                </div>
                <h3 className="type-title-md mt-space-xs break-words text-primary">{title}</h3>
              </div>

              <div className="flex shrink-0 items-center gap-space-xs">
                <button
                  type="button"
                  onClick={() => setEditing((current) => !current)}
                  aria-expanded={editing}
                  aria-label={t('trip.builder.activities.edit', { title })}
                  className={actionButtonClasses}
                >
                  <PencilIcon className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onRequestRemove(activity)}
                  aria-label={t('trip.builder.activities.remove', { title })}
                  className={cn(actionButtonClasses, 'hover:bg-error-container hover:text-error')}
                >
                  <TrashIcon className="size-4" />
                </button>
              </div>
            </div>

            <div className="mt-space-xs flex flex-wrap items-center gap-space-xs">
              {place ? (
                <>
                  <Badge tone="neutral" size="sm">
                    {t(getCategoryLabelKey(place.category))}
                  </Badge>
                  <Badge tone="outline" size="sm">
                    {t(getAreaLabelKey(place.area))}
                  </Badge>
                </>
              ) : (
                <Badge tone={isCustom ? 'bronze' : 'danger'} size="sm">
                  {isCustom
                    ? t('trip.activity.customActivity')
                    : t('trip.activity.placeUnavailableBadge')}
                </Badge>
              )}
            </div>

            <p className="type-small mt-space-sm text-on-surface-variant">
              <span className="type-label-sm text-primary">{t('trip.activity.priceLabel')}:</span>{' '}
              {activity.estimatedCost ? (
                <>
                  {formatPriceQuote(activity.estimatedCost)}
                  {updated ? ` · ${t('trip.activity.lastUpdated', { date: updated })}` : null}
                </>
              ) : (
                t('trip.builder.fields.priceMissing')
              )}
            </p>

            {activity.notes ? (
              <p className="type-small mt-space-xs break-words text-on-surface-variant">
                {activity.notes}
              </p>
            ) : null}
          </div>
        </div>

        {editing ? (
          <ActivityEditForm
            activity={activity}
            day={day}
            days={days}
            onSave={(patch, targetDayId) => {
              onSave(activity.id, patch, targetDayId);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        ) : null}
      </Card>
    </li>
  );
}
