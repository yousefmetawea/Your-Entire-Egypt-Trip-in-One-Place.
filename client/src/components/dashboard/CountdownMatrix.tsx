import type { CountdownTime, TripPhaseKind } from '../../lib/dashboard/tripPhase';

export interface CountdownMatrixProps {
  phase: TripPhaseKind;
  countdown: CountdownTime | null;
  daysRemaining: number | null;
  dayNumber: number | null;
  totalDays: number;
  daysSinceEnd: number | null;
}

export function CountdownMatrix({
  phase,
  countdown,
  daysRemaining,
  dayNumber,
  totalDays,
  daysSinceEnd,
}: CountdownMatrixProps) {
  if (phase === 'before') {
    const days = countdown?.days ?? daysRemaining ?? 0;
    const hours = countdown?.hours ?? 0;
    const minutes = countdown?.minutes ?? 0;

    const accessibleLabel = `${days} days, ${hours} hours, and ${minutes} minutes remaining until departure`;

    return (
      <div
        className="flex items-center gap-space-xs sm:gap-space-sm bg-surface-container-lowest/10 backdrop-blur-md p-space-sm sm:p-space-md rounded-[20px] self-start lg:self-auto border border-surface/10"
        role="timer"
        aria-label={accessibleLabel}
      >
        <div className="flex flex-col items-center justify-center min-w-[56px] sm:min-w-[72px] py-space-xs px-space-xs rounded-xl bg-primary/60 border border-surface/5">
          <span className="font-serif text-2xl sm:text-3xl text-secondary-fixed leading-none font-normal">
            {String(days).padStart(2, '0')}
          </span>
          <span className="type-label-sm uppercase text-surface-variant tracking-widest mt-1 text-[10px]">
            Days
          </span>
        </div>

        <span
          className="font-serif text-xl sm:text-2xl text-secondary-fixed-dim/60 mb-2"
          aria-hidden="true"
        >
          :
        </span>

        <div className="flex flex-col items-center justify-center min-w-[56px] sm:min-w-[72px] py-space-xs px-space-xs rounded-xl bg-primary/60 border border-surface/5">
          <span className="font-serif text-2xl sm:text-3xl text-surface leading-none font-normal">
            {String(hours).padStart(2, '0')}
          </span>
          <span className="type-label-sm uppercase text-surface-variant tracking-widest mt-1 text-[10px]">
            Hours
          </span>
        </div>

        <span
          className="font-serif text-xl sm:text-2xl text-secondary-fixed-dim/60 mb-2"
          aria-hidden="true"
        >
          :
        </span>

        <div className="flex flex-col items-center justify-center min-w-[56px] sm:min-w-[72px] py-space-xs px-space-xs rounded-xl bg-primary/60 border border-surface/5">
          <span className="font-serif text-2xl sm:text-3xl text-surface leading-none font-normal">
            {String(minutes).padStart(2, '0')}
          </span>
          <span className="type-label-sm uppercase text-surface-variant tracking-widest mt-1 text-[10px]">
            Mins
          </span>
        </div>
      </div>
    );
  }

  if (phase === 'during') {
    return (
      <div className="flex flex-col items-center sm:items-end justify-center bg-surface-container-lowest/10 backdrop-blur-md px-space-lg py-space-md rounded-[20px] border border-surface/10 self-start lg:self-auto">
        <span className="type-label uppercase text-secondary-fixed tracking-widest text-xs">
          Expedition in Progress
        </span>
        <span className="font-serif text-3xl sm:text-4xl text-surface mt-1">
          Day {dayNumber ?? 1}{' '}
          <span className="text-secondary-fixed-dim text-2xl font-sans font-light">
            of {totalDays}
          </span>
        </span>
      </div>
    );
  }

  if (phase === 'after') {
    return (
      <div className="flex flex-col items-center sm:items-end justify-center bg-surface-container-lowest/10 backdrop-blur-md px-space-lg py-space-md rounded-[20px] border border-surface/10 self-start lg:self-auto">
        <span className="type-label uppercase text-secondary-fixed tracking-widest text-xs">
          Trip Completed
        </span>
        <span className="font-serif text-2xl sm:text-3xl text-surface mt-1">
          {daysSinceEnd ?? 1} {daysSinceEnd === 1 ? 'day' : 'days'} ago
        </span>
      </div>
    );
  }

  return null;
}
