import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { Place } from '../../types';
import { getAreaLabelKey } from '../../lib/catalog';
import { createDiscoverHref } from '../../lib/discover';

export interface PlaceBreadcrumbProps {
  place: Place;
  tone?: 'light' | 'dark';
}

export function PlaceBreadcrumb({ place, tone = 'light' }: PlaceBreadcrumbProps) {
  const dark = tone === 'dark';
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const name = isAr && place.name.ar ? place.name.ar : place.name.en;
  const areaHref = createDiscoverHref({ filters: { area: place.area } });

  return (
    <nav
      aria-label={t('placeDetails.breadcrumb.label')}
      className={
        dark
          ? 'w-fit max-w-full rounded-full border border-white/20 bg-[#101C15]/45 px-space-lg py-space-xs backdrop-blur-md'
          : 'w-fit max-w-full rounded-full border border-hairline bg-surface-container-lowest/85 px-space-lg py-space-xs shadow-resting backdrop-blur-md'
      }
    >
      <ol
        className={`flex flex-wrap items-center gap-space-xs type-label ${dark ? 'text-[#C0C9BE]' : 'text-on-surface-variant'}`}
      >
        <li>
          <Link
            to="/discover"
            className={`rounded-sm transition-colors ${dark ? 'hover:text-white' : 'hover:text-primary'} focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary`}
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
            className={`rounded-sm transition-colors ${dark ? 'hover:text-white' : 'hover:text-primary'} focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary`}
          >
            {t(getAreaLabelKey(place.area))}
          </Link>
        </li>
        <li aria-hidden="true" className="text-sand">
          /
        </li>
        <li>
          <span
            aria-current="page"
            className={dark ? 'font-medium text-[#B6CE67]' : 'text-secondary font-medium'}
          >
            {name}
          </span>
        </li>
      </ol>
    </nav>
  );
}
