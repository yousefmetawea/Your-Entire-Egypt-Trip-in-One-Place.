import { cn } from '../lib/cn';

export interface RouteLoadingProps {
  fullScreen?: boolean;
}

export function RouteLoading({ fullScreen = true }: RouteLoadingProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-surface-container-low',
        fullScreen ? 'min-h-screen' : 'min-h-[50vh]',
      )}
      role="status"
      aria-live="polite"
    >
      <p className="type-label text-on-surface-variant">Loading...</p>
    </div>
  );
}
