import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type InputVariant = 'default' | 'bare';
export type InputShape = 'default' | 'pill';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  variant?: InputVariant;
  shape?: InputShape;
  containerClassName?: string;
}

export function Input({
  id,
  label,
  hideLabel = false,
  hint,
  error,
  startIcon,
  endIcon,
  variant = 'default',
  shape = 'default',
  containerClassName,
  className,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const hasError = Boolean(error);

  const describedBy = [rest['aria-describedby'], hasError ? errorId : hint ? hintId : undefined]
    .filter(Boolean)
    .join(' ');

  const padding = (() => {
    if (variant === 'bare') {
      return 'px-space-sm';
    }

    if (startIcon && endIcon) {
      return 'ps-space-xl pe-space-xl';
    }

    if (startIcon) {
      return 'ps-space-xl pe-space-md';
    }

    if (endIcon) {
      return 'ps-space-md pe-space-xl';
    }

    return shape === 'pill' ? 'px-space-lg' : 'px-space-md';
  })();

  return (
    <div className={cn('w-full', containerClassName)}>
      <label
        htmlFor={inputId}
        className={cn(
          'font-sans text-label-md text-on-surface',
          hideLabel ? 'sr-only' : 'mb-space-xs block',
        )}
      >
        {label}
      </label>

      <div className="relative">
        {startIcon ? (
          <span
            className="pointer-events-none absolute start-space-md top-1/2 inline-flex -translate-y-1/2 text-secondary [&_svg]:size-4"
            aria-hidden="true"
          >
            {startIcon}
          </span>
        ) : null}

        <input
          id={inputId}
          className={cn(
            'h-11 w-full bg-transparent font-sans text-body-md text-on-surface transition-[border-color,box-shadow] duration-200 placeholder:text-on-surface-variant/80 disabled:cursor-not-allowed disabled:text-on-surface-variant/60',
            padding,
            shape === 'pill' ? 'rounded-full' : 'rounded-xl',
            variant === 'default'
              ? 'border border-hairline-strong bg-surface-container-lowest focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 disabled:bg-surface-container-low'
              : 'border-0 focus-visible:outline-none',
            hasError && 'border-error focus:border-error focus:ring-error/20',
            className,
          )}
          {...rest}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy || undefined}
        />

        {endIcon ? (
          <span
            className="pointer-events-none absolute end-space-md top-1/2 inline-flex -translate-y-1/2 text-secondary [&_svg]:size-4"
            aria-hidden="true"
          >
            {endIcon}
          </span>
        ) : null}
      </div>

      {hasError ? (
        <p id={errorId} className="mt-space-xs font-sans text-body-sm text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-space-xs font-sans text-body-sm text-on-surface-variant">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
