import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { Accommodation } from '../../types';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

export interface DashboardStayProps {
  accommodation: Accommodation | null;
}

export function DashboardStay({ accommodation }: DashboardStayProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const name = isAr && accommodation?.name.ar ? accommodation.name.ar : accommodation?.name.en;
  return (
    <Card
      variant="surface"
      className="flex flex-col gap-space-sm p-space-md sm:p-space-lg rounded-[20px] border border-hairline/60"
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="type-label-sm uppercase tracking-widest text-secondary font-semibold">
            Accommodation
          </span>
          <h3 className="font-serif text-xl text-primary font-medium mt-0.5">Your Selected Stay</h3>
        </div>

        <Link
          to="/stay-transport?tab=accommodation"
          className="type-label-sm text-xs text-secondary hover:text-primary transition-colors underline"
        >
          {accommodation ? 'Change Stay' : 'Browse Stays'}
        </Link>
      </div>

      {!accommodation ? (
        <div className="py-space-lg text-center flex flex-col items-center justify-center gap-space-xs bg-surface-container-low rounded-xl p-space-md">
          <p className="type-body text-xs text-on-surface-variant max-w-sm">
            No accommodation has been selected for this trip yet.
          </p>
          <Link
            to="/stay-transport?tab=accommodation"
            className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-secondary hover:bg-secondary-fixed hover:text-on-secondary-fixed text-on-secondary type-label text-xs font-medium transition-all shadow-xs mt-1"
          >
            Select a Hotel or Hostel
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-space-sm bg-surface-container-low/70 p-space-md rounded-xl border border-hairline/40">
          <div className="flex flex-wrap items-start justify-between gap-space-xs">
            <div>
              <span className="type-label-sm uppercase tracking-wider text-secondary font-semibold text-[11px]">
                {accommodation.type}
              </span>
              <h4 className="font-serif text-lg text-primary font-medium mt-0.5">{name}</h4>
            </div>

            <Badge tone="glass-dark" size="sm">
              External booking
            </Badge>
          </div>

          {accommodation.priceRange ? (
            <div className="flex items-center gap-space-xs pt-1">
              <span className="type-title text-sm text-primary font-semibold">
                {accommodation.priceRange.min} – {accommodation.priceRange.max}{' '}
                {accommodation.priceRange.currency}
              </span>
              <span className="type-small text-on-surface-variant">/ night</span>
              <Badge tone="neutral" size="sm" className="ms-1">
                Estimated price
              </Badge>
            </div>
          ) : (
            <span className="type-small text-on-surface-variant italic">
              Nightly rates are not listed
            </span>
          )}

          {accommodation.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {accommodation.amenities.slice(0, 4).map((amenity) => (
                <span
                  key={amenity}
                  className="px-2 py-0.5 rounded-full bg-surface text-on-surface-variant type-label-sm text-[10px]"
                >
                  {amenity}
                </span>
              ))}
            </div>
          )}

          <div className="pt-space-xs border-t border-hairline/40 flex items-center justify-between text-xs text-on-surface-variant">
            <span>Direct partner link</span>
            {accommodation.externalUrl ? (
              <a
                href={accommodation.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-secondary hover:underline font-semibold"
              >
                View on Provider &rarr;
              </a>
            ) : (
              <span className="italic">Link not available</span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
