import type { BookingStatusChange } from '../../types';
import { formatIsoDate } from '../../lib/date';

export interface StatusTimelineProps {
  history: BookingStatusChange[];
}

export function StatusTimeline({ history }: StatusTimelineProps) {
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="relative border-s border-hairline-strong ps-space-md ms-space-xs my-space-sm space-y-space-sm">
      {history.map((entry, index) => {
        const dateStr = entry.changedAt.includes('T')
          ? entry.changedAt.split('T')[0]
          : entry.changedAt;
        const timeStr = entry.changedAt.includes('T')
          ? entry.changedAt.split('T')[1].slice(0, 5)
          : '';

        return (
          <div key={index} className="relative flex flex-col gap-0.5">
            <span
              className="absolute -start-[1.4375rem] top-1.5 size-2 rounded-full bg-secondary"
              aria-hidden="true"
            />
            <div className="flex items-center gap-space-xs">
              <span className="type-label-sm uppercase font-semibold text-primary">
                {entry.status}
              </span>
              <span className="type-small text-on-surface-variant">
                {formatIsoDate(dateStr)} {timeStr ? `· ${timeStr}` : ''}
              </span>
            </div>
            {entry.note ? (
              <p className="type-small text-on-surface-variant italic">{entry.note}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
