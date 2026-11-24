import { motion, useReducedMotion } from 'framer-motion';

/**
 * AnimatedTitle displays a heading where each word animates on scroll.
 * Uses Framer Motion instead of GSAP to avoid extra dependencies.
 */
export default function AnimatedTitle({ title }: { title: string }) {
  const shouldReduce = useReducedMotion();
  const words = title.split(' ');

  if (shouldReduce) {
    return <h3 className="animated-title">{title}</h3>;
  }

  return (
    <h3 className="animated-title">
      {words.map((w, i) => (
        <motion.span
          key={i}
          className="gsap_split_word"
          aria-hidden="true"
          style={{ display: 'inline-block', marginRight: '0.25rem' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20% 0px 0px 0px' }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.12 }}
        >
          {w}
        </motion.span>
      ))}
    </h3>
  );
}
