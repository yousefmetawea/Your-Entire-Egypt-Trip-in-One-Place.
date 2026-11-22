import { useTranslation } from 'react-i18next';
import type { Place, PlaceId, TripDay } from '../../types';
import { getActivityPlace, getActivityTitle } from '../../lib/builder/display';
import { formatTime } from '../../lib/placeDetails';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { MapPinIcon } from '../ui/icons';

export interface BuilderMapProps {
  day: TripDay;
  dayNumber: number;
  placesById: ReadonlyMap<PlaceId, Place>;
}

const maxVisibleStops = 5;

export function BuilderMap({ day, dayNumber, placesById }: BuilderMapProps) {
  const { t } = useTranslation();
  const visibleStops = day.activities.slice(0, maxVisibleStops);
  const hiddenCount = day.activities.length - visibleStops.length;

  return (
    <Card variant="surface" padding="lg" className="flex flex-col gap-space-md">
      <div className="flex items-start justify-between gap-space-sm">
        <div>
          <p className="type-label text-secondary">{t('trip.builder.map.eyebrow')}</p>
          <h2 className="type-card-title mt-space-xs text-primary">
            {t('trip.builder.map.title', { day: dayNumber })}
          </h2>
        </div>
        <Badge tone="outline" size="sm">
          {t('trip.builder.map.badge')}
        </Badge>
      </div>

      <div
        className="relative overflow-hidden rounded-2xl border border-hairline bg-surface-container-low p-space-md"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(119, 89, 40, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(119, 89, 40, 0.08) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      >
        <p className="type-label-sm flex items-center gap-space-xs text-on-surface-variant">
          <MapPinIcon className="size-4 text-secondary" />
          {t('trip.builder.map.orderLabel')}
        </p>

        {visibleStops.length > 0 ? (
          <ol className="relative mt-space-md space-y-space-sm">
            <span
              className="absolute start-[0.9375rem] top-4 bottom-4 border-s border-dashed border-secondary/50"
              aria-hidden="true"
            />
            {visibleStops.map((activity, index) => {
              const place = getActivityPlace(activity, placesById);
              const title =
                getActivityTitle(activity, place) ??
                (activity.source.type === 'place'
                  ? t('trip.activity.placeUnavailable')
                  : t('trip.builder.activities.untitled'));
              const time = formatTime(activity.startTime);

              return (
                <li key={activity.id} className="relative flex items-start gap-space-sm">
                  <span className="relative z-[1] inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-secondary/40 bg-surface-container-lowest type-label-sm text-primary shadow-resting">
                    {index + 1}
                  </span>
                  <span className="min-w-0 rounded-lg bg-surface-container-lowest/90 px-space-sm py-space-xs shadow-resting">
                    <span className="type-small block break-words text-primary">{title}</span>
                    {time ? (
                      <span className="type-small block text-on-surface-variant">{time}</span>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="type-small mt-space-md rounded-xl bg-surface-container-lowest/90 p-space-md text-on-surface-variant">
            {t('trip.builder.map.empty')}
          </p>
        )}

        {hiddenCount > 0 ? (
          <p className="type-small mt-space-sm text-on-surface-variant">
            {t('trip.builder.map.more', { count: hiddenCount })}
          </p>
        ) : null}
      </div>

      <p className="type-small text-on-surface-variant">{t('trip.builder.map.description')}</p>
      <p className="type-small text-on-surface-variant">{t('trip.builder.map.orderNote')}</p>
    </Card>
  );
}
