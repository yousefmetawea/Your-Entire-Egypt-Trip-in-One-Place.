import { useId, useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type TabsVariant = 'pill' | 'segmented';

export interface TabItem {
  value: string;
  label: ReactNode;
  content: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: readonly TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  ariaLabel: string;
  variant?: TabsVariant;
  className?: string;
  listClassName?: string;
  panelClassName?: string;
}

const buttonBase =
  'inline-flex min-h-9 items-center justify-center gap-space-xs whitespace-nowrap rounded-full font-sans transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0';

export function Tabs({
  items,
  value,
  onValueChange,
  ariaLabel,
  variant = 'pill',
  className,
  listClassName,
  panelClassName,
}: TabsProps) {
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = items.findIndex((item) => item.value === value);
  const selectedIndex = activeIndex >= 0 ? activeIndex : 0;
  const activeItem = items[selectedIndex];

  if (!activeItem) {
    return null;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number): void {
    const supportedKeys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];

    if (!supportedKeys.includes(event.key)) {
      return;
    }

    event.preventDefault();

    const direction =
      event.currentTarget.closest<HTMLElement>('[dir]')?.dir ?? document.documentElement.dir;
    const isRtl = direction === 'rtl';
    let nextIndex: number;
    let step: number;

    if (event.key === 'Home') {
      nextIndex = 0;
      step = 1;
    } else if (event.key === 'End') {
      nextIndex = items.length - 1;
      step = -1;
    } else if (event.key === 'ArrowRight') {
      step = isRtl ? -1 : 1;
      nextIndex = index + step;
    } else {
      step = isRtl ? 1 : -1;
      nextIndex = index + step;
    }

    let attempts = 0;

    while (items[(nextIndex + items.length) % items.length]?.disabled) {
      nextIndex += step;
      attempts += 1;

      if (attempts >= items.length) {
        return;
      }
    }

    nextIndex = (nextIndex + items.length) % items.length;
    const nextItem = items[nextIndex];

    if (!nextItem) {
      return;
    }

    onValueChange(nextItem.value);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <div className={cn('flex flex-col gap-space-md', className)}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={cn(
          variant === 'segmented'
            ? 'inline-flex max-w-full items-center gap-space-xs overflow-x-auto rounded-full bg-surface-container p-1 scrollbar-none'
            : 'flex max-w-full flex-wrap items-center gap-space-xs',
          listClassName,
        )}
      >
        {items.map((item, index) => {
          const isSelected = index === selectedIndex;

          return (
            <button
              key={item.value}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              id={`${baseId}-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={`${baseId}-panel-${index}`}
              tabIndex={isSelected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => onValueChange(item.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                buttonBase,
                variant === 'segmented'
                  ? 'px-space-md py-space-xs type-label-sm'
                  : 'px-space-lg py-space-sm type-label-sm',
                isSelected
                  ? variant === 'segmented'
                    ? 'bg-surface-container-lowest text-primary shadow-resting'
                    : 'bg-primary text-on-primary shadow-resting'
                  : variant === 'segmented'
                    ? 'text-on-surface-variant hover:text-primary'
                    : 'bg-surface-container-lowest text-on-surface-variant shadow-resting hover:text-primary',
              )}
            >
              {item.icon ? (
                <span className="inline-flex shrink-0" aria-hidden="true">
                  {item.icon}
                </span>
              ) : null}
              {item.label}
            </button>
          );
        })}
      </div>

      {items.map((item, index) => (
        <div
          key={item.value}
          id={`${baseId}-panel-${index}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${index}`}
          tabIndex={0}
          hidden={index !== selectedIndex}
          className={panelClassName}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
