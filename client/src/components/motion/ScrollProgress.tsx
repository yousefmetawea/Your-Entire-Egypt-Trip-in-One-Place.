import { motion, useScroll, useSpring } from 'framer-motion';

/** Thin gold progress bar pinned to the top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-[3px] origin-left bg-gradient-to-r from-amber-300 via-orange-500 to-secondary rtl:origin-right"
    />
  );
}
