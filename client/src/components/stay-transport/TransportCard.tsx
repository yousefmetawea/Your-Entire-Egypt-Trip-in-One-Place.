import { useTranslation } from 'react-i18next';
import type { TransportOption } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CarIcon } from '../ui/icons';

export interface TransportCardProps {
  option: TransportOption;
  onRequestTransfer?: () => void;
  onOpenExternalModal?: (url: string) => void;
}

export function TransportCard({
  option,
  onRequestTransfer,
  onOpenExternalModal,
}: TransportCardProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const name = isAr && option.name.ar ? option.name.ar : option.name.en;
  const description =
    isAr && option.description?.ar ? option.description.ar : option.description?.en;
  const isInternal = option.bookable === 'internal';

  return (
    <Card variant="surface" padding="lg" className="flex flex-col justify-between h-full">
      <div className="flex flex-col gap-space-sm">
        <div className="flex items-start justify-between gap-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="p-2 rounded-xl bg-surface-container-high text-secondary">
              <CarIcon className="size-5" />
            </span>
            <div>
              <p className="type-label-sm uppercase text-secondary font-semibold">
                {option.type.replace('-', ' ')}
              </p>
              <h3 className="type-title-md font-bold text-primary">{name}</h3>
            </div>
          </div>

          <Badge tone={isInternal ? 'bronze' : 'outline'} size="sm">
            {isInternal
              ? t('stayTransport.transport.managedBadge', 'Managed Request')
              : t('stayTransport.transport.externalBadge', 'External booking')}
          </Badge>
        </div>

        {description ? (
          <p className="type-small text-on-surface-variant leading-relaxed">{description}</p>
        ) : null}

        {option.notes ? (
          <p className="type-small text-on-surface-variant italic">{option.notes.en}</p>
        ) : null}
      </div>

      <div className="mt-space-lg pt-space-md border-t border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
        <div>
          {option.estimatedPrice ? (
            <div>
              <div className="flex items-center gap-space-xs">
                <span className="type-title-md font-bold text-primary">
                  {option.estimatedPrice.amount} {option.estimatedPrice.currency}
                </span>
                <Badge tone="warning" size="sm">
                  Estimated price
                </Badge>
              </div>
              <span className="type-small text-on-surface-variant text-[11px]">
                Updated {option.estimatedPrice.priceUpdatedAt}
              </span>
            </div>
          ) : (
            <Badge tone="outline" size="sm">
              Price variable / at gate
            </Badge>
          )}
        </div>

        <div>
          {isInternal ? (
            <Button variant="primary" size="sm" onClick={onRequestTransfer}>
              {t('stayTransport.transport.requestCta', 'Request Transfer')}
            </Button>
          ) : option.externalUrl ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onOpenExternalModal?.(option.externalUrl!)}
            >
              {t('stayTransport.transport.viewProviderCta', 'View on provider ↗')}
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
