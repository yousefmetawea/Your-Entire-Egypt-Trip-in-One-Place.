import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { Place } from '../../types';
import { getAreaLabelKey } from '../../lib/catalog';
import { PlaceMedia } from '../places/PlaceMedia';
import { CloseIcon } from '../ui/icons';
import { SectionHeading } from './shared';
import { cn } from '../../lib/cn';

export function SavedPlaces({
  places,
  onRemove,
  actionLoading,
}: {
  places: Place[];
  onRemove: (placeId: string) => void;
  actionLoading: boolean;
}) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const wide = places.length <= 2;
  return (
    <section aria-labelledby="mt-saved-heading" className="py-20 md:py-24">
      <div className="mx-auto w-full max-w-page px-gutter-sm md:px-margin-md lg:px-margin-lg">
        <SectionHeading
          id="mt-saved-heading"
          eyebrow={t('myTrip.saved.eyebrow')}
          title={t('myTrip.saved.title', { count: places.length })}
          aside={
            <Link to="/discover" className="text-sm font-semibold underline underline-offset-4">
              {t('myTrip.saved.discover')}
            </Link>
          }
        />
        {places.length === 0 ? (
          <p className="mt-8 text-(--yt-ink-2)">{t('myTrip.saved.empty')}</p>
        ) : (
          <ul
            className={cn(
              'mt-8 grid gap-4',
              wide ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
            )}
          >
            {places.map((p) => {
              const name = isAr && p.name.ar ? p.name.ar : p.name.en;
              return (
                <li
                  key={p.id}
                  className="group/saved relative overflow-hidden rounded-3xl bg-(--yt-green)"
                >
                  <Link to={`/places/${p.slug}`} className="block">
                    <PlaceMedia
                      place={p}
                      sizes="(min-width: 1024px) 22vw, 45vw"
                      className={wide ? 'aspect-[16/10] w-full' : 'aspect-[4/5] w-full'}
                      imgClassName="transition-transform duration-700 group-hover/saved:scale-[1.05] motion-reduce:group-hover/saved:scale-100"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-linear-to-t from-(--yt-forest)/90 via-transparent to-transparent"
                    />
                    <span className="absolute inset-x-0 bottom-0 p-4 text-(--yt-on-dark)">
                      <span className="block text-[0.65rem] font-semibold tracking-[0.18em] text-(--yt-lime) uppercase">
                        {t(getAreaLabelKey(p.area))}
                      </span>
                      <span className="mt-1 block font-display text-lg leading-tight">{name}</span>
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => onRemove(p.id)}
                    disabled={actionLoading}
                    aria-label={t('myTrip.saved.remove', { name })}
                    className="absolute end-3 top-3 grid size-9 cursor-pointer place-items-center rounded-full bg-(--yt-forest)/70 text-(--yt-on-dark) backdrop-blur-sm transition-colors hover:bg-(--yt-lime) hover:text-(--yt-green) disabled:opacity-50"
                  >
                    <CloseIcon className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
