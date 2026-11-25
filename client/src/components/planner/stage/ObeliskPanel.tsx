import { Suspense, lazy, useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '../../../lib/cn';

const ObeliskScene = lazy(() => import('./ObeliskScene'));

function canUseWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * The obelisk. Desktop with a mouse gets the live three.js scene (lazy loaded). Touch devices,
 * reduced motion and browsers without WebGL get a pre-rendered still of the same model.
 */
export function ObeliskPanel({ stepIndex, className }: { stepIndex: number; className?: string }) {
  const reduce = useReducedMotion();
  const [live, setLive] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (pointer: fine)');
    const update = () => setLive(mq.matches && !reduce && canUseWebGL());
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [reduce]);

  return (
    <div className={className} aria-hidden="true">
      <img
        src="/images/planner/obelisk.webp"
        alt=""
        width={480}
        height={900}
        decoding="async"
        className={cn(
          'absolute inset-0 size-full object-contain transition-opacity duration-700',
          live && ready ? 'opacity-0' : 'opacity-100',
        )}
      />
      {live ? (
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <ObeliskScene stepIndex={stepIndex} onReady={() => setReady(true)} />
          </Suspense>
        </div>
      ) : null}
    </div>
  );
}
