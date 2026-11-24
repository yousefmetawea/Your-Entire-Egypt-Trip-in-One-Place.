import { useRef } from 'react';
import ResponsiveImage from '../../components/ui/ResponsiveImage';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/cn';

export interface DeckImage {
  id: string;
  src: string;
  altEn: string;
  altAr: string;
  titleEn: string;
  titleAr: string;
  regionEn: string;
  regionAr: string;
}

const DECK_IMAGES: DeckImage[] = [
  {
    id: 'giza-pyramids',
    src: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=1600&q=80',
    altEn: 'The Great Pyramids of Giza rising against golden afternoon light',
    altAr: 'أهرامات الجيزة الخالدة تحت أشعة الشمس الذهبية',
    titleEn: 'Grand Egyptian Museum & Pyramids',
    titleAr: 'المتحف المصري الكبير والأهرامات',
    regionEn: 'Cairo & Giza',
    regionAr: 'القاهرة والجيزة',
  },
  {
    id: 'luxor-karnak',
    src: 'https://images.unsplash.com/photo-1781624617165-1058040d1906?auto=format&fit=crop&w=1600&q=80',
    altEn: 'The towering hypostyle columns of Karnak Temple in Luxor',
    altAr: 'أعمدة بهو الكرنك الشامخة في الأقصر',
    titleEn: 'Karnak & The Valley of Kings',
    titleAr: 'الكرنك ووادي الملوك',
    regionEn: 'Luxor & The Nile',
    regionAr: 'الأقصر والنيل',
  },
  {
    id: 'aswan-philae',
    src: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1600&q=80',
    altEn: 'Philae Temple illuminated on its island on the Nile River in Aswan',
    altAr: 'معبد فيلة المتلألئ على جزيرته النيلية في أسوان',
    titleEn: 'Island Sanctuary of Philae',
    titleAr: 'معبد فيلة وجزر النوبة',
    regionEn: 'Aswan',
    regionAr: 'أسوان',
  },
  {
    id: 'white-desert',
    src: 'https://images.unsplash.com/photo-1599571234909-29ed5d1321d6?auto=format&fit=crop&w=1600&q=80',
    altEn: 'Chalk rock sculptures under an immense starry sky in the White Desert',
    altAr: 'صخور الطباشير السريالية تحت سماء الصحراء البيضاء المرصعة بالنجوم',
    titleEn: 'White Desert National Park',
    titleAr: 'محمية الصحراء البيضاء السريالية',
    regionEn: 'Western Desert',
    regionAr: 'الصحراء الغربية',
  },
  {
    id: 'siwa-salt-lakes',
    src: 'https://images.unsplash.com/photo-1771838877353-c1a58cfd399f?auto=format&fit=crop&w=1600&q=80',
    altEn: 'The turquoise salt lakes and date palms of Siwa Oasis at sunset',
    altAr: 'بحيرات الملح الفيروزية ونخيل واحة سيوة عند الغروب',
    titleEn: 'Siwa Salt Lakes & Ancient Fortress',
    titleAr: 'بحيرات الملح الفيروزية وقلعة شالي',
    regionEn: 'Siwa Oasis',
    regionAr: 'واحة سيوة',
  },
];

/**
 * Recreates the exact OVO Legion Hero Images Holder & Composition:
 *
 * 1. .hero-images-holder: perspective 1500px, flex centered, absolute inset-0.
 * 2. .hero-images-container-last: Front primary image (Great Pyramids of Giza).
 *    Initial entrance (t=1.8s) contracts from scale 1.15 down to 1.0 (outExpo).
 * 3. .hero-images-container _01 to _04: Layered companion images at rotations
 *    (0deg, 4deg, -4deg, -2deg) entering with staggered reveals.
 * 4. Scroll-Linked Parallax (Reference: a-3 "Hero Animation -> While Scrolling"):
 *    Front card translates y: 0 -> -90px, scale: 1 -> 1.06.
 *    Companion cards separate and drift downward y: 0 -> 240px with expanding rotation.
 */
export function HeroImageDeck({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);


  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Scroll transforms matching OVO Legion a-3
  const frontY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const frontScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  const layer1Y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const layer2Y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const layer3Y = useTransform(scrollYProgress, [0, 1], [0, 260]);
  const layer4Y = useTransform(scrollYProgress, [0, 1], [0, 310]);

  const layer2Rotate = useTransform(scrollYProgress, [0, 1], [4, 8]);
  const layer3Rotate = useTransform(scrollYProgress, [0, 1], [-4, -9]);
  const layer4Rotate = useTransform(scrollYProgress, [0, 1], [-2, -5]);

  const primaryImage = DECK_IMAGES[0];
  const layer1 = DECK_IMAGES[1];
  const layer2 = DECK_IMAGES[2];
  const layer3 = DECK_IMAGES[3];
  const layer4 = DECK_IMAGES[4];

  return (
    <div
      ref={containerRef}
      className={cn('relative flex w-full flex-col items-center justify-center', className)}
    >
      {/* 3D Perspective Canvas matching OVO Legion (.hero-images-holder) */}
      <div
        style={{ perspective: 1500 }}
        className="relative flex h-[380px] w-full max-w-[500px] items-center justify-center sm:h-[460px] md:h-[520px]"
      >
        {/* Layer 4: Siwa Oasis (rotate: -2deg) */}
        <motion.div
          style={{
            y: shouldReduceMotion ? 0 : layer4Y,
            rotate: shouldReduceMotion ? -2 : layer4Rotate,
          }}
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 0.85, y: 0, scale: 0.92 }}
          transition={{ duration: 0.8, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
          className="hero-images-container _04 absolute inset-0 m-auto h-[75%] w-[82%] overflow-hidden rounded-2xl border border-hairline/80 bg-surface-container-low shadow-md"
        >
          <ResponsiveImage
            placeId={layer4.id}
            alt={isAr ? layer4.altAr : layer4.altEn}
            className="h-full w-full object-cover filter brightness-[0.88]"
            srcOverride={layer4.src}
          />
        </motion.div>

        {/* Layer 3: White Desert Monoliths (rotate: -4deg) */}
        <motion.div
          style={{
            y: shouldReduceMotion ? 0 : layer3Y,
            rotate: shouldReduceMotion ? -4 : layer3Rotate,
          }}
          initial={{ opacity: 0, y: 35, scale: 0.92 }}
          animate={{ opacity: 0.9, y: 0, scale: 0.95 }}
          transition={{ duration: 0.8, delay: 2.05, ease: [0.16, 1, 0.3, 1] }}
          className="hero-images-container _03 absolute inset-0 m-auto h-[80%] w-[85%] overflow-hidden rounded-2xl border border-hairline/80 bg-surface-container-low shadow-lg"
        >
          <ResponsiveImage
            placeId={layer3.id}
            alt={isAr ? layer3.altAr : layer3.altEn}
            className="h-full w-full object-cover filter brightness-[0.92]"
            srcOverride={layer3.src}
          />
        </motion.div>

        {/* Layer 2: Island Sanctuary of Philae (rotate: 4deg) */}
        <motion.div
          style={{
            y: shouldReduceMotion ? 0 : layer2Y,
            rotate: shouldReduceMotion ? 4 : layer2Rotate,
          }}
          initial={{ opacity: 0, y: 30, scale: 0.94 }}
          animate={{ opacity: 0.95, y: 0, scale: 0.97 }}
          transition={{ duration: 0.8, delay: 1.9, ease: [0.16, 1, 0.3, 1] }}
          className="hero-images-container _02 absolute inset-0 m-auto h-[85%] w-[88%] overflow-hidden rounded-2xl border border-hairline bg-surface-container-low shadow-xl"
        >
          <ResponsiveImage
            placeId={layer2.id}
            alt={isAr ? layer2.altAr : layer2.altEn}
            className="h-full w-full object-cover filter brightness-[0.96]"
            srcOverride={layer2.src}
          />
        </motion.div>

        {/* Layer 1: Karnak Temple Colonnades */}
        <motion.div
          style={{
            y: shouldReduceMotion ? 0 : layer1Y,
          }}
          initial={{ opacity: 0, y: 25, scale: 0.96 }}
          animate={{ opacity: 0.98, y: 0, scale: 0.99 }}
          transition={{ duration: 0.8, delay: 1.75, ease: [0.16, 1, 0.3, 1] }}
          className="hero-images-container _01 absolute inset-0 m-auto h-[90%] w-[92%] overflow-hidden rounded-2xl border border-hairline bg-surface-container-low shadow-xl"
        >
          <ResponsiveImage
            placeId={layer1.id}
            alt={isAr ? layer1.altAr : layer1.altEn}
            className="h-full w-full object-cover"
            srcOverride={layer1.src}
          />
        </motion.div>

        {/* Front Primary Container: Great Pyramids & Sphinx (hero-images-container-last) */}
        <motion.div
          style={{
            y: shouldReduceMotion ? 0 : frontY,
            scale: shouldReduceMotion ? 1 : frontScale,
          }}
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 1, scale: 1.0 }}
          transition={{ duration: 0.85, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="hero-images-container-last relative z-10 h-full w-full overflow-hidden rounded-2xl border border-hairline bg-surface-container-low shadow-2xl"
        >
          <ResponsiveImage
            placeId={primaryImage.id}
            alt={isAr ? primaryImage.altAr : primaryImage.altEn}
            className="h-full w-full object-cover"
            srcOverride={primaryImage.src}
          />
        </motion.div>
      </div>

      {/* External Details Bar — strictly OUTSIDE image container */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 2.3 }}
        className="mt-space-md flex w-full max-w-[500px] items-center justify-between px-space-xs text-xs"
      >
        <div className="flex items-center gap-space-xs">
          <span className="size-2 rounded-full bg-secondary" aria-hidden="true" />
          <span className="font-serif text-sm font-medium text-primary">
            {isAr ? primaryImage.titleAr : primaryImage.titleEn}
          </span>
        </div>
        <span className="type-label-sm font-mono uppercase tracking-wider text-on-surface-variant">
          {isAr ? primaryImage.regionAr : primaryImage.regionEn}
        </span>
      </motion.div>
    </div>
  );
}
