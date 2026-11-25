import type { BookingStatusChange } from '../../types';
import { formatIsoDate } from '../../lib/date';

export interface StatusTimelineProps {
  history: BookingStatusChange[];
  dark?: boolean;
}

export function StatusTimeline({ history, dark = false }: StatusTimelineProps) {
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className={`relative border-s ${dark ? 'border-white/15' : 'border-hairline-strong'} ps-space-md ms-space-xs my-space-sm space-y-space-sm`}>
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
              className={`absolute -start-[1.4375rem] top-1.5 size-2 rounded-full ${dark ? 'bg-[#ffb25a] shadow-[0_0_10px_rgba(255,178,90,0.8)]' : 'bg-secondary'}`}
              aria-hidden="true"
            />
            <div className="flex items-center gap-space-xs">
              <span className={`type-label-sm uppercase font-semibold ${dark ? 'text-white' : 'text-primary'}`}>
                {entry.status}
              </span>
              <span className={`type-small ${dark ? 'text-white/55' : 'text-on-surface-variant'}`}>
                {formatIsoDate(dateStr)} {timeStr ? `· ${timeStr}` : ''}
              </span>
            </div>
            {entry.note ? (
              <p className={`type-small italic ${dark ? 'text-white/60' : 'text-on-surface-variant'}`}>{entry.note}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
