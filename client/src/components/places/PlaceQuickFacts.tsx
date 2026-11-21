import { useTranslation } from 'react-i18next';
import type { Place } from '../../types';
import { cn } from '../../lib/cn';
import { getAreaLabelKey, getCategoryLabelKey, getDurationLabel } from '../../lib/catalog';
import { formatTime, getOpeningHoursRows, summarizeOpeningHours } from '../../lib/placeDetails';
import { Card } from '../ui/Card';
import { CalendarIcon, ClockIcon, CompassIcon, MapPinIcon } from '../ui/icons';

export interface PlaceQuickFactsProps {
  place: Place;
  className?: string;
}

export function PlaceQuickFacts({ place, className }: PlaceQuickFactsProps) {
  const { t } = useTranslation();
  const duration = getDurationLabel(place.avgVisitMinutes);
  const hoursRows = getOpeningHoursRows(place.openingHours);
  const hoursSummary = summarizeOpeningHours(hoursRows);
  const hoursText = (() => {
    if (!hoursSummary) {
      return t('placeDetails.practical.hoursMissing');
    }

    if (hoursSummary.kind === 'daily') {
      return t('placeDetails.practical.daily', {
        opens: formatTime(hoursSummary.opens) ?? hoursSummary.opens,
        closes: formatTime(hoursSummary.closes) ?? hoursSummary.closes,
      });
    }

    return t('placeDetails.practical.seeWeekly');
  })();

  const facts = [
    {
      label: t('placeDetails.practical.areaLabel'),
      value: t(getAreaLabelKey(place.area)),
      icon: MapPinIcon,
    },
    {
      label: t('placeDetails.practical.durationLabel'),
      value: duration
        ? t(duration.key, duration.values)
        : t('placeDetails.practical.durationMissing'),
      icon: ClockIcon,
    },
    {
      label: t('placeDetails.practical.hoursLabel'),
      value: hoursText,
      icon: CalendarIcon,
    },
    {
      label: t('placeDetails.practical.categoryLabel'),
      value: t(getCategoryLabelKey(place.category)),
      icon: CompassIcon,
    },
  ];

  return (
    <Card
      variant="surface"
      padding="md"
      className={cn('mt-space-lg', className)}
      aria-label={t('placeDetails.practical.quickFactsLabel')}
    >
      <dl className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((fact) => {
          const Icon = fact.icon;

          return (
            <div key={fact.label} className="flex items-start gap-space-sm">
              <span
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary-fixed/40 text-secondary"
                aria-hidden="true"
              >
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <dt className="type-label text-on-surface-variant">{fact.label}</dt>
                <dd className="type-title-sm mt-space-xs text-primary">{fact.value}</dd>
              </div>
            </div>
          );
        })}
      </dl>
    </Card>
  );
}
