import type { HTMLAttributes } from 'react';
import type { BookingStatus } from '../../types';
import { Badge } from '../ui/Badge';

export interface RequestStatusChipProps extends HTMLAttributes<HTMLSpanElement> {
  status: BookingStatus;
  size?: 'sm' | 'md';
}

export function RequestStatusChip({
  status,
  size = 'md',
  className,
  ...rest
}: RequestStatusChipProps) {
  const tone = status === 'confirmed' ? 'success' : status === 'cancelled' ? 'danger' : 'warning';

  const label =
    status === 'confirmed' ? 'Confirmed' : status === 'cancelled' ? 'Cancelled' : 'Pending';

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
