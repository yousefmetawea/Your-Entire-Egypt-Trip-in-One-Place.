import { Skeleton } from '../ui/Skeleton';

export function DashboardSkeleton() {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-gutter-sm md:px-margin-md lg:px-margin-lg py-space-lg flex flex-col gap-space-lg">
      {/* Hero skeleton */}
      <div className="rounded-[24px] bg-primary-container p-space-xl h-64 flex flex-col justify-between">
        <div className="space-y-3">
          <Skeleton className="h-6 w-32 bg-surface/20" />
          <Skeleton className="h-10 w-3/4 max-w-md bg-surface/20" />
          <Skeleton className="h-4 w-60 bg-surface/20" />
        </div>
        <div className="flex gap-space-sm">
          <Skeleton className="h-8 w-36 rounded-full bg-surface/20" />
          <Skeleton className="h-8 w-36 rounded-full bg-surface/20" />
        </div>
      </div>

      {/* Bento grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg">
        {/* Left col */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          <div className="p-space-lg rounded-[20px] bg-surface-container-lowest h-72 flex flex-col gap-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
          <div className="p-space-lg rounded-[20px] bg-surface-container-lowest h-48 flex flex-col gap-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>

        {/* Right col */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          <div className="p-space-lg rounded-[24px] bg-surface-container-lowest h-64 flex flex-col gap-4">
            <Skeleton className="h-6 w-48" />
            <div className="flex items-center gap-4">
              <Skeleton className="size-36 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>
          <div className="p-space-lg rounded-[24px] bg-surface-container-lowest h-60 flex flex-col gap-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
