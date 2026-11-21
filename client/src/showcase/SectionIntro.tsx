import { cn } from '../lib/cn';

export interface SectionIntroProps {
  eyebrow: string;
  title: string;
  description?: string;
  inverted?: boolean;
  className?: string;
}

export function SectionIntro({
  eyebrow,
  title,
  description,
  inverted = false,
  className,
}: SectionIntroProps) {
  return (
    <div className={cn('max-w-3xl', className)}>
      <p className={cn('type-label', inverted ? 'text-secondary-fixed' : 'text-secondary')}>
        {eyebrow}
      </p>
      <h2 className={cn('type-section mt-space-sm', inverted ? 'text-on-primary' : 'text-primary')}>
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            'mt-space-md max-w-2xl type-body-lg',
            inverted ? 'text-surface-container-high' : 'text-on-surface-variant',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
