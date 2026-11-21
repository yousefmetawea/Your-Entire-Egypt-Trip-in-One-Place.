import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type ChipVariant = 'solid' | 'outline';
export type ChipSize = 'sm' | 'md';

const baseClasses =
  'inline-flex items-center justify-center gap-space-xs whitespace-nowrap rounded-full border font-sans transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0';

const selectedClasses =
  'border-primary bg-primary text-on-primary shadow-resting hover:bg-primary-container';

const unselectedClasses: Record<ChipVariant, string> = {
  solid:
    'border-transparent bg-surface-container-high text-on-surface-variant hover:bg-surface-variant hover:text-primary',
  outline:
    'border-hairline-strong bg-surface-container-lowest text-on-surface-variant hover:border-secondary hover:text-primary',
};

const sizeClasses: Record<ChipSize, string> = {
  sm: 'min-h-8 px-space-sm py-space-xs type-label-sm',
  md: 'min-h-10 px-space-md py-space-xs type-title-sm',
};

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  variant?: ChipVariant;
  size?: ChipSize;
  icon?: ReactNode;
}

export function Chip({
  selected = false,
  onSelectedChange,
  variant = 'solid',
  size = 'md',
  icon,
  type = 'button',
  className,
  children,
  onClick,
  ...rest
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        baseClasses,
        sizeClasses[size],
        selected ? selectedClasses : unselectedClasses[variant],
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        onSelectedChange?.(!selected);
      }}
      {...rest}
    >
      {icon ? (
        <span className="inline-flex shrink-0" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
}
