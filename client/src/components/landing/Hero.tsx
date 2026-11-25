// Hero.tsx - OVO Legion hero, rebuilt from the reference's IX3 timelines (webflow.schunk, ids t-329dae00 and t-e2b057c6).
//
// Intro (seconds): loader bar 0.3-1.51 | loader fades + 5 curtain strips lift 1.5-2.4 (stagger 0.4)
//   | last photo shrinks 104% -> 45x55% at 2.4 (0.8s) | four photos shrink 100% -> 45x55% + fade in at 3.06 (0.8s, stagger 0.6 from the back).
// Scroll: ScrollTrigger on the 500vh wrapper, "top bottom" -> "bottom 80%", scrub 0.8. The four photos slide up to -150%, one after another.
// Marquee: each headline copy moves 0 -> -100% in 15s, linear, forever.
import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ResponsiveImage from '../ui/ResponsiveImage';
import styles from '../Hero.module.css';

gsap.registerPlugin(ScrollTrigger);

/** Existing site photos. Swap the `src`/`alt` here later; order is front to back. */
const LAYERS = [
  {
    id: '01',
    src: '/images/hero/pyramids.jpg',
    alt: 'The Pyramids and Sphinx at Giza',
    className: styles.layer01,
    rotation: 0,
  },
  {
    id: '02',
    src: '/images/hero/karnak.jpg',
    alt: 'Karnak Temple at sunset',
    className: styles.layer02,
    rotation: 4,
  },
  {
    id: '03',
    src: '/images/places/luxor-temple.jpg',
    alt: 'Luxor Temple colonnade',
    className: styles.layer03,
    rotation: -4,
  },
  {
    id: '04',
    src: '/images/places/siwa-salt-lakes.jpg',
    alt: 'Siwa salt lakes',
    className: styles.layer04,
    rotation: -2,
  },
] as const;

const LAST_LAYER = {
  src: '/images/places/al-muizz-street.jpg',
  alt: 'Cairo skyline with historic mosques',
};

const COPIES = [0, 1, 2, 3, 4, 5];

export function Hero() {
  const { t } = useTranslation();
  const headline = t('home.landingHero.headline');
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const q = <T extends HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel, root);
    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      const layers = q('[data-hero-layer]');
      const last = q('[data-hero-last]')[0];
      const strips = q('[data-hero-strip]');
      const loaderBar = q('[data-hero-bar]')[0];
      const loaderBox = q('[data-hero-loader]')[0];
      const overlay = q('[data-hero-overlay]')[0];
      const copies = q('[data-hero-copy]');
      const finalSize = () =>
        window.matchMedia('(max-width: 991px)').matches
          ? { width: '64%', height: '38%' }
          : { width: '30%', height: '56%' };

      gsap.set(layers, { rotation: (i: number) => LAYERS[i].rotation });

      mm.add('(prefers-reduced-motion: reduce)', () => {
        // Calm, final composition. No intro, no scroll sequence, no marquee.
        gsap.set(overlay, { display: 'none' });
        gsap.set(root, { height: '100vh' });
        gsap.set(layers, { opacity: 1, ...finalSize() });
        gsap.set(last, finalSize());
      });

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const size = finalSize();

        // Marquee: one long-running linear loop per copy.
        gsap.to(copies, { xPercent: -100, duration: 15, ease: 'none', repeat: -1 });

        // Intro.
        const intro = gsap.timeline({ onComplete: () => gsap.set(overlay, { display: 'none' }) });
        intro
          .fromTo(
            loaderBar,
            { width: '0%' },
            { width: '100%', duration: 1.21, ease: 'power2.inOut' },
            0.3,
          )
          .to(loaderBox, { opacity: 0, duration: 0.5 }, 1.5)
          .fromTo(
            strips,
            { height: '100%' },
            { height: '0%', duration: 0.5, ease: 'power1.inOut', stagger: { amount: 0.4 } },
            1.5,
          )
          .fromTo(
            last,
            { width: '104%', height: '104%' },
            { ...size, duration: 0.8, ease: 'expo.out' },
            2.4,
          )
          .fromTo(
            layers,
            { opacity: 0, width: '100%', height: '100%' },
            {
              opacity: 1,
              ...size,
              duration: 0.8,
              ease: 'expo.out',
              stagger: { amount: 0.6, from: 'end' },
            },
            3.06,
          );

        // Scroll: layers leave upward, front first.
        gsap.fromTo(
          layers,
          { yPercent: 0 },
          {
            yPercent: -150,
            duration: 0.1,
            ease: 'power1.inOut',
            stagger: { amount: 0.3, from: 'start' },
            scrollTrigger: {
              trigger: root,
              start: 'clamp(top bottom)',
              end: 'clamp(bottom 80%)',
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          },
        );

        return () => {
          intro.kill();
        };
      });
    }, root);

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className={styles.heroWrapper}
      aria-label={t('home.landingHero.ariaLabel')}
    >
      <div data-hero-overlay className={styles.curtains} aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} data-hero-strip className={styles.curtainStrip} />
        ))}
        <div className={styles.loadingHolder}>
          <div data-hero-loader className={styles.loadingTrack}>
            <div data-hero-bar className={styles.loadingBar} />
          </div>
        </div>
      </div>

      <div className={styles.heroSticky}>
        <div className={styles.heroTextTrack} aria-hidden="true">
          {COPIES.map((n) => (
            <div key={n} data-hero-copy className={styles.heroTextItem}>
              {headline}
            </div>
          ))}
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroImagesHolder}>
            <div data-hero-last className={styles.layerLast}>
              <ResponsiveImage
                srcOverride={LAST_LAYER.src}
                alt={LAST_LAYER.alt}
                className={styles.heroImage}
              />
            </div>
            {LAYERS.map((layer) => (
              <div
                key={layer.id}
                data-hero-layer
                className={`${styles.heroImageContainer} ${layer.className}`}
              >
                <ResponsiveImage
                  srcOverride={layer.src}
                  alt={layer.alt}
                  className={styles.heroImage}
                />
              </div>
            ))}
          </div>

          <div className={styles.heroParagraphHolder}>
            <p className={styles.titleParagraph}>{t('home.landingHero.tagline')}</p>
            <Link to="/plan" className={styles.heroButton}>
              <span className={styles.redCircle} />
              {t('home.landingHero.cta')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
export default Hero;
