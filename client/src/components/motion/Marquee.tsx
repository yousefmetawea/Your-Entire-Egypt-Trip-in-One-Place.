import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/cn';

export interface MarqueeProps {
  items?: string[];
  children?: React.ReactNode;
  speed?: number;
  reverse?: boolean;
  className?: string;
  itemClassName?: string;
  separator?: string;
}

export function Marquee({
  items,
  children,
  speed = 28,
  reverse = false,
  className,
  itemClassName,
  separator = '—',
}: MarqueeProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const shouldReduceMotion = useReducedMotion();

  // If children provided, duplicate children; otherwise duplicate items
  const renderContent = () => {
    if (children) {
      return (
        <>
          <div className="flex shrink-0 items-center gap-space-lg">{children}</div>
          <div className="flex shrink-0 items-center gap-space-lg" aria-hidden="true">
            {children}
          </div>
        </>
      );
    }

    if (!items || items.length === 0) return null;

    const sequence = items.map((item, idx) => (
      <span key={`${item}-${idx}`} className="inline-flex items-center gap-space-lg">
        <span className={itemClassName}>{item}</span>
        {separator && <span className="opacity-40">{separator}</span>}
      </span>
    ));

    return (
      <>
        <div className="flex shrink-0 items-center gap-space-lg">{sequence}</div>
        <div className="flex shrink-0 items-center gap-space-lg" aria-hidden="true">
          {sequence}
        </div>
        <div className="flex shrink-0 items-center gap-space-lg" aria-hidden="true">
          {sequence}
        </div>
      </>
    );
  };

  if (shouldReduceMotion) {
    return (
      <div className={cn('overflow-hidden whitespace-nowrap', className)}>
        <div className="flex items-center gap-space-lg">{renderContent()}</div>
      </div>
    );
  }

  // Determine direction based on RTL and reverse prop
  const moveLeft = isRtl ? reverse : !reverse;
  const initialX = moveLeft ? '0%' : '-50%';
  const targetX = moveLeft ? '-50%' : '0%';

  return (
    <div
      className={cn('group flex select-none overflow-hidden whitespace-nowrap', className)}
      aria-hidden="true"
    >
      <motion.div
        className="flex shrink-0 items-center gap-space-lg"
        initial={{ x: initialX }}
        animate={{ x: targetX }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: speed,
        }}
      >
        {renderContent()}
      </motion.div>
    </div>
  );
}
