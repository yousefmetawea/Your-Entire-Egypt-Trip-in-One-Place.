import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { Place } from '../../types';
import { getAreaLabelKey } from '../../lib/catalog';
import { createDiscoverHref } from '../../lib/discover';

export interface PlaceBreadcrumbProps {
  place: Place;
}

export function PlaceBreadcrumb({ place }: PlaceBreadcrumbProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const name = isAr && place.name.ar ? place.name.ar : place.name.en;
  const areaHref = createDiscoverHref({ filters: { area: place.area } });

  return (
    <nav
      aria-label={t('placeDetails.breadcrumb.label')}
      className="w-fit max-w-full rounded-full border border-hairline bg-surface-container-lowest/85 px-space-lg py-space-xs shadow-resting backdrop-blur-md"
    >
      <ol className="flex flex-wrap items-center gap-space-xs type-label text-on-surface-variant">
        <li>
          <Link
            to="/discover"
            className="rounded-sm transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
          >
            {t('placeDetails.breadcrumb.discover')}
          </Link>
        </li>
        <li aria-hidden="true" className="text-sand">
          /
        </li>
        <li>
          <Link
            to={areaHref}
            className="rounded-sm transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
          >
            {t(getAreaLabelKey(place.area))}
          </Link>
        </li>
        <li aria-hidden="true" className="text-sand">
          /
        </li>
        <li>
          <span aria-current="page" className="text-secondary font-medium">
            {name}
          </span>
        </li>
      </ol>
    </nav>
  );
}
