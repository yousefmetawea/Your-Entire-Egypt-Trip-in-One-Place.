import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'bronze' | 'inverse';

export type ButtonSize = 'sm' | 'md' | 'lg';

const baseClasses =
  'inline-flex items-center justify-center gap-space-xs whitespace-nowrap rounded-full border font-sans transition-[background-color,border-color,color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 motion-safe:active:translate-y-px [&_svg]:size-4 [&_svg]:shrink-0';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border-primary-container bg-primary-container text-on-primary shadow-[0_4px_20px_-4px_rgba(31,31,31,0.18)] hover:border-secondary hover:bg-secondary hover:shadow-[0_8px_24px_-6px_rgba(119,89,40,0.28)] focus-visible:outline-secondary',
  secondary:
    'border-hairline-strong bg-surface-container-lowest text-primary shadow-resting hover:border-secondary hover:bg-secondary/10 focus-visible:outline-secondary',
  ghost:
    'border-transparent bg-transparent text-on-surface-variant hover:bg-surface-container hover:text-primary focus-visible:outline-secondary',
  bronze:
    'border-secondary bg-secondary text-on-secondary shadow-resting hover:border-primary-container hover:bg-primary-container focus-visible:outline-secondary',
  inverse:
    'border-surface-container-lowest/20 bg-surface-container-lowest/10 text-on-primary backdrop-blur-md hover:border-surface-container-lowest hover:bg-surface-container-lowest hover:text-primary focus-visible:outline-secondary-fixed',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-space-md py-space-xs type-label-sm',
  md: 'min-h-11 px-space-lg py-space-sm type-button',
  lg: 'min-h-12 px-space-xl py-space-md type-button',
};

function classes(
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
  className?: string,
): string {
  return cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    className,
  );
}

interface ButtonContentProps {
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonContentProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  startIcon,
  endIcon,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={classes(variant, size, fullWidth, className)} {...rest}>
      {startIcon ? (
        <span className="inline-flex shrink-0" aria-hidden="true">
          {startIcon}
        </span>
      ) : null}
      {children}
      {endIcon ? (
        <span className="inline-flex shrink-0" aria-hidden="true">
          {endIcon}
        </span>
      ) : null}
    </button>
  );
}

export interface ButtonLinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>, ButtonContentProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  startIcon,
  endIcon,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <a className={classes(variant, size, fullWidth, className)} {...rest}>
      {startIcon ? (
        <span className="inline-flex shrink-0" aria-hidden="true">
          {startIcon}
        </span>
      ) : null}
      {children}
      {endIcon ? (
        <span className="inline-flex shrink-0" aria-hidden="true">
          {endIcon}
        </span>
      ) : null}
    </a>
  );
}
