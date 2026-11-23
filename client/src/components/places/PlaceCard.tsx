import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { Place } from '../../types';
import { cn } from '../../lib/cn';
import { getAreaLabelKey, getCategoryLabelKey, getDurationLabel } from '../../lib/catalog';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { ArrowRightIcon, BookmarkIcon, ClockIcon, MapPinIcon } from '../ui/icons';
import { PlaceMedia } from './PlaceMedia';

export type PlaceCardVariant = 'feature' | 'compact';

export interface PlaceCardProps {
  place: Place;
  variant?: PlaceCardVariant;
  priority?: boolean;
  className?: string;
  isSaved?: boolean;
  onToggleSave?: (placeId: string) => void;
}

export function PlaceCard({
  place,
  variant = 'compact',
  priority = false,
  className,
  isSaved = false,
  onToggleSave,
}: PlaceCardProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const name = isAr && place.name.ar ? place.name.ar : place.name.en;
  const durationLabel = getDurationLabel(place.avgVisitMinutes);
  const description =
    isAr && place.description?.ar
      ? place.description.ar
      : (place.description?.en ?? t('place.detailsPending'));

  return (
    <Card
      as="article"
      variant="surface"
      padding="none"
      interactive
      className={cn('group flex h-full flex-col overflow-hidden', className)}
    >
      <div className="relative overflow-hidden">
        <PlaceMedia
          place={place}
          priority={priority}
          sizes={
            variant === 'feature'
              ? '(min-width: 1024px) 58vw, (min-width: 768px) 100vw, 100vw'
              : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'
          }
          className={cn(variant === 'feature' ? 'h-64 sm:h-80 lg:h-[23rem]' : 'h-56')}
        />
      </div>

      <div className="flex flex-1 flex-col gap-space-md p-space-lg">
        <div className="flex items-center justify-between gap-space-xs">
          <div className="flex flex-wrap items-center gap-space-xs">
            <Badge tone="bronze" size="sm">
              {t(getAreaLabelKey(place.area))}
            </Badge>
            <Badge tone="outline" size="sm">
              {t(getCategoryLabelKey(place.category))}
            </Badge>
          </div>

          {onToggleSave && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSave(place.id);
              }}
              aria-label={isSaved ? `Remove ${place.name.en} from saved` : `Save ${place.name.en}`}
              className={cn(
                'size-8 rounded-full flex items-center justify-center transition-all cursor-pointer border border-hairline',
                isSaved
                  ? 'bg-secondary text-on-secondary shadow-sm'
                  : 'bg-surface-container-high text-primary hover:bg-secondary/20 hover:text-secondary',
              )}
              title={isSaved ? 'Saved to trip' : 'Save to trip'}
            >
              <BookmarkIcon className="size-4" fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        <div>
          <h3
            className={cn(
              'type-card-title text-primary',
              variant === 'feature' ? 'md:text-headline-md' : 'text-[1.35rem]',
            )}
          >
            <Link
              to={`/places/${place.slug}`}
              className="rounded-sm transition-colors hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
            >
              {name}
            </Link>
          </h3>
          <p className="type-body mt-space-xs line-clamp-3 text-on-surface-variant">
            {description}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-space-md pt-space-xs">
          <div className="flex flex-wrap items-center gap-space-md text-on-surface-variant">
            <span className="inline-flex items-center gap-space-xs">
              <MapPinIcon className="size-4 text-secondary" />
              <span className="type-small">{t(getAreaLabelKey(place.area))}</span>
            </span>
            <span className="inline-flex items-center gap-space-xs">
              <ClockIcon className="size-4 text-secondary" />
              <span className="type-small">
                {durationLabel
                  ? t(durationLabel.key, durationLabel.values)
                  : t('place.durationNotListed')}
              </span>
            </span>
          </div>

          <Link
            to={`/places/${place.slug}`}
            className="type-title-sm inline-flex items-center gap-space-xs rounded-sm text-primary transition-colors hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
          >
            {t('place.view')}
            <ArrowRightIcon className="size-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </Card>
  );
}

export interface PlaceCardSkeletonProps {
  variant?: PlaceCardVariant;
  className?: string;
}

export function PlaceCardSkeleton({ variant = 'compact', className }: PlaceCardSkeletonProps) {
  return (
    <Card
      as="div"
      variant="surface"
      padding="none"
      className={cn('overflow-hidden', className)}
      aria-hidden="true"
    >
      <Skeleton
        className={cn(
          'w-full rounded-none',
          variant === 'feature' ? 'h-64 sm:h-80 lg:h-[23rem]' : 'h-56',
        )}
      />
      <div className="space-y-space-md p-space-lg">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <div className="flex items-center justify-between gap-space-md pt-space-sm">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </Card>
  );
}
