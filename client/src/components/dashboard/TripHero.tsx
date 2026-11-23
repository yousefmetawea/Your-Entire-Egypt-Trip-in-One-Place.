import { useState } from 'react';
import { Link } from 'react-router';
import type { Trip } from '../../types';
import type { TripPhaseInfo } from '../../lib/dashboard/tripPhase';
import { formatIsoDate } from '../../lib/date';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { CountdownMatrix } from './CountdownMatrix';

export interface TripHeroProps {
  trip: Trip;
  trips: Trip[];
  tripPhaseInfo: TripPhaseInfo;
  onSelectTrip: (tripId: string) => void;
  onCancelTrip: (tripId: string) => void;
  actionLoading?: boolean;
}

export function TripHero({
  trip,
  trips,
  tripPhaseInfo,
  onSelectTrip,
  onCancelTrip,
  actionLoading = false,
}: TripHeroProps) {
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const formattedStart = formatIsoDate(trip.startDate);
  const formattedEnd = formatIsoDate(trip.endDate);
  const dateRangeStr =
    formattedStart && formattedEnd
      ? `${formattedStart} – ${formattedEnd}`
      : (formattedStart ?? 'Dates not set');

  const travelersStr = `${trip.travelers} ${trip.travelers === 1 ? 'Guest' : 'Guests'}`;

  const statusTone =
    tripPhaseInfo.effectiveStatus === 'active'
      ? 'success'
      : tripPhaseInfo.effectiveStatus === 'cancelled'
        ? 'danger'
        : tripPhaseInfo.effectiveStatus === 'completed'
          ? 'neutral'
          : 'warning';

  const statusLabel =
    tripPhaseInfo.effectiveStatus === 'draft'
      ? 'Draft Trip'
      : tripPhaseInfo.effectiveStatus === 'upcoming'
        ? 'Upcoming'
        : tripPhaseInfo.effectiveStatus === 'active'
          ? 'Active Trip'
          : tripPhaseInfo.effectiveStatus === 'completed'
            ? 'Completed'
            : 'Cancelled';

  const headline = () => {
    if (tripPhaseInfo.effectiveStatus === 'cancelled') {
      return (
        <span>
          {trip.title} <span className="italic text-danger-soft">(Cancelled)</span>
        </span>
      );
    }
    if (tripPhaseInfo.phase === 'before') {
      const days = tripPhaseInfo.countdown?.days ?? tripPhaseInfo.daysRemaining ?? 0;
      return (
        <span>
          Your Expedition Begins In{' '}
          <span className="italic text-secondary-fixed">
            {days} {days === 1 ? 'Day' : 'Days'}
          </span>
        </span>
      );
    }
    if (tripPhaseInfo.phase === 'during') {
      return (
        <span>
          Welcome to Cairo —{' '}
          <span className="italic text-secondary-fixed">Day {tripPhaseInfo.dayNumber ?? 1}</span>
        </span>
      );
    }
    if (tripPhaseInfo.phase === 'after') {
      return <span>{trip.title} — Completed Journey</span>;
    }
    return <span>{trip.title}</span>;
  };

  return (
    <section className="relative overflow-hidden rounded-[24px] bg-primary-container text-surface p-space-lg sm:p-space-xl lg:p-space-2xl shadow-xl border border-hairline/20">
      {/* Decorative gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary-container pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-secondary/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-space-xl">
        <div className="flex flex-col gap-space-sm max-w-2xl">
          {/* Eyebrow & Status Bar */}
          <div className="flex flex-wrap items-center gap-space-sm">
            <Badge tone={statusTone} size="sm">
              {statusLabel}
            </Badge>

            {trip.budgetTier && (
              <span className="type-label-sm uppercase text-secondary-fixed-dim tracking-wider">
                {trip.budgetTier} Tier
              </span>
            )}

            {/* Trip switcher if user has multiple trips */}
            {trips.length > 1 && (
              <div className="flex items-center gap-space-xs ms-auto sm:ms-0">
                <label htmlFor="trip-switcher" className="sr-only">
                  Switch trip
                </label>
                <select
                  id="trip-switcher"
                  value={trip.id}
                  onChange={(e) => onSelectTrip(e.target.value)}
                  className="bg-surface-container-high/40 text-surface text-xs rounded-full px-space-sm py-1 border border-surface/20 focus:outline-none focus:border-secondary-fixed"
                >
                  {trips.map((t) => (
                    <option key={t.id} value={t.id} className="bg-primary text-surface">
                      {t.title} ({t.status})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-surface tracking-tight mt-space-xs leading-tight font-normal">
            {headline()}
          </h1>

          {/* Subtitle details */}
          <p className="type-body text-surface-variant max-w-xl">
            {dateRangeStr} · {travelersStr}
            {trip.preferences.accommodationType && trip.preferences.accommodationType !== 'any'
              ? ` · ${trip.preferences.accommodationType}`
              : ''}
          </p>

          {/* Action shortcuts */}
          <div className="flex flex-wrap items-center gap-space-sm pt-space-md">
            <Link
              to={`/trip/${trip.id}`}
              className="inline-flex items-center justify-center gap-space-xs px-space-md py-space-xs rounded-full bg-secondary hover:bg-secondary-fixed hover:text-on-secondary-fixed transition-all text-on-secondary type-label font-medium shadow-md"
            >
              Open Itinerary Builder
            </Link>

            <Link
              to="/stay-transport"
              className="inline-flex items-center justify-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-highest/20 hover:bg-surface-container-highest/40 backdrop-blur-md text-surface transition-all type-label font-medium border border-surface/10"
            >
              Stay &amp; Transport
            </Link>

            {trip.status !== 'cancelled' && (
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-highest/10 hover:bg-danger/20 text-surface-variant hover:text-danger-soft transition-all type-label text-xs border border-surface/10"
              >
                Cancel Trip
              </button>
            )}
          </div>
        </div>

        {/* Countdown / Phase Matrix */}
        <CountdownMatrix
          phase={tripPhaseInfo.phase}
          countdown={tripPhaseInfo.countdown}
          daysRemaining={tripPhaseInfo.daysRemaining}
          dayNumber={tripPhaseInfo.dayNumber}
          totalDays={tripPhaseInfo.totalDays}
          daysSinceEnd={tripPhaseInfo.daysSinceEnd}
        />
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        closeLabel="Close"
        title="Cancel This Trip?"
        description="Are you sure you want to mark this trip as cancelled? Your saved activities and days will be preserved, but the trip status will be set to cancelled."
      >
        <div className="flex items-center justify-end gap-space-sm pt-space-md">
          <Button
            variant="ghost"
            onClick={() => setCancelModalOpen(false)}
            disabled={actionLoading}
          >
            Keep Trip
          </Button>
          <Button
            variant="primary"
            className="!bg-danger !border-danger hover:!bg-danger-soft"
            onClick={() => {
              onCancelTrip(trip.id);
              setCancelModalOpen(false);
            }}
            disabled={actionLoading}
          >
            Confirm Cancellation
          </Button>
        </div>
      </Modal>
    </section>
  );
}
