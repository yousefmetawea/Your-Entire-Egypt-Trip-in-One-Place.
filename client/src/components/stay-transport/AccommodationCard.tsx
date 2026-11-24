import { useTranslation } from 'react-i18next';
import type { Accommodation } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { BedIcon } from '../ui/icons';

export interface AccommodationCardProps {
  accommodation: Accommodation;
  isSelected?: boolean;
  onSetAsStay?: () => void;
  onOpenExternalModal?: (url: string) => void;
}

export function AccommodationCard({
  accommodation,
  isSelected = false,
  onSetAsStay,
  onOpenExternalModal,
}: AccommodationCardProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const name = isAr && accommodation.name.ar ? accommodation.name.ar : accommodation.name.en;
  const imageAlt =
    accommodation.images && accommodation.images[0]
      ? isAr && accommodation.images[0].alt.ar
        ? accommodation.images[0].alt.ar
        : accommodation.images[0].alt.en
      : name;

  return (
    <Card
      variant="surface"
      padding="none"
      className={`flex flex-col justify-between h-full overflow-hidden transition-shadow duration-200 ${
        isSelected ? 'border-2 border-secondary ring-2 ring-secondary/20' : ''
      }`}
    >
      {accommodation.images && accommodation.images[0] && (
        <div className="relative h-48 w-full overflow-hidden bg-surface-container">
          <img
            src={accommodation.images[0].src}
            alt={imageAlt}
            width={accommodation.images[0].width}
            height={accommodation.images[0].height}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
          />
        </div>
      )}

      <div className="p-space-lg flex flex-col justify-between flex-1">
        <div className="flex flex-col gap-space-sm">
          <div className="flex items-start justify-between gap-space-xs">
            <div className="flex items-center gap-space-xs">
              <span className="p-2 rounded-xl bg-surface-container-high text-secondary">
                <BedIcon className="size-5" />
              </span>
              <div>
                <p className="type-label-sm uppercase text-secondary font-semibold">
                  {accommodation.type}
                </p>
                <h3 className="type-title-md font-bold text-primary">{name}</h3>
              </div>
            </div>

            <Badge tone="outline" size="sm">
              {t('stayTransport.accommodation.externalBadge', 'External booking')}
            </Badge>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-1 mt-space-xs">
            {accommodation.amenities.length > 0 ? (
              accommodation.amenities.map((amenity, i) => (
                <span
                  key={i}
                  className="type-small text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-md"
                >
                  {amenity}
                </span>
              ))
            ) : (
              <span className="type-small text-on-surface-variant italic">
                No specific amenities listed
              </span>
            )}
          </div>
        </div>

        <div className="mt-space-lg pt-space-md border-t border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <div>
            {accommodation.priceRange ? (
              <div>
                <div className="flex items-center gap-space-xs">
                  <span className="type-title-md font-bold text-primary">
                    {accommodation.priceRange.min} – {accommodation.priceRange.max}{' '}
                    {accommodation.priceRange.currency}
                  </span>
                  <Badge tone="warning" size="sm">
                    Estimated price
                  </Badge>
                </div>
                <span className="type-small text-on-surface-variant text-[11px]">
                  Per night · Updated {accommodation.priceRange.priceUpdatedAt}
                </span>
              </div>
            ) : (
              <Badge tone="outline" size="sm">
                Price not listed
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-space-xs flex-wrap">
            {onSetAsStay ? (
              <Button
                variant={isSelected ? 'secondary' : 'primary'}
                size="sm"
                onClick={onSetAsStay}
                disabled={isSelected}
              >
                {isSelected ? '✓ Selected Stay' : 'Set as my stay'}
              </Button>
            ) : null}

            {accommodation.externalUrl ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenExternalModal?.(accommodation.externalUrl!)}
              >
                View on provider ↗
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
