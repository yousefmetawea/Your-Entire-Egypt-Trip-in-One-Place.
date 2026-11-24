import { useState } from 'react';
import type { Place, PlaceCategory } from '../../types';
import { cn } from '../../lib/cn';
import { ArchPattern } from '../common/ArchPattern';
import { getPlaceImageSources } from '../../lib/placeImages';

export interface PlaceMediaProps {
  place: Pick<Place, 'name' | 'category' | 'images'> & { id?: string; slug?: string };
  priority?: boolean;
  sizes?: string;
  className?: string;
}

const categoryTones: Record<PlaceCategory, string> = {
  history: 'from-primary-container via-secondary to-sand',
  culture: 'from-primary-container via-tertiary-container to-secondary-fixed',
  adventure: 'from-primary-container via-secondary to-sand',
  food: 'from-primary-container via-tertiary-container to-secondary-fixed',
};

export function PlaceMedia({ place, priority = false, sizes, className }: PlaceMediaProps) {
  const image = place.images[0];
  const { primary, fallback } = getPlaceImageSources(place, image?.src);
  const [currentSrc, setCurrentSrc] = useState(primary || fallback);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (fallback && currentSrc !== fallback) {
      setCurrentSrc(fallback);
    } else {
      setHasError(true);
    }
  };

  const showImage = Boolean(currentSrc && !hasError);
  const altText =
    image?.alt?.en ||
    (typeof place.name === 'string' ? place.name : place.name?.en || 'Egypt destination');

  return (
    <div
      className={cn(
        'relative isolate overflow-hidden bg-primary-container',
        !showImage && `bg-gradient-to-br ${categoryTones[place.category]}`,
        className,
      )}
    >
      {showImage ? (
        <img
          src={currentSrc}
          alt={altText}
          width={image?.width ?? 1200}
          height={image?.height ?? 800}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onError={handleError}
          className="size-full object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(217,199,163,0.35),transparent_42%)]" />
          <ArchPattern className="text-sand/30" />
        </div>
      )}
    </div>
  );
}
