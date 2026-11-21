import { useTranslation } from 'react-i18next';
import type { PriceQuote } from '../../types';
import { cn } from '../../lib/cn';
import { formatPriceQuote, formatUpdatedDate } from '../../lib/placeDetails';
import { Badge } from '../ui/Badge';

export interface PriceDisplayProps {
  quote: PriceQuote | null;
  className?: string;
}

export function PriceDisplay({ quote, className }: PriceDisplayProps) {
  const { t } = useTranslation();
  const updatedDate = quote ? formatUpdatedDate(quote.priceUpdatedAt) : null;

  return (
    <div className={cn(className)}>
      <p className="type-label text-on-surface-variant">{t('placeDetails.practical.priceLabel')}</p>

      {quote ? (
        <>
          <p className="type-title mt-space-xs text-primary">{formatPriceQuote(quote)}</p>
          <div className="mt-space-sm flex flex-wrap items-center gap-space-sm">
            {quote.isEstimated ? (
              <Badge tone="bronze" size="sm">
                {t('placeDetails.practical.estimated')}
              </Badge>
            ) : null}
            <span className="type-small text-on-surface-variant">
              {updatedDate
                ? t('placeDetails.practical.lastUpdated', { date: updatedDate })
                : t('placeDetails.practical.lastUpdatedMissing')}
            </span>
          </div>
        </>
      ) : (
        <p className="type-body mt-space-xs text-on-surface-variant">
          {t('placeDetails.practical.priceMissing')}
        </p>
      )}
    </div>
  );
}
