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

/**
 * Recreates the exact OVO Legion Button Interaction (a-84 / a-85):
 *
 * 1. .button: rounded-lg border border-hairline bg-[#141414] text-white
 * 2. .red-circle (a-84-n-2): 12px circle that scales by 40x (outExpo, duration 800ms)
 *    to flood the button background with crimson on hover.
 * 3. .button-text (a-84-n-6): translates x by -8px with outExpo easing.
 * 4. :hover (CSS): scale(1.03) with cubic-bezier(.175, .885, .32, 1.275).
 */
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
    sm: 'px-space-md py-2 text-xs tracking-wider gap-space-xs min-h-9',
    md: 'px-space-lg py-3 text-sm tracking-wide gap-space-sm min-h-11',
    lg: 'px-space-xl py-3.5 text-base tracking-wide gap-space-sm min-h-13',
  }[size];

  const variantBase = {
    primary: 'bg-primary text-on-primary border border-primary/40 hover:border-secondary',
    secondary: 'bg-surface text-primary border border-hairline hover:border-secondary',
    glass:
      'bg-surface/90 text-primary backdrop-blur-xl border border-hairline hover:border-secondary',
  }[variant];

  const circleColor = {
    primary: 'bg-secondary',
    secondary: 'bg-secondary',
    glass: 'bg-secondary',
  }[variant];

  const commonClasses = cn(
    'group relative inline-flex items-center justify-center overflow-hidden rounded-xl font-sans font-medium transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:pointer-events-none disabled:opacity-50 cursor-pointer shadow-sm hover:shadow-floating',
    sizeClasses,
    variantBase,
    className,
  );

  const innerContent = (
    <>
      {/* Expanding Red Circle Background (Reference: .red-circle and a-84 / a-85) */}
      <span
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <span
          className={cn(
            'size-3 rounded-full opacity-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[42] group-hover:opacity-100',
            circleColor,
          )}
        />
      </span>

      {/* Button Content with subtle text shift (Reference: .button-text a-84-n-6) */}
      <span className="relative z-10 flex items-center gap-space-xs transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-1 rtl:group-hover:translate-x-1 group-hover:text-white">
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
