import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router';

const CURTAIN_COLUMNS = [0, 1, 2, 3, 4] as const;

/**
 * Recreates the exact OVO Legion Opening Sequence (t-329dae00):
 *
 * 1. .curtains: Overlay with 5 white columns and a central loading holder.
 * 2. .loading (0.15s - 1.15s, duration 1.0s, easeInOut):
 *    Progress bar expands from width 0% to 100%.
 * 3. .loading-container (1.15s - 1.5s, duration 0.35s):
 *    Fades out (opacity: 1 -> 0).
 * 4. .curtains-white (1.15s - 1.65s, duration 0.5s, stagger 0.08s):
 *    5 columns collapse height from 100% to 0% with sequential stagger.
 * 5. Complete unmount at t=1.7s to prevent any layout or pointer-events blocking.
 */
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
      className="curtains pointer-events-none fixed inset-0 z-[100] flex h-screen w-screen overflow-hidden"
      aria-hidden="true"
    >
      {/* 5 Vertical White Curtain Columns (Reference: .curtains-white _1 to _5) */}
      {CURTAIN_COLUMNS.map((index) => (
        <motion.div
          key={index}
          initial={{ height: '100%' }}
          animate={{ height: '0%' }}
          transition={{
            duration: 0.55,
            delay: 1.15 + index * 0.08,
            ease: [0.76, 0, 0.24, 1],
          }}
          onAnimationComplete={
            index === CURTAIN_COLUMNS.length - 1 ? () => setVisible(false) : undefined
          }
          className="curtains-white relative h-full flex-1 border-e border-hairline/40 bg-surface-container-low shadow-2xl"
        >
          {/* Subtle signature crimson bottom accent line on each curtain panel */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-secondary/30 via-secondary to-secondary/30" />
        </motion.div>
      ))}

      {/* Central Progress Loading Holder (Reference: .loading-holder > .loading-container > .loading) */}
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
            transition={{
              duration: 1.0,
              delay: 0.15,
              ease: [0.65, 0, 0.35, 1],
            }}
            className="loading h-full bg-secondary"
          />
        </div>
      </motion.div>
    </div>
  );
}
