import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { motionTransition } from '../../lib/motion';

export interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { ...motionTransition, delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
