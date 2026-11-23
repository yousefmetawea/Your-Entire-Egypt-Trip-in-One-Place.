import { usePageTitle } from '../hooks/usePageTitle';
import { useMyTripDashboard } from '../hooks/useMyTripDashboard';
import { TripHero } from '../components/dashboard/TripHero';
import { TodayItinerary } from '../components/dashboard/TodayItinerary';
import { DashboardStay } from '../components/dashboard/DashboardStay';
import { DashboardRequests } from '../components/dashboard/DashboardRequests';
import { BudgetDonut } from '../components/dashboard/BudgetDonut';
import { SavedPlacesGrid } from '../components/dashboard/SavedPlacesGrid';
import { DashboardEmptyState } from '../components/dashboard/DashboardEmptyState';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { Button } from '../components/ui/Button';

export default function MyTripPage() {
  usePageTitle();

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
    simulateConfirmRequest,
    removeSavedPlace,
    reload,
    resetLocalData,
    dismissNotice,
  } = useMyTripDashboard();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-gutter-sm md:px-margin-md lg:px-margin-lg py-space-2xl">
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
    return <DashboardEmptyState />;
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-gutter-sm md:px-margin-md lg:px-margin-lg py-space-lg flex flex-col gap-space-lg min-h-screen">
      {/* Action Notification Toast / Notice */}
      {actionNotice && (
        <aside
          role="status"
          aria-live="polite"
          className="flex items-center justify-between p-space-sm px-space-md rounded-xl bg-secondary-container/40 border border-secondary/30 text-on-surface text-xs"
        >
          <span>{actionNotice}</span>
          <button
            type="button"
            onClick={dismissNotice}
            className="text-secondary hover:text-primary type-label-sm uppercase tracking-wider ms-4"
          >
            Dismiss
          </button>
        </aside>
      )}

      {/* Top Dossier Header & Countdown Hero */}
      <TripHero
        trip={activeTrip}
        trips={trips}
        tripPhaseInfo={tripPhaseInfo}
        onSelectTrip={selectTrip}
        onCancelTrip={cancelTrip}
        actionLoading={actionLoading}
      />

      {/* Main Asymmetric Bento Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg pb-space-2xl items-start">
        {/* Left Column: Itinerary, Accommodation, Transport (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          <TodayItinerary trip={activeTrip} tripPhaseInfo={tripPhaseInfo} places={places} />

          <DashboardStay accommodation={selectedAccommodation} />

          <DashboardRequests
            requests={bookingRequests}
            onCancelRequest={cancelBookingRequest}
            onSimulateConfirmRequest={simulateConfirmRequest}
            actionLoading={actionLoading}
          />
        </div>

        {/* Right Column: Financial Analytics & Saved Places (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          <BudgetDonut analytics={budgetAnalytics} />

          <SavedPlacesGrid
            places={savedPlaces}
            onRemoveSavedPlace={removeSavedPlace}
            actionLoading={actionLoading}
          />
        </div>
      </div>
    </div>
  );
}
