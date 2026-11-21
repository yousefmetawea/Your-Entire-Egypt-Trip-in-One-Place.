import { cn } from '../../lib/cn';

export interface PlaceSectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  id?: string;
  className?: string;
}

export function PlaceSectionHeading({
  eyebrow,
  title,
  description,
  id,
  className,
}: PlaceSectionHeadingProps) {
  return (
    <div className={cn('max-w-2xl', className)}>
      <p className="type-label flex items-center gap-space-xs text-secondary">
        <span className="size-2 shrink-0 rounded-full bg-secondary" aria-hidden="true" />
        {eyebrow}
      </p>
      <h2 id={id} className="type-section mt-space-sm text-primary">
        {title}
      </h2>
      {description ? (
        <p className="type-body mt-space-sm text-on-surface-variant">{description}</p>
      ) : null}
    </div>
  );
}
