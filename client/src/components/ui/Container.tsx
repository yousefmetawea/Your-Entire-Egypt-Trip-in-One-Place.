import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type ContainerProps = HTMLAttributes<HTMLDivElement>;

export function Container({ className, ...rest }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-page px-gutter-sm md:px-margin-md lg:px-margin-lg',
        className,
      )}
      {...rest}
    />
  );
}
