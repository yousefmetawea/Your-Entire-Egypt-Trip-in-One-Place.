// Hero.tsx – Faithful reproduction of OVO Legion scroll-driven layered hero
import { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import styles from '../Hero.module.css';
import localHeroImageMap from './localHeroImageMap.json';

interface LayerItem {
  key: string;
  local: string;
  fallback: string;
  alt: string;
  className: string;
}

const LAYERS: LayerItem[] = [
  {
    key: 'layer_01_giza',
    local: localHeroImageMap.layer_01_giza.local,
    fallback: localHeroImageMap.layer_01_giza.fallback,
    alt: localHeroImageMap.layer_01_giza.alt,
    className: styles.layer01,
  },
  {
    key: 'layer_02_karnak',
    local: localHeroImageMap.layer_02_karnak.local,
    fallback: localHeroImageMap.layer_02_karnak.fallback,
    alt: localHeroImageMap.layer_02_karnak.alt,
    className: styles.layer02,
  },
  {
    key: 'layer_03_philae',
    local: localHeroImageMap.layer_03_philae.local,
    fallback: localHeroImageMap.layer_03_philae.fallback,
    alt: localHeroImageMap.layer_03_philae.alt,
    className: styles.layer03,
  },
  {
    key: 'layer_04_white_desert',
    local: localHeroImageMap.layer_04_white_desert.local,
    fallback: localHeroImageMap.layer_04_white_desert.fallback,
    alt: localHeroImageMap.layer_04_white_desert.alt,
    className: styles.layer04,
  },
];

const LAST_LAYER = {
  key: 'layer_last_siwa',
  local: localHeroImageMap.layer_last_siwa.local,
  fallback: localHeroImageMap.layer_last_siwa.fallback,
  alt: localHeroImageMap.layer_last_siwa.alt,
  className: styles.layerLast,
};

function HeroImageElement({
  localSrc,
  fallbackSrc,
  alt,
}: {
  localSrc: string;
  fallbackSrc: string;
  alt: string;
}) {
  const [currentSrc, setCurrentSrc] = useState(localSrc);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={styles.heroImage}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Entrance zoom controls for layer 1 (scale 1.0 -> 0.95 over 800ms outExpo)
  const zoomControls = useAnimation();

  useEffect(() => {
    if (shouldReduceMotion) return;
    void zoomControls.start({
      scale: 0.95,
      transition: {
        duration: 0.8,
        ease: [0.19, 1, 0.22, 1], // outExpo cubic bezier
      },
    });
  }, [zoomControls, shouldReduceMotion]);

  // Track document scroll relative to heroRef
  // Starts when hero top hits viewport top ('start start')
  // Completes when hero bottom hits viewport bottom ('end end')
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end end'],
  });

  // Layer 1 transition (0.00 -> 0.22)
  const opacity1 = useTransform(scrollYProgress, [0.0, 0.22], [1, 0]);
  const translateY1 = useTransform(scrollYProgress, [0.0, 0.22], [0, 160]);
  const blur1 = useTransform(scrollYProgress, [0.0, 0.22], ['blur(0px)', 'blur(15px)']);

  // Layer 2 transition (0.18 -> 0.44)
  const opacity2 = useTransform(scrollYProgress, [0.18, 0.44], [1, 0]);
  const translateY2 = useTransform(scrollYProgress, [0.18, 0.44], [0, 160]);
  const blur2 = useTransform(scrollYProgress, [0.18, 0.44], ['blur(0px)', 'blur(15px)']);

  // Layer 3 transition (0.40 -> 0.66)
  const opacity3 = useTransform(scrollYProgress, [0.40, 0.66], [1, 0]);
  const translateY3 = useTransform(scrollYProgress, [0.40, 0.66], [0, 160]);
  const blur3 = useTransform(scrollYProgress, [0.40, 0.66], ['blur(0px)', 'blur(15px)']);

  // Layer 4 transition (0.62 -> 0.88)
  const opacity4 = useTransform(scrollYProgress, [0.62, 0.88], [1, 0]);
  const translateY4 = useTransform(scrollYProgress, [0.62, 0.88], [0, 160]);
  const blur4 = useTransform(scrollYProgress, [0.62, 0.88], ['blur(0px)', 'blur(15px)']);

  // Background oversized marquee text parallax translation
  const marqueeX = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);

  // Final static layer subtle scale response (1 -> 1.05) matching OVO a-3
  const finalScale = useTransform(scrollYProgress, [0.6, 1], [1, 1.05]);

  return (
    <section ref={heroRef} className={styles.heroWrapper} aria-label="Hero Experience">
      <div className={styles.heroSticky}>
        {/* Background Animated Typography - Placed strictly behind image stack */}
        <div className={styles.heroTextTrack} aria-hidden="true">
          <motion.div className={styles.heroTextRow} style={{ x: marqueeX }}>
            <span className={styles.heroTextItem}>YourTrip — Curated Luxury Egypt</span>
            <span className={styles.heroTextItem}>Discover Cairo & The Nile</span>
            <span className={styles.heroTextItem}>Bespoke Journeys</span>
            <span className={styles.heroTextItem}>YourTrip — Curated Luxury Egypt</span>
          </motion.div>
        </div>

        {/* Central 5-layer composition */}
        <div className={styles.heroImagesHolder}>
          {/* Layer 5: Permanent Final Image (Siwa Oasis) */}
          <motion.div
            className={`${styles.heroImageContainer} ${LAST_LAYER.className}`}
            style={{ scale: finalScale }}
          >
            <HeroImageElement
              localSrc={LAST_LAYER.local}
              fallbackSrc={LAST_LAYER.fallback}
              alt={LAST_LAYER.alt}
            />
          </motion.div>

          {/* Layer 4: White Desert */}
          <motion.div
            className={`${styles.heroImageContainer} ${LAYERS[3].className}`}
            style={{
              opacity: opacity4,
              y: translateY4,
              filter: blur4,
            }}
          >
            <HeroImageElement
              localSrc={LAYERS[3].local}
              fallbackSrc={LAYERS[3].fallback}
              alt={LAYERS[3].alt}
            />
          </motion.div>

          {/* Layer 3: Philae Temple */}
          <motion.div
            className={`${styles.heroImageContainer} ${LAYERS[2].className}`}
            style={{
              opacity: opacity3,
              y: translateY3,
              filter: blur3,
            }}
          >
            <HeroImageElement
              localSrc={LAYERS[2].local}
              fallbackSrc={LAYERS[2].fallback}
              alt={LAYERS[2].alt}
            />
          </motion.div>

          {/* Layer 2: Karnak Temple */}
          <motion.div
            className={`${styles.heroImageContainer} ${LAYERS[1].className}`}
            style={{
              opacity: opacity2,
              y: translateY2,
              filter: blur2,
            }}
          >
            <HeroImageElement
              localSrc={LAYERS[1].local}
              fallbackSrc={LAYERS[1].fallback}
              alt={LAYERS[1].alt}
            />
          </motion.div>

          {/* Layer 1: Pyramids of Giza (Front layer with initial 800ms scale entrance) */}
          <motion.div
            className={`${styles.heroImageContainer} ${LAYERS[0].className}`}
            animate={zoomControls}
            style={{
              opacity: opacity1,
              y: translateY1,
              filter: blur1,
            }}
          >
            <HeroImageElement
              localSrc={LAYERS[0].local}
              fallbackSrc={LAYERS[0].fallback}
              alt={LAYERS[0].alt}
            />
          </motion.div>
        </div>

        {/* Floating editorial caption badge */}
        <div className={styles.heroCaptionHolder} aria-hidden="true">
          <span className={styles.heroCaption}>Scroll to Explore</span>
        </div>
      </div>
    </section>
  );
}
export default Hero;
