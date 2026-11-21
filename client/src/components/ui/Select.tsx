import { useId } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { ChevronDownIcon } from './icons';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export type SelectShape = 'default' | 'pill';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  options: readonly SelectOption[];
  placeholder?: string;
  shape?: SelectShape;
  containerClassName?: string;
}

export function Select({
  id,
  label,
  hideLabel = false,
  hint,
  error,
  options,
  placeholder,
  shape = 'default',
  containerClassName,
  className,
  ...rest
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const hintId = `${selectId}-hint`;
  const errorId = `${selectId}-error`;
  const hasError = Boolean(error);

  const describedBy = [rest['aria-describedby'], hasError ? errorId : hint ? hintId : undefined]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cn('w-full', containerClassName)}>
      <label
        htmlFor={selectId}
        className={cn(
          'font-sans text-label-md text-on-surface',
          hideLabel ? 'sr-only' : 'mb-space-xs block',
        )}
      >
        {label}
      </label>

      <div className="relative">
        <select
          id={selectId}
          className={cn(
            'h-11 w-full appearance-none border border-hairline-strong bg-surface-container-lowest font-sans text-body-md text-on-surface transition-[border-color,box-shadow] duration-200 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 disabled:cursor-not-allowed disabled:bg-surface-container-low disabled:text-on-surface-variant/60',
            shape === 'pill'
              ? 'rounded-full ps-space-lg pe-space-xl'
              : 'rounded-xl ps-space-md pe-space-xl',
            hasError && 'border-error focus:border-error focus:ring-error/20',
            className,
          )}
          {...rest}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy || undefined}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDownIcon className="pointer-events-none absolute end-space-md top-1/2 size-4 -translate-y-1/2 text-secondary" />
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
