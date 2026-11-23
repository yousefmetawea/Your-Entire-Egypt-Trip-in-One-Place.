import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { PlaceTip } from '../../types';
import { Card } from '../ui/Card';
import { PlaceSectionHeading } from './PlaceSectionHeading';

export interface PlaceTipsProps {
  tips: readonly PlaceTip[] | null;
}

export function PlaceTips({ tips }: PlaceTipsProps) {
  const { t, i18n } = useTranslation();
  const headingId = useId();
  const isAr = i18n.language === 'ar';

  if (!tips || tips.length === 0) {
    return null;
  }

  return (
    <Card
      as="section"
      variant="surface"
      padding="none"
      aria-labelledby={headingId}
      className="p-space-xl md:p-space-2xl"
    >
      <PlaceSectionHeading
        eyebrow={t('placeDetails.tips.eyebrow')}
        title={t('placeDetails.tips.title')}
        id={headingId}
      />

      <div className="mt-space-lg grid grid-cols-1 gap-space-md md:grid-cols-2">
        {tips.map((tip, index) => {
          const title = isAr && tip.title.ar ? tip.title.ar : tip.title.en;
          const body = isAr && tip.body.ar ? tip.body.ar : tip.body.en;

          return (
            <div
              key={`${index}-${tip.title.en}`}
              className="flex flex-col gap-space-sm rounded-card bg-surface-container-low p-space-lg"
            >
              <span className="type-title text-secondary" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="type-title-sm text-primary">{title}</h3>
              <p className="type-body text-on-surface-variant">{body}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
