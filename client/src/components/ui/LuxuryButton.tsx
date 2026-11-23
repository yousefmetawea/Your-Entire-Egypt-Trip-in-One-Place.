import React from 'react';
import { AppLink } from '../../app/AppLink';
import { cn } from '../../lib/cn';

export interface LuxuryButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function LuxuryButton({
  children,
  href,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  startIcon,
  endIcon,
  className,
  disabled = false,
}: LuxuryButtonProps) {
  const sizeClasses = {
    sm: 'px-space-md py-1.5 text-xs tracking-wider gap-space-xs min-h-9',
    md: 'px-space-lg py-2.5 text-sm tracking-wide gap-space-sm min-h-11',
    lg: 'px-space-xl py-3.5 text-base tracking-wide gap-space-sm min-h-13',
  }[size];

  const variantBase = {
    primary: 'bg-primary text-on-primary border border-primary/30 hover:border-secondary',
    secondary: 'bg-secondary text-on-secondary border border-secondary/40 hover:border-secondary',
    glass:
      'bg-surface/80 text-primary backdrop-blur-xl border border-sand/40 hover:border-secondary',
  }[variant];

  const circleColor = {
    primary: 'bg-secondary',
    secondary: 'bg-primary',
    glass: 'bg-secondary/90',
  }[variant];

  const circleHoverTextColor = {
    primary: 'group-hover:text-on-secondary',
    secondary: 'group-hover:text-on-primary',
    glass: 'group-hover:text-on-secondary',
  }[variant];

  const commonClasses = cn(
    'group relative inline-flex items-center justify-center overflow-hidden rounded-full font-sans font-medium transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:pointer-events-none disabled:opacity-50 cursor-pointer shadow-resting hover:shadow-floating',
    sizeClasses,
    variantBase,
    className,
  );

  const innerContent = (
    <>
      {/* Expanding circle background on hover (OVO Legion signature) */}
      <span
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden rounded-full"
        aria-hidden="true"
      >
        <span
          className={cn(
            'size-3 rounded-full opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[32] group-hover:opacity-100',
            circleColor,
          )}
        />
      </span>

      {/* Button Content */}
      <span
        className={cn(
          'relative z-10 flex items-center gap-space-xs transition-colors duration-300',
          circleHoverTextColor,
        )}
      >
        {startIcon && <span className="shrink-0">{startIcon}</span>}
        <span>{children}</span>
        {endIcon && (
          <span className="shrink-0 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
            {endIcon}
          </span>
        )}
      </span>
    </>
  );

  if (href) {
    return (
      <AppLink href={href} className={commonClasses}>
        {innerContent}
      </AppLink>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={commonClasses}>
      {innerContent}
    </button>
  );
}
