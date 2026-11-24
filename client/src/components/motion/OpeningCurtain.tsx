import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router';


/**
 * OpeningCurtain replicates the exact OVO Legion opening sequence.
 * It consists of a full-screen overlay with five white columns that collapse
 * sequentially after a short loading bar animation.
 * The component respects the prefers-reduced-motion media query.
 */
export default function OpeningCurtain() {
  const location = useLocation();
  const shouldReduce = useReducedMotion();
  const [visible, setVisible] = useState(true);

  // If reduced motion, skip entirely.
  if (shouldReduce) return null;

  // When the last column finishes, hide the overlay.
  const onLastComplete = () => setVisible(false);
  if (!visible) return null;

  const columns = [0, 1, 2, 3, 4];

  return (
    <div
      key={location.pathname}
      className="curtains pointer-events-none fixed inset-0 z-[100] flex h-screen w-screen overflow-hidden"
      aria-hidden="true"
    >
      {/* Columns */}
      {columns.map((i) => (
        <motion.div
          key={i}
          initial={{ height: '100%' }}
          animate={{ height: '0%' }}
          transition={{
            duration: 0.55,
            delay: 1.15 + i * 0.08,
            ease: [0.76, 0, 0.24, 1],
          }}
          onAnimationComplete={i === columns.length - 1 ? onLastComplete : undefined}
          className="curtains-white relative h-full flex-1 border-e border-hairline/40 bg-surface-container-low shadow-2xl"
        >
          {/* Optional bottom accent line – matches OVO design */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-secondary/30 via-secondary to-secondary/30" />
        </motion.div>
      ))}

      {/* Loading bar */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.35, delay: 1.15, ease: 'easeOut' }}
        className="loading-holder pointer-events-none absolute inset-0 z-[105] flex flex-col items-center justify-center gap-space-sm"
      >
        <div className="loading-container relative h-[3px] w-[170px] overflow-hidden rounded-full bg-border">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.0, delay: 0.15, ease: [0.65, 0, 0.35, 1] }}
            className="loading h-full bg-secondary"
          />
        </div>
      </motion.div>
    </div>
  );
}
