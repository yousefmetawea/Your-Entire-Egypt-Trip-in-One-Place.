import { motion, useReducedMotion } from 'framer-motion';

/**
 * HeroTextLoop reproduces the OVO Legion scrolling text animation.
 * The phrase "Legion Design Creative Agency" repeats infinitely.
 * Reduced‑motion users see a static version.
 */
export default function HeroTextLoop() {
  const shouldReduce = useReducedMotion();
  const phrase = 'Legion Design Creative Agency';
  const words = phrase.split(' ');
  // repeat enough times for seamless loop; 6 repeats matches OVO reference
  const repeated = Array(6).fill(words).flat();

  if (shouldReduce) {
    return <div className="hero-text-loop-holder">{phrase}</div>;
  }

  return (
    <div className="hero-text-loop-holder overflow-hidden whitespace-nowrap">
      <motion.div
        className="flex"
        animate={{ x: '-100%' }}
        transition={{
          repeat: Infinity,
          repeatType: 'loop',
          duration: 8,
          ease: 'linear',
        }}
      >
        {repeated.map((w, i) => (
          <div key={i} className="hero-text inline-block mr-8 whitespace-nowrap">
            {w}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
