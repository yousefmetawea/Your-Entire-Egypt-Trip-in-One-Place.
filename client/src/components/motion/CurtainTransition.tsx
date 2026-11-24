import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router';

const columns = [0, 1, 2, 3, 4] as const;

export function CurtainTransition() {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  if (shouldReduceMotion || !visible) {
    return null;
  }

  return (
    <div
      key={location.pathname}
      className="pointer-events-none fixed inset-0 z-[100] flex h-screen w-screen overflow-hidden"
      aria-hidden="true"
    >
      {columns.map((index) => (
        <motion.div
          key={index}
          initial={{ y: '0%' }}
          animate={{ y: '-100%' }}
          transition={{
            duration: 0.75,
            delay: index * 0.045,
            ease: [0.76, 0, 0.24, 1],
          }}
          onAnimationComplete={index === columns.length - 1 ? () => setVisible(false) : undefined}
          className="relative h-full flex-1 border-e border-hairline/60 bg-gradient-to-b from-surface via-surface-container-low to-surface-container shadow-2xl"
        >
          {/* Subtle signature crimson bottom accent line on each curtain panel */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-secondary/30 via-secondary to-secondary/30" />
        </motion.div>
      ))}
    </div>
  );
}
