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
  const { t } = useTranslation();
  const durationLabel = getDurationLabel(place.avgVisitMinutes);
  const description = place.description?.en ?? t('place.detailsPending');

  return (
    <Card
      as="article"
      variant="surface"
      padding="none"
      interactive
      className={cn('group flex h-full flex-col overflow-hidden', className)}
    >
      <div className="relative">
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

        <div
          className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/20 to-transparent"
          aria-hidden="true"
        />

        <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-space-xs p-space-md">
          <div className="flex flex-wrap items-center gap-space-xs">
            <Badge tone="glass" size="sm">
              {t(getAreaLabelKey(place.area))}
            </Badge>
            <Badge tone="glass-dark" size="sm">
              {t('place.demo')}
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
                'size-8 rounded-full flex items-center justify-center transition-all backdrop-blur-md cursor-pointer',
                isSaved
                  ? 'bg-secondary text-on-secondary shadow-sm'
                  : 'bg-primary/40 text-surface hover:bg-primary/70 hover:text-secondary-fixed',
              )}
              title={isSaved ? 'Saved to trip' : 'Save to trip'}
            >
              <BookmarkIcon className="size-4" fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-space-md text-on-primary">
          <p className="type-label text-secondary-fixed">
            {t(getCategoryLabelKey(place.category))}
          </p>
          <h3
            className={cn(
              'type-card-title mt-space-xs',
              variant === 'feature' ? 'md:text-headline-md' : 'text-[1.35rem]',
            )}
          >
            <Link
              to={`/places/${place.slug}`}
              className="rounded-sm transition-colors hover:text-secondary-fixed focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary-fixed"
            >
              {place.name.en}
            </Link>
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-space-md p-space-lg">
        <p className="type-body line-clamp-3 text-on-surface-variant">{description}</p>

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
