import { lazy, Suspense } from 'react';
import type { Place } from '../../types';
import { Skeleton } from '../ui/Skeleton';

export interface MapPreviewProps {
  place: Pick<Place, 'name' | 'area' | 'location'>;
}

const LazyDestinationMap = lazy(() =>
  import('../map/DestinationMap').then((m) => ({ default: m.DestinationMap })),
);

export function MapPreview(props: MapPreviewProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 w-full flex-col items-center justify-center rounded-card border border-hairline bg-surface-container p-space-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="mt-4 h-6 w-1/2" />
          <Skeleton className="mt-2 h-4 w-1/3" />
        </div>
      }
    >
      <LazyDestinationMap place={props.place} />
    </Suspense>
  );
}
