import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/cn';

export interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  blurAmount?: number;
  as?: 'div' | 'section' | 'article' | 'span';
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  duration = 0.7,
  yOffset = 36,
  blurAmount = 8,
  as = 'div',
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const Component = motion[as];

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Component
      initial={{
        opacity: 0,
        y: yOffset,
        filter: `blur(${blurAmount}px)`,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
      }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn('will-change-[transform,opacity,filter]', className)}
    >
      {children}
    </Component>
  );
}
