import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../hooks/usePageTitle';
import { useMyTripDashboard } from '../hooks/useMyTripDashboard';
import { DashboardEmptyState } from '../components/dashboard/DashboardEmptyState';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { Button } from '../components/ui/Button';
import { TripHero } from '../components/mytrip/TripHero';
import { TripOverview } from '../components/mytrip/TripOverview';
import { ItinerarySection } from '../components/mytrip/ItinerarySection';
import { BudgetOverview } from '../components/mytrip/BudgetOverview';
import { StaySection } from '../components/mytrip/StaySection';
import { TransportSection } from '../components/mytrip/TransportSection';
import { SavedPlaces } from '../components/mytrip/SavedPlaces';
import { JourneyStory } from '../components/mytrip/JourneyStory';
import '../components/mytrip/mytrip.css';
import { computeTripStats, countTransfers, pickHeroPlace } from '../lib/mytrip/summary';

export default function MyTripPage() {
  usePageTitle();
  const { t } = useTranslation();

  const {
    trips,
    activeTrip,
    tripPhaseInfo,
    selectedAccommodation,
    bookingRequests,
    places,
    savedPlaces,
    budgetAnalytics,
    loading,
    error,
    actionLoading,
    actionNotice,
    selectTrip,
    cancelTrip,
    cancelBookingRequest,
    removeSavedPlace,
    reload,
    resetLocalData,
    dismissNotice,
  } = useMyTripDashboard();

  const placesById = useMemo(() => new Map(places.map((p) => [p.id, p] as const)), [places]);
  const stats = useMemo(() => (activeTrip ? computeTripStats(activeTrip) : null), [activeTrip]);
  const heroPlace = useMemo(
    () => (activeTrip ? pickHeroPlace(activeTrip, placesById) : null),
    [activeTrip, placesById],
  );

  if (loading) {
    return (
      <div className="pt-24 md:pt-28">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-gutter-sm md:px-margin-md lg:px-margin-lg py-space-2xl pt-32">
        <div className="max-w-xl mx-auto p-space-xl rounded-[24px] bg-surface-container-lowest border border-danger/30 text-center flex flex-col items-center justify-center gap-space-md shadow-sm">
          <span className="type-label-sm uppercase tracking-widest text-danger font-semibold">
            Unable to Load Dashboard
          </span>
          <h2 className="font-serif text-2xl text-primary font-medium">Something went wrong</h2>
          <p className="type-body text-xs text-on-surface-variant max-w-md">{error}</p>
          <div className="flex flex-wrap items-center justify-center gap-space-sm pt-space-xs">
            <Button variant="primary" onClick={reload}>
              Try Again
            </Button>
            <Button variant="ghost" onClick={resetLocalData}>
              Reset Local Data
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!activeTrip || !tripPhaseInfo) {
    return (
      <div className="pt-24 md:pt-28">
        <DashboardEmptyState />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="yt-trip min-h-screen">
      <TripHero
        trip={activeTrip}
        trips={trips}
        tripPhaseInfo={tripPhaseInfo}
        heroPlace={heroPlace}
        placesById={placesById}
        accommodation={selectedAccommodation}
        destinations={stats.destinations}
        activities={stats.activities}
        onSelectTrip={selectTrip}
        onCancelTrip={cancelTrip}
        actionLoading={actionLoading}
      />

      <div className="relative -mt-10 rounded-t-[2.5rem] bg-(--yt-ivory) pt-14 pb-20 md:-mt-12 md:rounded-t-[3.5rem] md:pt-20 md:pb-28">
        <div className="mx-auto flex w-full max-w-page flex-col gap-20 px-gutter-sm md:gap-28 md:px-margin-md lg:px-margin-lg">
          {actionNotice && (
            <aside
              role="status"
              aria-live="polite"
              className="flex items-center justify-between rounded-2xl bg-(--yt-sage) px-5 py-3 text-sm"
            >
              <span>{actionNotice}</span>
              <button
                type="button"
                onClick={dismissNotice}
                className="ms-4 cursor-pointer text-xs font-semibold tracking-wider uppercase underline underline-offset-4"
              >
                {t('myTrip.dismiss')}
              </button>
            </aside>
          )}
          <TripOverview
            stats={stats}
            budget={budgetAnalytics}
            accommodation={selectedAccommodation}
            transfers={countTransfers(bookingRequests)}
          />
          <ItinerarySection
            key={activeTrip.id}
            trip={activeTrip}
            tripPhaseInfo={tripPhaseInfo}
            placesById={placesById}
          />
        </div>
      </div>

      <BudgetOverview analytics={budgetAnalytics} />
      <StaySection trip={activeTrip} accommodation={selectedAccommodation} />
      <TransportSection
        requests={bookingRequests}
        onCancelRequest={cancelBookingRequest}
        actionLoading={actionLoading}
      />
      <SavedPlaces places={savedPlaces} onRemove={removeSavedPlace} actionLoading={actionLoading} />
      <JourneyStory
        trip={activeTrip}
        tripPhaseInfo={tripPhaseInfo}
        placesById={placesById}
        stats={stats}
        budget={budgetAnalytics}
      />
    </div>
  );
}
