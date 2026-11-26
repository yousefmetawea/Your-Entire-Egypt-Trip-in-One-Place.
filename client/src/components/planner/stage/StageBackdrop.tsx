import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/** One real photo per step. Files checked by eye; filenames in this repo are not reliable. */
const STEP_PHOTOS: ReadonlyArray<{ src: string; position: string }> = [
  { src: '/images/places/pyramids-of-giza.jpg', position: '50% 60%' },
  { src: '/images/stay/hotels/nile-breeze.jpg', position: '50% 50%' },
  { src: '/images/places/luxor-temple.jpg', position: '50% 45%' },
  { src: '/images/places/karnak-temple.jpg', position: '50% 38%' },
  { src: '/images/stay/hotels/red-sea.jpg', position: '50% 55%' },
  { src: '/images/hero/pyramids.jpg', position: '50% 55%' },
];

export function StageBackdrop({ stepIndex, direction }: { stepIndex: number; direction: 1 | -1 }) {
  const reduce = useReducedMotion();
  const { i18n } = useTranslation();
  const rtl = i18n.dir() === 'rtl';
  const parallax = useRef<HTMLDivElement>(null);
  const photo = STEP_PHOTOS[Math.min(stepIndex, STEP_PHOTOS.length - 1)];

  // Preload the next photo so the wipe never shows an empty frame.
  useEffect(() => {
    const next = STEP_PHOTOS[stepIndex + 1];
    if (next) new Image().src = next.src;
  }, [stepIndex]);

  // Pointer parallax, fine pointers only.
  useEffect(() => {
    const el = parallax.current;
    if (!el || reduce || !window.matchMedia('(pointer: fine)').matches) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const px = event.clientX / window.innerWidth - 0.5;
        const py = event.clientY / window.innerHeight - 0.5;
        el.style.transform = `translate3d(${(-px * 22).toFixed(1)}px, ${(-py * 14).toFixed(1)}px, 0)`;
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
    };
  }, [reduce]);

  // The wipe enters from the side the user is moving toward.
  const fromEnd = (direction === 1) !== rtl;
  const hidden = fromEnd ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#101C15]"
      aria-hidden="true"
    >
      <div
        ref={parallax}
        className="absolute -inset-[3%] transition-transform duration-500 ease-out will-change-transform"
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={stepIndex}
            className="absolute inset-0"
            initial={reduce ? { opacity: 0 } : { clipPath: hidden }}
            animate={reduce ? { opacity: 1 } : { clipPath: 'inset(0 0 0 0)' }}
            exit={{
              opacity: 0,
              transition: { duration: reduce ? 0.2 : 1.3, delay: reduce ? 0 : 0.2 },
            }}
            transition={{ duration: reduce ? 0.25 : 1.15, ease: [0.76, 0, 0.24, 1] }}
          >
            <img
              src={photo.src}
              alt=""
              data-alt={stepIndex % 2 === 1 ? '' : undefined}
              className="stage-photo absolute inset-0 size-full object-cover"
              style={{ objectPosition: photo.position }}
              decoding="async"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-[#101C15] via-[#101C15]/80 to-[#101C15]/30 rtl:bg-gradient-to-l" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_30%,rgba(31,107,63,0.28),transparent_60%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#101C15] to-transparent" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#101C15]/80 to-transparent" />
      <div className="stage-grain absolute inset-0" />
    </div>
  );
}
