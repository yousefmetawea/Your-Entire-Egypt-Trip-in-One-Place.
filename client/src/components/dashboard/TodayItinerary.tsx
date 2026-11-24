import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { Place, Trip, TripActivity, TripDay } from '../../types';
import type { TripPhaseInfo } from '../../lib/dashboard/tripPhase';
import { formatIsoDate } from '../../lib/date';
import { Badge } from '../ui/Badge';
import { ClockIcon, MapPinIcon } from '../ui/icons';

export interface TodayItineraryProps {
  trip: Trip;
  tripPhaseInfo: TripPhaseInfo;
  places: Place[];
}

export function TodayItinerary({ trip, tripPhaseInfo, places }: TodayItineraryProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  // Allow user to switch day view (defaults to the active day calculated by tripPhaseInfo)
  const defaultDayIndex = tripPhaseInfo.dayNumber ? tripPhaseInfo.dayNumber - 1 : 0;
  const [selectedDayIndex, setSelectedDayIndex] = useState(
    Math.min(trip.days.length - 1, Math.max(0, defaultDayIndex)),
  );

  const currentDay: TripDay | undefined = trip.days[selectedDayIndex];
  const placesMap = new Map(places.map((p) => [p.id, p]));

  const getDayHeading = () => {
    if (tripPhaseInfo.phase === 'before') {
      return {
        eyebrow: 'Upcoming Itinerary Preview',
        title: `Day ${selectedDayIndex + 1} Preview`,
        date: currentDay?.date ? formatIsoDate(currentDay.date) : null,
      };
    }
    if (tripPhaseInfo.phase === 'during') {
      const isToday = selectedDayIndex === defaultDayIndex;
      return {
        eyebrow: isToday ? 'Active Timeline' : `Day ${selectedDayIndex + 1} Timeline`,
        title: isToday
          ? `Today at a Glance (Day ${selectedDayIndex + 1} of ${trip.days.length})`
          : `Day ${selectedDayIndex + 1} of ${trip.days.length}`,
        date: currentDay?.date ? formatIsoDate(currentDay.date) : null,
      };
    }
    return {
      eyebrow: 'Completed Journey',
      title: `Day ${selectedDayIndex + 1} Summary`,
      date: currentDay?.date ? formatIsoDate(currentDay.date) : null,
    };
  };

  const headingInfo = getDayHeading();

  return (
    <div className="flex flex-col gap-space-md">
      {/* Timeline Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-xs border-b border-hairline/60">
        <div>
          <span className="type-label-sm uppercase tracking-widest text-secondary font-semibold">
            {headingInfo.eyebrow}
          </span>
          <h2 className="font-serif text-2xl text-primary tracking-tight font-medium mt-0.5">
            {headingInfo.title}
            {headingInfo.date && (
              <span className="font-sans text-sm font-normal text-on-surface-variant ms-2">
                ({headingInfo.date})
              </span>
            )}
          </h2>
        </div>

        {/* Day Switcher Pills if multiple days */}
        {trip.days.length > 1 && (
          <div
            className="flex items-center gap-1 bg-surface-container rounded-full p-1 self-start sm:self-auto overflow-x-auto max-w-full"
            role="tablist"
            aria-label="Itinerary day switcher"
          >
            {trip.days.map((day, idx) => {
              const isSelected = idx === selectedDayIndex;
              return (
                <button
                  key={day.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`px-3 py-1 rounded-full type-label-sm text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
                  }`}
                >
                  D{idx + 1}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Activities Timeline */}
      {!currentDay || currentDay.activities.length === 0 ? (
        <div className="p-space-xl rounded-[20px] bg-surface-container-lowest text-center border border-hairline/60 flex flex-col items-center justify-center gap-space-sm">
          <p className="type-body text-on-surface-variant max-w-md">
            No activities scheduled for this day yet.
          </p>
          <Link
            to={`/trip/${trip.id}`}
            className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-high hover:bg-secondary hover:text-on-secondary transition-all type-label text-xs font-medium text-primary"
          >
            Add Activities in Itinerary Builder
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-space-sm relative">
          {/* Vertical timeline connecting line */}
          <div
            className="absolute left-6 top-6 bottom-6 w-0.5 bg-surface-variant -z-0 hidden sm:block"
            aria-hidden="true"
          />

          {currentDay.activities.map((activity: TripActivity, index: number) => {
            const place =
              activity.source.type === 'place' ? placesMap.get(activity.source.placeId) : null;

            const title =
              activity.source.type === 'place'
                ? isAr && place?.name.ar
                  ? place.name.ar
                  : (place?.name.en ?? 'Place Activity')
                : activity.source.title;

            const timeLabel = activity.startTime ? activity.startTime : 'Time not set';
            const durationLabel = activity.durationMin
              ? `${activity.durationMin} min`
              : 'Duration not set';

            return (
              <div
                key={activity.id}
                className="group relative z-10 flex flex-col sm:flex-row items-start gap-space-md p-space-md sm:p-space-lg rounded-[20px] bg-surface-container-lowest shadow-xs hover:shadow-sm transition-all border border-hairline/40"
              >
                {/* Time Badge */}
                <div className="flex sm:flex-col items-center gap-2 min-w-[64px] text-center shrink-0">
                  <span
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-medium text-xs shadow-xs ${
                      activity.startTime
                        ? 'bg-secondary-fixed text-on-secondary-fixed'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {timeLabel}
                  </span>
                  <span className="type-label-sm uppercase text-[10px] text-on-surface-variant">
                    {durationLabel}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="type-label-sm uppercase tracking-wider text-secondary font-semibold text-[11px]">
                      Stop {index + 1}
                      {place?.category ? ` · ${place.category}` : ''}
                    </span>

                    {activity.estimatedCost && (
                      <Badge tone="neutral" size="sm">
                        Estimated: {activity.estimatedCost.amount} {activity.estimatedCost.currency}
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-serif text-lg text-primary font-medium group-hover:text-secondary transition-colors">
                    {place ? (
                      <Link
                        to={`/places/${place.slug}`}
                        className="hover:underline focus-visible:outline-2 focus-visible:outline-secondary"
                      >
                        {title}
                      </Link>
                    ) : (
                      title
                    )}
                  </h3>

                  {place?.description?.en && (
                    <p className="type-body text-xs text-on-surface-variant line-clamp-2">
                      {place.description.en}
                    </p>
                  )}

                  {activity.notes && (
                    <p className="type-small text-on-surface-variant italic mt-1 bg-surface-container-low p-2 rounded-lg">
                      Note: {activity.notes}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-space-md pt-space-xs text-xs text-on-surface-variant">
                    {place?.area && (
                      <span className="inline-flex items-center gap-1">
                        <MapPinIcon className="size-3.5 text-secondary" />
                        <span className="capitalize">{place.area.replace('-', ' ')}</span>
                      </span>
                    )}

                    {activity.durationMin && (
                      <span className="inline-flex items-center gap-1">
                        <ClockIcon className="size-3.5 text-secondary" />
                        <span>{activity.durationMin} minutes visit</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Link to Full Builder */}
      <div className="pt-space-xs text-end">
        <Link
          to={`/trip/${trip.id}`}
          className="type-label text-xs text-secondary hover:text-primary transition-colors inline-flex items-center gap-1 font-semibold"
        >
          View &amp; Edit Full Itinerary in Builder &rarr;
        </Link>
      </div>
    </div>
  );
}
