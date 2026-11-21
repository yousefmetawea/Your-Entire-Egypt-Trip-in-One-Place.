import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type CardVariant = 'surface' | 'elevated' | 'muted' | 'dark' | 'glass' | 'plain';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export type CardElement = 'div' | 'article' | 'section' | 'li';

const variantClasses: Record<CardVariant, string> = {
  surface: 'border border-hairline bg-surface-container-lowest text-on-surface shadow-resting',
  elevated:
    'border border-hairline-strong bg-surface-container-lowest text-on-surface shadow-floating',
  muted: 'border border-hairline bg-surface-container text-on-surface',
  dark: 'border border-primary-container bg-primary-container text-on-primary shadow-floating',
  glass:
    'border border-hairline-strong/60 bg-surface/80 text-on-surface shadow-floating backdrop-blur-xl',
  plain: 'border border-transparent bg-transparent text-on-surface',
};

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-space-md',
  md: 'p-space-lg',
  lg: 'p-space-xl',
};

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: CardElement;
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
}

export function Card({
  as: Component = 'div',
  variant = 'surface',
  padding = 'md',
  interactive = false,
  className,
  ...rest
}: CardProps) {
  return (
    <Component
      className={cn(
        'rounded-card',
        variantClasses[variant],
        paddingClasses[padding],
        interactive &&
          'transition-[transform,box-shadow,border-color] duration-300 focus-within:border-secondary/40 motion-safe:hover:-translate-y-1 hover:border-secondary/30 hover:shadow-hover',
        className,
      )}
      {...rest}
    />
  );
}
