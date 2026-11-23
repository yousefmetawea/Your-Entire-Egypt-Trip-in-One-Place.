import { motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router';

const columns = [0, 1, 2, 3, 4] as const;

export function CurtainTransition() {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
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
            duration: 0.7,
            delay: index * 0.05,
            ease: [0.76, 0, 0.24, 1],
          }}
          className="relative h-full flex-1 border-r border-hairline/20 bg-surface-container-low shadow-sm"
        />
      ))}
    </div>
  );
}
