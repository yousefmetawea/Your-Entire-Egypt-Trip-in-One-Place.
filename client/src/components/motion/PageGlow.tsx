import { motion, useReducedMotion } from 'framer-motion';

/** Slow drifting warm light and fine grain behind inner-page headers. */
export function PageGlow() {
  const reduce = useReducedMotion();
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[480px] overflow-hidden mix-blend-multiply"
      aria-hidden="true"
    >
      <motion.div
        className="absolute -top-40 start-[8%] size-[520px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(255,160,70,0.20), transparent 65%)' }}
        animate={reduce ? undefined : { x: [0, 80, -30, 0], y: [0, 40, 10, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -top-52 end-[6%] size-[460px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(120,100,220,0.14), transparent 65%)' }}
        animate={reduce ? undefined : { x: [0, -60, 40, 0], y: [0, 30, -10, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  );
}
