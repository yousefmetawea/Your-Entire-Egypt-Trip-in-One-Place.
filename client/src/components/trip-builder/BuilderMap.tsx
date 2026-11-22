import { lazy, Suspense } from 'react';
import type { Place, PlaceId, TripDay } from '../../types';
import { Skeleton } from '../ui/Skeleton';

export interface BuilderMapProps {
  day: TripDay;
  dayNumber: number;
  placesById: ReadonlyMap<PlaceId, Place>;
}

const LazyItineraryMap = lazy(() =>
  import('../map/ItineraryMap').then((m) => ({ default: m.ItineraryMap })),
);

export function BuilderMap(props: BuilderMapProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-[480px] w-full flex-col gap-3 rounded-2xl border border-hairline bg-surface-container-low p-space-md">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-[380px] w-full rounded-xl" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      }
    >
      <LazyItineraryMap {...props} />
    </Suspense>
  );
}
