import { Suspense, lazy } from 'react';
import { useReducedMotion } from 'framer-motion';

const Relic = lazy(() => import('./Relic'));

/** Quiet decorative 3D obelisk in the top corner of inner pages (desktop only). */
export function PageRelic() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div
      className="pointer-events-none absolute end-6 top-28 z-20 hidden h-[260px] w-[150px] lg:block xl:end-20"
      aria-hidden="true"
    >
      <Suspense fallback={null}>
        <Relic />
      </Suspense>
    </div>
  );
}
