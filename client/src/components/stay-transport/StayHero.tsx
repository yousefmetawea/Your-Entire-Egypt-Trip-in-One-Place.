import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { Container } from '../ui/Container';
import { SplitText } from '../motion/SplitText';
import type { Copy } from './copy';

const TransitScene = lazy(() => import('../three/TransitScene'));

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

function Counter({ to, label }: { to: number; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!inView || !ref.current) return;
    if (reduce) {
      ref.current.textContent = String(to);
      return;
    }
    const c = animate(0, to, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = String(Math.round(v));
      },
    });
    return () => c.stop();
  }, [inView, to, reduce]);
  return (
    <div className="flex flex-col gap-1">
      <span ref={ref} className="text-4xl font-semibold tabular-nums text-white md:text-5xl">
        0
      </span>
      <span className="text-xs uppercase tracking-[0.2em] text-white/55">{label}</span>
    </div>
  );
}

export function StayHero({
  copy,
  isAr,
  stays,
  ways,
  onPick,
}: {
  copy: Copy;
  isAr: boolean;
  stays: number;
  ways: number;
  onPick: (tab: 'accommodation' | 'transportation') => void;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: '200px' });
  const [webgl] = useState(hasWebGL);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);
  const sceneY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 60]);

  return (
    <section
      ref={ref}
      className="relative -mt-24 flex min-h-[92vh] items-center overflow-hidden bg-[#070a12] text-white md:-mt-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_75%_30%,rgba(255,170,80,0.16),transparent_60%),radial-gradient(700px_500px_at_10%_90%,rgba(56,195,230,0.1),transparent_60%)]" />
      {webgl && inView ? (
        <motion.div className="absolute inset-0" style={{ y: sceneY }}>
          <Suspense fallback={null}>
            <TransitScene isAr={isAr} still={Boolean(reduce)} />
          </Suspense>
        </motion.div>
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(7,10,18,0.92)_0%,rgba(7,10,18,0.55)_45%,rgba(7,10,18,0)_75%)] rtl:bg-[linear-gradient(270deg,rgba(7,10,18,0.92)_0%,rgba(7,10,18,0.55)_45%,rgba(7,10,18,0)_75%)] max-md:bg-[#070a12]/55" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#070a12]" />

      <Container>
        <motion.div
          style={{ y: textY }}
          className="relative z-10 flex max-w-2xl flex-col gap-7 pb-24 pt-40"
        >
          <motion.span
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#ffb25a]"
          >
            <span className="h-px w-10 bg-[#ffb25a]" />
            {copy.eyebrow}
          </motion.span>

          <h1 className="text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
            <span className="block">
              <SplitText as="span" delay={0.25}>
                {copy.headA}
              </SplitText>
            </span>
            <span className="block bg-gradient-to-r from-[#ffd7a0] via-[#ffb25a] to-[#f08a3c] bg-clip-text text-transparent">
              <SplitText as="span" delay={0.55}>
                {copy.headB}
              </SplitText>
            </span>
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="max-w-xl text-lg leading-relaxed text-white/70"
          >
            {copy.sub}
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="flex flex-wrap gap-3"
          >
            <button
              type="button"
              onClick={() => onPick('transportation')}
              className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5"
            >
              {copy.ctaTransport}
            </button>
            <button
              type="button"
              onClick={() => onPick('accommodation')}
              className="rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              {copy.ctaStay}
            </button>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.3 }}
            className="mt-6 flex gap-10 border-t border-white/10 pt-6"
          >
            <Counter to={stays} label={copy.statStays} />
            <Counter to={ways} label={copy.statWays} />
            <Counter to={8} label={copy.statCities} />
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
