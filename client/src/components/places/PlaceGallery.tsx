import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ImageAsset, Place } from '../../types';
import { cn } from '../../lib/cn';
import { getGalleryLayout, getVisibleGalleryImages } from '../../lib/gallery';
import { PlaceMedia } from './PlaceMedia';
import { Lightbox } from './Lightbox';

export interface PlaceGalleryProps {
  place: Place;
}

interface GalleryTileProps {
  image: ImageAsset;
  index: number;
  total: number;
  onOpen: (index: number) => void;
  priority?: boolean;
  moreCount?: number;
  className?: string;
}

function GalleryTile({
  image,
  index,
  total,
  onOpen,
  priority = false,
  moreCount = 0,
  className,
}: GalleryTileProps) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      aria-label={t('placeDetails.gallery.open', { index: index + 1, total })}
      className={cn(
        'group relative block w-full cursor-zoom-in overflow-hidden rounded-card border border-hairline bg-primary-container text-start shadow-resting transition-shadow duration-300 hover:shadow-floating focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary',
        className,
      )}
    >
      <img
        src={image.src}
        alt={image.alt.en}
        width={image.width}
        height={image.height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className="size-full object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.03]"
      />
      <span
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/65 via-primary/5 to-transparent"
        aria-hidden="true"
      />
      {image.credit ? (
        <span className="pointer-events-none absolute bottom-space-sm start-space-sm max-w-[calc(100%-2rem)] truncate rounded-full bg-primary/70 px-space-sm py-1 type-label text-on-primary backdrop-blur-sm">
          {t('placeDetails.gallery.credit', { credit: image.credit })}
        </span>
      ) : null}
      {moreCount > 0 ? (
        <span className="pointer-events-none absolute end-space-sm bottom-space-sm rounded-full bg-surface/90 px-space-md py-space-xs type-label text-primary backdrop-blur-sm">
          {t('placeDetails.gallery.more', { count: moreCount })}
        </span>
      ) : null}
    </button>
  );
}

export function PlaceGallery({ place }: PlaceGalleryProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const layout = getGalleryLayout(place.images.length);
  const visible = getVisibleGalleryImages(place.images);
  const moreCount = place.images.length - visible.length;

  return (
    <section aria-labelledby={headingId} className="mt-space-xl">
      <h2 id={headingId} className="sr-only">
        {t('placeDetails.gallery.label')}
      </h2>

      {layout === 'empty' ? (
        <div className="relative h-[420px] overflow-hidden rounded-card border border-hairline shadow-floating md:h-[580px]">
          <div className="absolute inset-0">
            <PlaceMedia place={place} priority className="size-full" />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary/35 p-space-lg text-center text-on-primary">
            <p className="type-label text-secondary-fixed">{t('placeDetails.gallery.label')}</p>
            <p className="type-card-title mt-space-sm max-w-xl text-on-primary">
              {t('placeDetails.gallery.emptyTitle')}
            </p>
            <p className="type-body mt-space-sm max-w-md text-on-primary/80">
              {t('placeDetails.gallery.emptyDescription')}
            </p>
          </div>
        </div>
      ) : layout === 'single' && visible[0] ? (
        <GalleryTile
          image={visible[0]}
          index={0}
          total={place.images.length}
          onOpen={setActiveIndex}
          priority
          className="h-[420px] md:h-[580px]"
        />
      ) : layout === 'pair' ? (
        <div className="grid grid-cols-1 gap-space-md md:grid-cols-2">
          {visible.map((image, index) => (
            <GalleryTile
              key={image.src}
              image={image}
              index={index}
              total={place.images.length}
              onOpen={setActiveIndex}
              priority={index === 0}
              moreCount={index === visible.length - 1 ? moreCount : 0}
              className="h-[320px] md:h-[580px]"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-space-md md:grid-cols-12">
          {visible[0] ? (
            <GalleryTile
              image={visible[0]}
              index={0}
              total={place.images.length}
              onOpen={setActiveIndex}
              priority
              className="h-[420px] md:col-span-8 md:h-[580px]"
            />
          ) : null}

          <div className="grid grid-cols-1 gap-space-md md:col-span-4 md:h-[580px] md:grid-rows-2">
            {visible.slice(1).map((image, offset) => {
              const index = offset + 1;

              return (
                <GalleryTile
                  key={image.src}
                  image={image}
                  index={index}
                  total={place.images.length}
                  onOpen={setActiveIndex}
                  moreCount={index === visible.length - 1 ? moreCount : 0}
                  className="h-[220px] md:h-auto md:min-h-0"
                />
              );
            })}
          </div>
        </div>
      )}

      <Lightbox
        images={place.images}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onIndexChange={setActiveIndex}
      />
    </section>
  );
}
