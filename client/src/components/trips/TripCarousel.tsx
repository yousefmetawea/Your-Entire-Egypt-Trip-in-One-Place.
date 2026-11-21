import { useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { ReadyMadeTrip } from '../../types';
import { Button } from '../ui/Button';
import { ChevronLeftIcon, ChevronRightIcon } from '../ui/icons';
import { TripCard } from './TripCard';

export interface TripCarouselProps {
  trips: readonly ReadyMadeTrip[];
}

export function TripCarousel({ trips }: TripCarouselProps) {
  const { t } = useTranslation();
  const trackRef = useRef<HTMLUListElement>(null);
  const reduceMotion = useReducedMotion();

  function scroll(direction: -1 | 1): void {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    track.scrollBy({
      left: direction * track.clientWidth * 0.85,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }

  return (
    <div>
      <div className="mb-space-md flex items-center justify-end gap-space-xs">
        <Button
          variant="secondary"
          size="sm"
          className="size-11 p-0"
          aria-label={t('home.trips.previous')}
          onClick={() => scroll(-1)}
        >
          <ChevronLeftIcon className="rtl:rotate-180" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="size-11 p-0"
          aria-label={t('home.trips.next')}
          onClick={() => scroll(1)}
        >
          <ChevronRightIcon className="rtl:rotate-180" />
        </Button>
      </div>

      <ul
        ref={trackRef}
        aria-label={t('home.trips.eyebrow')}
        className="flex snap-x snap-mandatory gap-gutter overflow-x-auto pb-space-sm scrollbar-none"
      >
        {trips.map((trip) => (
          <li key={trip.id} className="w-[min(22rem,85vw)] shrink-0 snap-start">
            <TripCard trip={trip} />
          </li>
        ))}
      </ul>
    </div>
  );
}
