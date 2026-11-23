import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { SplitText } from '../motion/SplitText';

export type SectionHeaderAlign = 'start' | 'center';
export type SectionHeaderTone = 'light' | 'dark';

export interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: SectionHeaderAlign;
  tone?: SectionHeaderTone;
  as?: 'h1' | 'h2';
  id?: string;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = 'start',
  tone = 'light',
  as: Heading = 'h2',
  id,
  className,
}: SectionHeaderProps) {
  const centered = align === 'center';
  const dark = tone === 'dark';

  return (
    <div
      className={cn(
        'flex flex-col gap-space-lg',
        centered ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className={cn('max-w-2xl', centered && 'mx-auto')}>
        <p
          className={cn(
            'type-label flex items-center gap-space-xs',
            centered && 'justify-center',
            dark ? 'text-secondary-fixed' : 'text-secondary',
          )}
        >
          <span
            className={cn(
              'size-2 shrink-0 rounded-full',
              dark ? 'bg-secondary-fixed' : 'bg-secondary',
            )}
            aria-hidden="true"
          />
          {eyebrow}
        </p>
        <Heading
          id={id}
          className={cn('type-headline mt-space-sm', dark ? 'text-on-primary' : 'text-primary')}
        >
          <SplitText as="span">{title}</SplitText>
        </Heading>
        {description ? (
          <p
            className={cn(
              'type-body-lg mt-space-sm',
              dark ? 'text-surface-container-high/85' : 'text-on-surface-variant',
            )}
          >
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className={cn('shrink-0', centered && 'mt-space-xs')}>{action}</div> : null}
    </div>
  );
}
