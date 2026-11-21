import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type BadgeTone =
  | 'neutral'
  | 'outline'
  | 'bronze'
  | 'dark'
  | 'success'
  | 'warning'
  | 'danger'
  | 'glass'
  | 'glass-dark';

export type BadgeSize = 'sm' | 'md';

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-surface-container-high text-on-surface-variant',
  outline: 'border-hairline-strong bg-surface-container-lowest text-on-surface-variant',
  bronze: 'bg-secondary-fixed/60 text-on-secondary-fixed-variant',
  dark: 'bg-primary text-on-primary',
  success: 'bg-success-container text-success',
  warning: 'bg-secondary-fixed text-on-secondary-fixed',
  danger: 'bg-error-container text-on-error-container',
  glass: 'bg-surface/90 text-primary shadow-resting backdrop-blur-md',
  'glass-dark': 'bg-surface-container-lowest/15 text-surface-container-low backdrop-blur-md',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-space-xs py-1 text-[0.625rem] leading-4 font-bold tracking-[0.12em]',
  md: 'px-space-sm py-space-xs type-label',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: BadgeSize;
  dot?: boolean;
  children: ReactNode;
}

export function Badge({
  tone = 'neutral',
  size = 'md',
  dot = false,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-space-xs whitespace-nowrap rounded-full border border-transparent font-sans uppercase',
        toneClasses[tone],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {dot ? (
        <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />
      ) : null}
      {children}
    </span>
  );
}

export type StatusBadgeStatus = 'pending' | 'confirmed' | 'cancelled' | 'external' | 'available';

const statusTone: Record<StatusBadgeStatus, BadgeTone> = {
  pending: 'warning',
  confirmed: 'neutral',
  cancelled: 'danger',
  external: 'dark',
  available: 'success',
};

export interface StatusBadgeProps extends Omit<BadgeProps, 'tone' | 'dot'> {
  status: StatusBadgeStatus;
  dot?: boolean;
}

export function StatusBadge({ status, dot = true, ...rest }: StatusBadgeProps) {
  return <Badge tone={statusTone[status]} dot={dot} {...rest} />;
}
