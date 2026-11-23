import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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
    id: 'giza-gem',
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
    src: 'https://images.unsplash.com/photo-1544885935-98dd03b09034?auto=format&fit=crop&w=1600&q=80',
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
    id: 'siwa-oasis',
    src: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1600&q=80',
    altEn: 'The turquoise salt lakes and date palms of Siwa Oasis at sunset',
    altAr: 'بحيرات الملح الفيروزية ونخيل واحة سيوة عند الغروب',
    titleEn: 'Siwa Salt Lakes & Ancient Fortress',
    titleAr: 'بحيرات الملح الفيروزية وقلعة شالي',
    regionEn: 'Siwa Oasis',
    regionAr: 'واحة سيوة',
  },
  {
    id: 'white-desert',
    src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    altEn: 'Chalk rock sculptures under an immense starry sky in the White Desert',
    altAr: 'صخور الطباشير السريالية تحت سماء الصحراء البيضاء المرصعة بالنجوم',
    titleEn: 'White Desert National Park',
    titleAr: 'محمية الصحراء البيضاء السريالية',
    regionEn: 'Western Desert',
    regionAr: 'الصحراء الغربية',
  },
];

// OVO Legion staggered rotation and positioning offsets
const CARD_ROTATIONS = [-4, 3, -2.5, 3.5, 0];

export function HeroImageDeck({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const shouldReduceMotion = useReducedMotion();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto cycle cards every 4.8 seconds unless hovered
  useEffect(() => {
    if (shouldReduceMotion || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % DECK_IMAGES.length);
    }, 4800);

    return () => clearInterval(timer);
  }, [shouldReduceMotion, isPaused]);

  const activeImage = DECK_IMAGES[currentIndex];

  return (
    <div
      className={cn('relative flex flex-col items-center justify-center', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Container holding the layered overlapping cards */}
      <div className="relative h-[22rem] w-[17rem] sm:h-[28rem] sm:w-[22rem] md:h-[32rem] md:w-[25rem] lg:h-[36rem] lg:w-[28rem]">
        {DECK_IMAGES.map((item, index) => {
          // Calculate relative position in the stack (0 = top, 1 = second, etc.)
          const position = (index - currentIndex + DECK_IMAGES.length) % DECK_IMAGES.length;
          const isTop = position === 0;
          const rotation = CARD_ROTATIONS[index % CARD_ROTATIONS.length];

          // We display up to 4 cards in the stack depth
          if (position > 3) return null;

          return (
            <motion.div
              key={item.id}
              className={cn(
                'absolute inset-0 cursor-pointer overflow-hidden rounded-[20px] sm:rounded-[28px] border border-sand/40 bg-surface-container-lowest shadow-2xl transition-shadow',
                isTop ? 'z-30 shadow-floating' : 'pointer-events-none z-10',
              )}
              initial={false}
              animate={{
                y: isTop ? 0 : position * 12,
                x: isTop ? 0 : (isAr ? -1 : 1) * (position * 10),
                scale: 1 - position * 0.05,
                rotate: isTop ? 0 : rotation,
                opacity: 1 - position * 0.18,
              }}
              transition={{
                duration: 0.85,
                ease: [0.16, 1, 0.3, 1],
              }}
              onClick={() => {
                if (!isTop) {
                  setCurrentIndex(index);
                }
              }}
            >
              {/* Clean image container — NO text on top of the image */}
              <div className="h-full w-full overflow-hidden bg-primary-container">
                <img
                  src={item.src}
                  alt={isAr ? item.altAr : item.altEn}
                  className="h-full w-full object-cover transition-transform duration-1000 ease-out hover:scale-105"
                  loading={index < 2 ? 'eager' : 'lazy'}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* External Editorial Caption Bar — strictly OUTSIDE the image container */}
      <div className="mt-space-md flex items-center justify-between gap-space-md w-full max-w-[17rem] sm:max-w-[22rem] md:max-w-[25rem] lg:max-w-[28rem] px-space-xs">
        <div className="flex items-center gap-space-xs min-w-0">
          <span className="size-2 rounded-full bg-secondary shrink-0" aria-hidden="true" />
          <AnimatePresence mode="wait">
            <motion.div
              key={activeImage.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="truncate"
            >
              <p className="type-title-sm truncate text-on-primary">
                {isAr ? activeImage.titleAr : activeImage.titleEn}
              </p>
              <p className="type-label text-secondary-fixed truncate">
                {isAr ? activeImage.regionAr : activeImage.regionEn}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress indicators / dots */}
        <div
          className="flex items-center gap-1.5 shrink-0"
          role="tablist"
          aria-label="Deck controls"
        >
          {DECK_IMAGES.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={idx === currentIndex}
              aria-label={`Show ${isAr ? item.titleAr : item.titleEn}`}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                idx === currentIndex
                  ? 'w-6 bg-secondary-fixed'
                  : 'w-1.5 bg-surface/30 hover:bg-surface/60',
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
