import { Suspense, lazy, useRef } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ScrollReveal } from '../motion/ScrollReveal';
import { SplitText } from '../motion/SplitText';

const RouteMap3D = lazy(() => import('./RouteMap3D'));

/** Interactive 3D dot-matrix map of Egypt with glowing routes between the main destinations. */
export function RouteMapSection() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { margin: '200px' });
  const reduce = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden bg-[#05060f] py-20 text-white"
      aria-label={isAr ? 'خريطة مسارات مصر' : 'Egypt route map'}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 60% at 65% 50%, rgba(255,140,50,0.16), transparent 70%), radial-gradient(40% 40% at 10% 0%, rgba(80,70,200,0.18), transparent 70%)',
        }}
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-[80rem] items-center gap-10 px-6 sm:px-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <ScrollReveal>
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#b5e35a]">
              {isAr ? '(خريطة الرحلة)' : '(The Route)'}
            </span>
          </ScrollReveal>
          <h2 className="mt-3 font-serif text-4xl leading-[1.1] tracking-tight sm:text-5xl">
            <SplitText>{isAr ? 'من النيل إلى الصحراء' : 'From the Nile to the desert'}</SplitText>
          </h2>
          <ScrollReveal delay={0.15}>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/70">
              {isAr
                ? 'اسحب الماوس فوق المدن لتتبع المسارات بين أبرز وجهات مصر. النيل بالأزرق والمسارات بالذهبي.'
                : 'Move over the cities to follow the routes between Egypt\u2019s main destinations. The Nile is in blue, the routes in gold.'}
            </p>
          </ScrollReveal>
        </div>
        <div ref={ref} className="relative h-[460px] sm:h-[560px] lg:col-span-8">
          {visible ? (
            <Suspense fallback={null}>
              <RouteMap3D isAr={isAr} still={Boolean(reduce)} />
            </Suspense>
          ) : null}
        </div>
      </div>
    </section>
  );
}
