import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type SectionTone = 'canvas' | 'surface' | 'white' | 'muted' | 'dark' | 'transparent';

export type SectionSpacing = 'none' | 'sm' | 'md';

const toneClasses: Record<SectionTone, string> = {
  canvas: 'bg-surface-container-low text-on-surface',
  surface: 'bg-surface text-on-surface',
  white: 'bg-surface-container-lowest text-on-surface',
  muted: 'bg-surface-container text-on-surface',
  dark: 'bg-primary-container text-on-primary',
  transparent: 'bg-transparent text-on-surface',
};

const spacingClasses: Record<SectionSpacing, string> = {
  none: '',
  sm: 'py-space-xl',
  md: 'py-space-2xl',
};

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  tone?: SectionTone;
  spacing?: SectionSpacing;
}

export function Section({ tone = 'canvas', spacing = 'md', className, ...rest }: SectionProps) {
  return (
    <section className={cn(toneClasses[tone], spacingClasses[spacing], className)} {...rest} />
  );
}
