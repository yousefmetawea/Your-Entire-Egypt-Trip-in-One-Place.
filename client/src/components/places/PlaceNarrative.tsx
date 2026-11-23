import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { Place } from '../../types';
import { toParagraphs } from '../../lib/placeDetails';
import { Card } from '../ui/Card';
import { PlaceSectionHeading } from './PlaceSectionHeading';

export interface PlaceNarrativeProps {
  place: Place;
}

export function PlaceNarrative({ place }: PlaceNarrativeProps) {
  const { t, i18n } = useTranslation();
  const headingId = useId();
  const isAr = i18n.language === 'ar';
  const descriptionRaw =
    isAr && place.description?.ar ? place.description.ar : place.description?.en;
  const historyRaw = isAr && place.history?.ar ? place.history.ar : place.history?.en;
  const description = toParagraphs(descriptionRaw);
  const history = toParagraphs(historyRaw);
  const isEmpty = description.length === 0 && history.length === 0;

  return (
    <Card
      as="section"
      variant="surface"
      padding="none"
      aria-labelledby={headingId}
      className="p-space-xl md:p-space-2xl"
    >
      <PlaceSectionHeading
        eyebrow={t('placeDetails.about.eyebrow')}
        title={t('placeDetails.about.title')}
        id={headingId}
      />

      {isEmpty ? (
        <div className="mt-space-lg">
          <p className="type-body-lg text-primary">{t('placeDetails.about.emptyTitle')}</p>
          <p className="type-body mt-space-sm text-on-surface-variant">
            {t('placeDetails.about.emptyDescription')}
          </p>
        </div>
      ) : (
        <div className="mt-space-lg">
          {description.length > 0 ? (
            <div className="space-y-space-md">
              {description.map((paragraph, index) => (
                <p
                  key={`${index}-${paragraph}`}
                  className="type-body-lg whitespace-pre-line leading-relaxed text-on-surface-variant"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}

          {history.length > 0 ? (
            <div className={description.length > 0 ? 'mt-space-xl' : undefined}>
              <h3 className="type-title text-primary">{t('placeDetails.about.historyLabel')}</h3>
              <div className="mt-space-sm space-y-space-md">
                {history.map((paragraph, index) => (
                  <p
                    key={`${index}-${paragraph}`}
                    className="type-body whitespace-pre-line leading-relaxed text-on-surface-variant"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </Card>
  );
}
