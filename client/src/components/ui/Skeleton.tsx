import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('rounded-xl bg-surface-container-high motion-safe:animate-pulse', className)}
      {...rest}
    />
  );
}
