import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/** Count-up for a number. Instant under reduced motion. */
export function useCountUp(target: number, durationMs = 900): number {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (reduce) return undefined;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / durationMs);
      setValue(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, reduce]);
  return reduce ? target : value;
}
