import type { HTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import type { BookingStatus } from '../../types';
import { Badge } from '../ui/Badge';

export interface RequestStatusChipProps extends HTMLAttributes<HTMLSpanElement> {
  status: BookingStatus;
  size?: 'sm' | 'md';
  dark?: boolean;
}

export function RequestStatusChip({
  status,
  size = 'md',
  dark = false,
  className,
  ...rest
}: RequestStatusChipProps) {
  const { t } = useTranslation();
  const tone = status === 'confirmed' ? 'success' : status === 'cancelled' ? 'danger' : 'warning';

  const label = t(`stayTransport.booking.status.${status}`, {
    defaultValue:
      status === 'confirmed'
        ? 'Confirmed'
        : status === 'cancelled'
          ? 'Cancelled'
          : 'Awaiting confirmation',
  });

  if (dark) {
    const darkTone =
      status === 'confirmed'
        ? 'bg-emerald-400/15 text-emerald-300 ring-emerald-400/30'
        : status === 'cancelled'
          ? 'bg-rose-400/15 text-rose-300 ring-rose-400/30'
          : 'bg-[#ffb25a]/15 text-[#ffb25a] ring-[#ffb25a]/30';
    return (
      <span
        role="status"
        aria-label={`Booking status: ${label}`}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] ring-1 ${darkTone} ${className ?? ''}`}
        {...rest}
      >
        <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
        {label}
      </span>
    );
  }

  return (
    <Badge
      tone={tone}
      size={size}
      role="status"
      aria-label={`Booking status: ${label}`}
      className={className}
      {...rest}
    >
      {label}
    </Badge>
  );
}
