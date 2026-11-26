import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Place } from '../../types';
import { getAreaLabelKey, getCategoryLabelKey } from '../../lib/catalog';
import { getPlaceGalleryImages } from '../../lib/placeImages';
import { SplitText } from '../motion/SplitText';
import { PlaceBreadcrumb } from './PlaceBreadcrumb';
import { PlaceQuickFacts } from './PlaceQuickFacts';

export interface PlaceHeroProps {
  place: Place;
  isFixture?: boolean;
}

const chip =
  'inline-flex items-center rounded-full border px-3.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em]';

/** Full-bleed cinematic opening for the place details page. */
export function PlaceHero({ place, isFixture = false }: PlaceHeroProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const name = isAr && place.name.ar ? place.name.ar : place.name.en;
  const image = getPlaceGalleryImages(place, place.images)[0];
  const [failed, setFailed] = useState(false);

  return (
    <header
      aria-labelledby="place-title"
      className="yt-dark relative isolate -mt-24 flex min-h-[640px] items-end overflow-hidden bg-[#101C15] text-[#F4F2E9] md:-mt-28 md:min-h-[88vh]"
    >
      {image && !failed ? (
        <img
          src={image.src}
          alt={image.alt.en}
          width={image.width}
          height={image.height}
          fetchPriority="high"
          decoding="async"
          onError={() => setFailed(true)}
          className="absolute inset-0 -z-20 size-full object-cover"
        />
      ) : null}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(16,28,21,0.6)_0%,rgba(16,28,21,0.2)_25%,rgba(16,28,21,0.72)_58%,#101C15_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(900px_420px_at_15%_100%,rgba(182,206,103,0.16),transparent_65%)]"
      />

      <div className="mx-auto w-full max-w-[1280px] px-5 pb-space-xl pt-40 md:px-10">
        <PlaceBreadcrumb place={place} tone="dark" />

        <div className="mt-space-lg flex flex-wrap items-center gap-space-xs">
          <span className={`${chip} border-white/30 text-[#F4F2E9]`}>
            {t(getAreaLabelKey(place.area))}
          </span>
          <span className={`${chip} border-[#B6CE67]/60 bg-[#B6CE67] text-[#101C15]`}>
            {t(getCategoryLabelKey(place.category))}
          </span>
          {isFixture ? (
            <span className={`${chip} border-[#f29b8b]/60 text-[#f6b4a8]`}>
              {t('placeDetails.demo.fixtureBadge')}
            </span>
          ) : null}
        </div>

        <h1
          id="place-title"
          className="type-display mt-space-md max-w-4xl text-balance text-[#F4F2E9] [text-shadow:0_2px_30px_rgba(0,0,0,0.35)]"
        >
          <SplitText>{name}</SplitText>
        </h1>

        <p className="type-small mt-space-sm max-w-2xl font-sans text-[#C0C9BE]">
          {isFixture ? t('placeDetails.demo.fixtureNote') : t('placeDetails.demo.note')}
        </p>

        <PlaceQuickFacts place={place} className="mt-space-lg" />
      </div>
    </header>
  );
}
