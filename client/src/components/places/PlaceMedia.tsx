import type { Place, PlaceCategory } from '../../types';
import { cn } from '../../lib/cn';
import { ArchPattern } from '../common/ArchPattern';

export interface PlaceMediaProps {
  place: Pick<Place, 'name' | 'category' | 'images'>;
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

  return (
    <div
      className={cn(
        'relative isolate overflow-hidden bg-primary-container',
        !image && `bg-gradient-to-br ${categoryTones[place.category]}`,
        className,
      )}
    >
      {image ? (
        <img
          src={image.src}
          alt={image.alt.en}
          width={image.width}
          height={image.height}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
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
