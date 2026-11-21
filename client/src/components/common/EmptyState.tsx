import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Card } from '../ui/Card';

export interface EmptyStateProps {
  title: string;
  description: string;
  actions?: ReactNode;
  icon?: ReactNode;
  role?: 'status' | 'alert';
  className?: string;
}

export function EmptyState({
  title,
  description,
  actions,
  icon,
  role = 'status',
  className,
}: EmptyStateProps) {
  return (
    <Card
      variant="surface"
      padding="lg"
      role={role}
      className={cn('flex flex-col items-start gap-space-md', className)}
    >
      {icon ? (
        <span
          className="inline-flex size-12 items-center justify-center rounded-full bg-surface-container text-secondary [&_svg]:size-5"
          aria-hidden="true"
        >
          {icon}
        </span>
      ) : null}

      <div className="max-w-xl">
        <h2 className="type-section text-primary">{title}</h2>
        <p className="type-body mt-space-sm text-on-surface-variant">{description}</p>
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-space-sm">{actions}</div> : null}
    </Card>
  );
}
