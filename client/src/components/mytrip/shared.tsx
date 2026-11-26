import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function SectionHeading({
  eyebrow,
  title,
  aside,
  dark = false,
  id,
}: {
  eyebrow: string;
  title: string;
  aside?: ReactNode;
  dark?: boolean;
  id?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p
          className={cn(
            'flex items-center gap-3 text-xs font-semibold tracking-[0.22em] uppercase',
            dark ? 'text-(--yt-lime)' : 'text-(--yt-ink-2)',
          )}
        >
          <span
            aria-hidden="true"
            className={cn('h-px w-8', dark ? 'bg-(--yt-lime)' : 'bg-(--yt-green)/40')}
          />
          {eyebrow}
        </p>
        <h2
          id={id}
          className="mt-3 font-display text-3xl leading-tight font-medium tracking-tight sm:text-5xl rtl:leading-snug"
        >
          {title}
        </h2>
      </div>
      {aside}
    </div>
  );
}
