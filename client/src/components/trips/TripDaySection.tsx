import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { Place, PlaceId, TripActivity, TripDay } from '../../types';
import { AppLink } from '../../app/AppLink';
import { getAreaLabelKey, getCategoryLabelKey, getDurationLabel } from '../../lib/catalog';
import { formatIsoDate } from '../../lib/date';
import { formatPriceQuote, formatTime, formatUpdatedDate } from '../../lib/placeDetails';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { ClockIcon } from '../ui/icons';

export interface TripDaySectionProps {
  day: TripDay;
  dayNumber: number;
  placesById: ReadonlyMap<PlaceId, Place>;
}

function ActivityRow({ activity, place }: { activity: TripActivity; place: Place | undefined }) {
  const { t } = useTranslation();
  const duration = getDurationLabel(activity.durationMin);
  const travel = getDurationLabel(activity.travelMin);
  const time = formatTime(activity.startTime) ?? activity.startTime;
  const updated = formatUpdatedDate(activity.estimatedCost?.priceUpdatedAt);
  const customTitle = activity.source.type === 'custom' ? activity.source.title : null;

  return (
    <li className="rounded-xl border border-hairline bg-surface-container-lowest p-space-md">
      <div className="flex flex-col gap-space-sm sm:flex-row sm:items-start">
        <div className="flex shrink-0 items-center gap-space-xs sm:w-24">
          <ClockIcon className="size-4 text-secondary" />
          <span className="type-title-sm text-primary">
            {time || t('trip.activity.timeMissing')}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-space-xs">
            {place ? (
              <AppLink
                href={`/places/${place.slug}`}
                className="type-title-sm text-primary underline-offset-4 transition-colors hover:text-secondary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
              >
                {place.name.en}
              </AppLink>
            ) : (
              <span className="type-title-sm text-primary">
                {customTitle ?? t('trip.activity.placeUnavailable')}
              </span>
            )}

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
              <Badge tone="outline" size="sm">
                {customTitle
                  ? t('trip.activity.customActivity')
                  : t('trip.activity.placeUnavailableBadge')}
              </Badge>
            )}
          </div>

          <div className="mt-space-xs flex flex-wrap gap-x-space-md gap-y-space-xs type-small text-on-surface-variant">
            <span>
              {t('trip.activity.durationLabel')}:{' '}
              {duration ? t(duration.key, duration.values) : t('trip.activity.durationMissing')}
            </span>
            <span>
              {t('trip.activity.travelLabel')}:{' '}
              {travel ? t(travel.key, travel.values) : t('trip.activity.travelMissing')}
            </span>
          </div>

          <div className="mt-space-xs type-small text-on-surface-variant">
            <span className="type-label-sm text-primary">{t('trip.activity.priceLabel')}:</span>{' '}
            {activity.estimatedCost ? (
              <>
                <span>{formatPriceQuote(activity.estimatedCost)}</span>{' '}
                <span>
                  ·{' '}
                  {t('trip.activity.lastUpdated', {
                    date: updated ?? t('trip.activity.lastUpdatedMissing'),
                  })}
                </span>
              </>
            ) : (
              <span>{t('trip.activity.priceMissing')}</span>
            )}
          </div>

          {activity.notes ? (
            <p className="type-small mt-space-xs text-on-surface-variant">{activity.notes}</p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export function TripDaySection({ day, dayNumber, placesById }: TripDaySectionProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const dateLabel = formatIsoDate(day.date) ?? day.date;
  const dayPlaces = day.activities.flatMap((activity) => {
    if (activity.source.type !== 'place') {
      return [];
    }

    const place = placesById.get(activity.source.placeId);
    return place ? [place] : [];
  });
  const area = dayPlaces[0]?.area;

  return (
    <Card as="section" variant="surface" padding="lg" aria-labelledby={headingId}>
      <div className="flex flex-wrap items-start justify-between gap-space-sm">
        <div>
          <p className="type-label text-secondary">
            {t('trip.days.dayLabel', { number: dayNumber })}
          </p>
          <h2 id={headingId} className="type-section mt-space-xs text-primary">
            {dateLabel}
          </h2>
        </div>
        {area ? (
          <Badge tone="outline" size="sm">
            {t(getAreaLabelKey(area))}
          </Badge>
        ) : null}
      </div>

      {day.activities.length === 0 ? (
        <div className="mt-space-md rounded-xl bg-surface-container-low p-space-md">
          <p className="type-title-sm text-primary">{t('trip.days.emptyTitle')}</p>
          <p className="type-small mt-space-xs text-on-surface-variant">
            {t('trip.days.emptyDescription')}
          </p>
        </div>
      ) : (
        <ol
          className="mt-space-md space-y-space-sm"
          aria-label={t('trip.days.activitiesLabel', { date: dateLabel })}
        >
          {day.activities.map((activity) => {
            const place =
              activity.source.type === 'place'
                ? placesById.get(activity.source.placeId)
                : undefined;

            return <ActivityRow key={activity.id} activity={activity} place={place} />;
          })}
        </ol>
      )}
    </Card>
  );
}
