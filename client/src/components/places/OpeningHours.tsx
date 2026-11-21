import { useTranslation } from 'react-i18next';
import type { OpeningHours as OpeningHoursEntry } from '../../types';
import { cn } from '../../lib/cn';
import { formatTime, getOpeningHoursRows, summarizeOpeningHours } from '../../lib/placeDetails';
import { ChevronDownIcon } from '../ui/icons';

export interface OpeningHoursProps {
  hours: readonly OpeningHoursEntry[] | null;
  className?: string;
}

export function OpeningHours({ hours, className }: OpeningHoursProps) {
  const { t } = useTranslation();
  const rows = getOpeningHoursRows(hours);
  const summary = summarizeOpeningHours(rows);
  const summaryText = (() => {
    if (!summary) {
      return t('placeDetails.practical.hoursMissing');
    }

    if (summary.kind === 'daily') {
      return t('placeDetails.practical.daily', {
        opens: formatTime(summary.opens) ?? summary.opens,
        closes: formatTime(summary.closes) ?? summary.closes,
      });
    }

    return t('placeDetails.practical.seeWeekly');
  })();

  return (
    <div className={cn(className)}>
      <p className="type-label text-on-surface-variant">{t('placeDetails.practical.hoursLabel')}</p>

      {rows.length === 0 ? (
        <p className="type-body mt-space-xs text-on-surface-variant">
          {t('placeDetails.practical.hoursMissing')}
        </p>
      ) : (
        <>
          <p className="type-title-sm mt-space-xs text-primary">{summaryText}</p>

          <details className="group mt-space-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-space-sm rounded-xl bg-surface-container-low px-space-md py-space-sm type-label text-on-surface-variant transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary [&::-webkit-details-marker]:hidden">
              <span>{t('placeDetails.practical.viewHours')}</span>
              <ChevronDownIcon className="size-4 shrink-0 text-secondary transition-transform duration-200 group-open:rotate-180" />
            </summary>

            <dl className="mt-space-sm divide-y divide-hairline rounded-xl border border-hairline bg-surface-container-lowest px-space-md">
              {rows.map((row) => {
                const value =
                  row.state === 'closed'
                    ? t('placeDetails.practical.closed')
                    : row.state === 'unknown'
                      ? t('placeDetails.practical.hoursUnavailable')
                      : `${formatTime(row.opens) ?? ''}–${formatTime(row.closes) ?? ''}`;

                return (
                  <div
                    key={row.day}
                    className="flex items-center justify-between gap-space-md py-space-sm"
                  >
                    <dt className="type-small text-on-surface-variant">
                      {t(`placeDetails.weekdays.${row.day}`)}
                    </dt>
                    <dd className="type-small text-primary">{value}</dd>
                  </div>
                );
              })}
            </dl>
          </details>

          {rows.length < 7 ? (
            <p className="type-small mt-space-sm text-on-surface-variant">
              {t('placeDetails.practical.partialNote')}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
