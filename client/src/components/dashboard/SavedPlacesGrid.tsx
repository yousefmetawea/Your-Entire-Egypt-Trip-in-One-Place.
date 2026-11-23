import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { Place } from '../../types';
import { Card } from '../ui/Card';
import { MapPinIcon } from '../ui/icons';

export interface SavedPlacesGridProps {
  places: Place[];
  onRemoveSavedPlace: (placeId: string) => void;
  actionLoading?: boolean;
}

export function SavedPlacesGrid({
  places,
  onRemoveSavedPlace,
  actionLoading = false,
}: SavedPlacesGridProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  return (
    <Card
      variant="surface"
      className="flex flex-col gap-space-md p-space-md sm:p-space-lg rounded-[24px] border border-hairline/60"
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="type-label-sm uppercase tracking-widest text-secondary font-semibold">
            Saved Places
          </span>
          <h3 className="font-serif text-xl text-primary font-medium mt-0.5">
            Bookmarked Destinations ({places.length})
          </h3>
        </div>

        <Link
          to="/discover"
          className="type-label-sm text-xs text-secondary hover:text-primary transition-colors underline"
        >
          Discover More
        </Link>
      </div>

      {places.length === 0 ? (
        <div className="py-space-xl text-center flex flex-col items-center justify-center gap-space-xs bg-surface-container-low rounded-xl p-space-md">
          <p className="type-body text-xs text-on-surface-variant max-w-sm">
            No destinations saved to your trip vault yet. Explore Cairo&apos;s landmarks and save
            your favorites here.
          </p>
          <Link
            to="/discover"
            className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-secondary hover:bg-secondary-fixed hover:text-on-secondary-fixed text-on-secondary type-label text-xs font-medium transition-all shadow-xs mt-1"
          >
            Explore Cairo Destinations
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-space-xs">
          {places.map((place) => {
            const name = isAr && place.name.ar ? place.name.ar : place.name.en;

            return (
              <div
                key={place.id}
                className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low/70 hover:bg-surface-container transition-colors border border-hairline/30 group"
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="size-10 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary shrink-0 font-serif font-bold">
                    {name.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <h4 className="type-title text-sm text-primary font-medium truncate group-hover:text-secondary transition-colors">
                      <Link to={`/places/${place.slug}`}>{name}</Link>
                    </h4>
                    <div className="flex items-center gap-space-xs text-xs text-on-surface-variant">
                      <MapPinIcon className="size-3 text-secondary shrink-0" />
                      <span className="capitalize truncate">{place.area.replace('-', ' ')}</span>
                      <span className="text-hairline">·</span>
                      <span className="capitalize">{place.category}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveSavedPlace(place.id)}
                  disabled={actionLoading}
                  aria-label={`Remove ${name} from saved places`}
                  className="size-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-danger hover:bg-danger/10 transition-colors shrink-0 ms-2"
                  title="Remove from saved"
                >
                  &times;
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
