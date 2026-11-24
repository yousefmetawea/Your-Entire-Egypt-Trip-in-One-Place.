import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/cn';

export interface SplitTextProps {
  children: string;
  className?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
}

export function SplitText({
  children,
  className,
  delay = 0,
  as: Component = 'span',
}: SplitTextProps) {
  const shouldReduceMotion = useReducedMotion();
  const words = children.split(' ');

  if (shouldReduceMotion) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component className={cn('inline-block', className)}>
      {words.map((word, wordIndex) => (
        <span key={`${word}-${wordIndex}`} className="inline-block overflow-hidden pb-1 align-top">
          <motion.span
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{
              duration: 0.65,
              delay: delay + wordIndex * 0.045,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="inline-block"
          >
            {word}
          </motion.span>
          {wordIndex < words.length - 1 ? '\u00A0' : null}
        </span>
      ))}
    </Component>
  );
}
