import { useTranslation } from 'react-i18next';
import type { Place } from '../../types';
import { getAreaLabelKey, getCategoryLabelKey } from '../../lib/catalog';
import { Badge } from '../ui/Badge';
import { SplitText } from '../motion/SplitText';

export interface PlaceHeaderProps {
  place: Place;
  isFixture?: boolean;
}

export function PlaceHeader({ place, isFixture = false }: PlaceHeaderProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const name = isAr && place.name.ar ? place.name.ar : place.name.en;

  return (
    <header className="mt-space-lg">
      <div className="flex flex-wrap items-center gap-space-xs">
        <Badge tone="outline">{t(getAreaLabelKey(place.area))}</Badge>
        <Badge tone="bronze">{t(getCategoryLabelKey(place.category))}</Badge>
        <Badge tone="dark">{t('placeDetails.demo.badge')}</Badge>
        {isFixture ? <Badge tone="danger">{t('placeDetails.demo.fixtureBadge')}</Badge> : null}
      </div>

      <h1 id="place-title" className="type-display mt-space-md max-w-5xl text-balance text-primary">
        <SplitText>{name}</SplitText>
      </h1>

      <p className="type-small mt-space-md max-w-3xl text-on-surface-variant font-sans">
        {isFixture ? t('placeDetails.demo.fixtureNote') : t('placeDetails.demo.note')}
      </p>
    </header>
  );
}
