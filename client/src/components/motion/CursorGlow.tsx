import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/** Soft warm light that follows the mouse (fine pointers only). */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    const move = (e: PointerEvent) => {
      el.style.opacity = '1';
      x(e.clientX - 160);
      y(e.clientY - 160);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed start-0 top-0 z-[80] size-80 rounded-full opacity-0 transition-opacity duration-500"
      style={{
        background: 'radial-gradient(circle, rgba(255,150,60,0.16) 0%, rgba(255,150,60,0) 65%)',
      }}
    />
  );
}
