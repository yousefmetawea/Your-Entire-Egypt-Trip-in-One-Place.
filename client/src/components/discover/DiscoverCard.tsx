import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { Place } from '../../types';
import { cn } from '../../lib/cn';
import { getAreaLabelKey, getCategoryLabelKey, getDurationLabel } from '../../lib/catalog';
import { PlaceMedia } from '../places/PlaceMedia';
import { ArrowRightIcon, ClockIcon } from '../ui/icons';

export type DiscoverCardVariant = 'featured' | 'standard' | 'editorial';

export interface DiscoverCardProps {
  place: Place;
  variant?: DiscoverCardVariant;
  priority?: boolean;
  className?: string;
}

const titleSize: Record<DiscoverCardVariant, string> = {
  featured: 'text-3xl sm:text-4xl lg:text-[2.6rem]',
  standard: 'text-xl sm:text-[1.4rem]',
  editorial: 'text-2xl sm:text-3xl',
};

const imageSizes: Record<DiscoverCardVariant, string> = {
  featured: '(min-width: 1024px) 58vw, 100vw',
  standard: '(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw',
  editorial: '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw',
};

/**
 * One reusable image-first card. Variants change typography and the
 * information shown; sizing comes from the grid cell that wraps it.
 * Only existing place data is displayed. Hover effects use transform
 * and opacity, and Tailwind gates `hover:` to devices that can hover.
 */
export function DiscoverCard({
  place,
  variant = 'standard',
  priority = false,
  className,
}: DiscoverCardProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const name = isAr && place.name.ar ? place.name.ar : place.name.en;
  const description = isAr && place.description?.ar ? place.description.ar : place.description?.en;
  const duration = getDurationLabel(place.avgVisitMinutes);

  return (
    <article className={cn('h-full', className)}>
      <Link
        to={`/places/${place.slug}`}
        className="group/card relative block h-full overflow-hidden rounded-3xl bg-(--yt-green) shadow-[0_1px_0_rgba(16,28,21,0.06)] transition-transform duration-500 ease-out will-change-transform hover:-translate-y-1.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <PlaceMedia
          place={place}
          priority={priority}
          sizes={imageSizes[variant]}
          className="absolute inset-0 size-full"
          imgClassName="transition-transform duration-[900ms] group-hover/card:scale-[1.07] motion-reduce:group-hover/card:scale-100"
        />
        <div
          aria-hidden="true"
          className={cn(
            'absolute inset-0 bg-linear-to-t from-(--yt-forest)/95 via-(--yt-forest)/45 to-transparent transition-opacity duration-500',
            variant === 'featured' ? 'via-40%' : 'via-55%',
          )}
        />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-(--yt-lime) uppercase [text-shadow:0_1px_10px_rgba(16,28,21,0.9)]">
              {t(getAreaLabelKey(place.area))}
              <span aria-hidden="true"> · </span>
              {t(getCategoryLabelKey(place.category))}
            </p>
            <h3
              className={cn(
                'mt-1.5 font-display leading-tight font-medium text-(--yt-on-dark) rtl:leading-snug',
                titleSize[variant],
              )}
            >
              {name}
            </h3>
            {duration ? (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-(--yt-on-dark-2)">
                <ClockIcon className="size-3.5" />
                {t(duration.key, duration.values)}
              </p>
            ) : null}
            {description && variant !== 'standard' ? (
              <p className="mt-2 hidden max-w-md translate-y-2 text-sm leading-relaxed text-(--yt-on-dark-2) opacity-0 transition-[transform,opacity] duration-500 group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-visible/card:translate-y-0 group-focus-visible/card:opacity-100 sm:line-clamp-2 sm:block motion-reduce:translate-y-0 motion-reduce:opacity-100">
                {description}
              </p>
            ) : null}
          </div>
          <span
            aria-hidden="true"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-white/15 text-(--yt-on-dark) backdrop-blur-sm transition-colors duration-300 group-hover/card:bg-(--yt-lime) group-hover/card:text-(--yt-green)"
          >
            <ArrowRightIcon className="size-5 transition-transform duration-300 group-hover/card:translate-x-1 rtl:rotate-180 rtl:group-hover/card:-translate-x-1" />
          </span>
        </div>
        <span className="sr-only">{t('place.view')}</span>
      </Link>
    </article>
  );
}

export const FeaturedCard = (props: Omit<DiscoverCardProps, 'variant'>) => (
  <DiscoverCard {...props} variant="featured" />
);
export const StandardCard = (props: Omit<DiscoverCardProps, 'variant'>) => (
  <DiscoverCard {...props} variant="standard" />
);
export const EditorialCard = (props: Omit<DiscoverCardProps, 'variant'>) => (
  <DiscoverCard {...props} variant="editorial" />
);
