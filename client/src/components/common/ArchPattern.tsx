import { cn } from '../../lib/cn';

export type ArchPatternVariant = 'card' | 'hero';

export interface ArchPatternProps {
  variant?: ArchPatternVariant;
  className?: string;
}

export function ArchPattern({ variant = 'card', className }: ArchPatternProps) {
  const isHero = variant === 'hero';

  return (
    <svg
      viewBox={isHero ? '0 0 1440 720' : '0 0 400 300'}
      preserveAspectRatio="xMidYMax slice"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn('pointer-events-none absolute inset-0 size-full', className)}
    >
      {isHero ? (
        <>
          <circle cx="1080" cy="210" r="118" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="1080" cy="210" r="88" stroke="currentColor" strokeWidth="1" opacity="0.55" />
          <path
            d="M-140 720V356a240 240 0 0 1 480 0v364M300 720V296a210 210 0 0 1 420 0v424M660 720V392a190 190 0 0 1 380 0v328M1010 720V334a175 175 0 0 1 350 0v386M1320 720V430a130 130 0 0 1 260 0v290"
            stroke="currentColor"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M0 612h1440M0 662h1440"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.4"
            vectorEffect="non-scaling-stroke"
          />
        </>
      ) : (
        <>
          <circle cx="310" cy="72" r="38" stroke="currentColor" strokeWidth="1.25" />
          <path
            d="M-36 300V186a94 94 0 0 1 188 0v114M112 300V150a78 78 0 0 1 156 0v150M230 300V204a62 62 0 0 1 124 0v96M320 300V176a54 54 0 0 1 108 0v124"
            stroke="currentColor"
            strokeWidth="1.25"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M0 270h400"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.4"
            vectorEffect="non-scaling-stroke"
          />
        </>
      )}
    </svg>
  );
}
