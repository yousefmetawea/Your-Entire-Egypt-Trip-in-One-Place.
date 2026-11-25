import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';
import type { Copy } from './copy';
import { WAY_IMAGES } from './copy';

gsap.registerPlugin(ScrollTrigger);

/** Pinned horizontal gallery of ways to move. Stacks vertically on phones and for reduced motion. */
export function WaysToMove({ copy }: { copy: Copy }) {
  const isAr = useTranslation().i18n.language === 'ar';
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
        const size = () => {
          root.style.height = `${dist() + window.innerHeight}px`;
        };
        size();
        const tween = gsap.fromTo(
          track,
          { x: () => (isAr ? -dist() : 0) },
          {
          x: () => (isAr ? 0 : -dist()),
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.8,
            invalidateOnRefresh: true,
            onRefreshInit: size,
          },
          },
        );
        gsap.utils.toArray<HTMLElement>('[data-way-img]', track).forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -9 },
            {
              xPercent: 9,
              ease: 'none',
              scrollTrigger: {
                trigger: img.parentElement,
                containerAnimation: tween,
                start: 'left right',
                end: 'right left',
                scrub: true,
              },
            },
          );
        });
        return () => {
          root.style.height = '';
        };
      });
    }, root);
    return () => {
      mm.revert();
      ctx.revert();
    };
  }, [isAr]);

  return (
    <section ref={rootRef} className="relative bg-[#070a12] text-white">
      <div  dir="ltr" className="py-20 min-[900px]:sticky min-[900px]:top-0 min-[900px]:flex min-[900px]:h-screen min-[900px]:items-center min-[900px]:overflow-hidden min-[900px]:py-0 motion-reduce:min-[900px]:static motion-reduce:min-[900px]:block motion-reduce:min-[900px]:h-auto motion-reduce:min-[900px]:overflow-visible motion-reduce:min-[900px]:py-20 ">
        <div
          dir="ltr"
          ref={trackRef}
          className={`flex flex-col gap-10 px-6 min-[900px]:w-max ${isAr ? 'min-[900px]:flex-row-reverse' : 'min-[900px]:flex-row'} min-[900px]:items-center min-[900px]:gap-14 min-[900px]:px-12 motion-reduce:min-[900px]:w-auto motion-reduce:min-[900px]:flex-col motion-reduce:min-[900px]:items-stretch`}
        >
          <div
            className="flex shrink-0 flex-col justify-center gap-5 min-[900px]:w-[30vw] motion-reduce:min-[900px]:w-auto"
            dir={copy.waysTitle.match(/[\u0600-\u06FF]/) ? 'rtl' : 'ltr'}
          >
            <span className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#ffb25a]">
              <span className="h-px w-10 bg-[#ffb25a]" />
              {copy.waysEyebrow}
            </span>
            <h2 className="text-4xl font-semibold leading-tight md:text-6xl">{copy.waysTitle}</h2>
          </div>
          {copy.ways.map((w, i) => (
            <article
              key={w.tag}
              className="relative shrink-0 min-[900px]:w-[44vw] motion-reduce:min-[900px]:w-auto"
              dir={copy.waysTitle.match(/[\u0600-\u06FF]/) ? 'rtl' : 'ltr'}
            >
              <div className="relative h-[52vh] min-h-[320px] overflow-hidden rounded-3xl">
                <img
                  data-way-img
                  src={WAY_IMAGES[i]}
                  alt=""
                  className="absolute inset-y-0 -inset-x-[12%] h-full w-[124%] max-w-none object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <span className="absolute start-6 top-6 rounded-full border border-white/30 bg-black/30 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur-md">
                  0{i + 1} · {w.tag}
                </span>
                <div className="absolute inset-x-6 bottom-6 flex flex-col gap-2">
                  <h3 className="text-3xl font-semibold md:text-4xl">{w.title}</h3>
                  <p className="max-w-md text-sm text-white/75">{w.line}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
