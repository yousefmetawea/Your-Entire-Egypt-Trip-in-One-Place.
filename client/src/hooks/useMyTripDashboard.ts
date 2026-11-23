import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Accommodation, BookingRequest, Place, Trip } from '../types';
import { services } from '../services';
import {
  calculateBudgetAnalytics,
  type BudgetAnalyticsResult,
} from '../lib/dashboard/budgetAnalytics';
import { calculateTripPhase, type TripPhaseInfo } from '../lib/dashboard/tripPhase';

export const STORE_UPDATED_EVENT = 'discover-cairo:store-updated';

export function notifyStoreUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(STORE_UPDATED_EVENT));
  }
}

export function useMyTripDashboard() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Load all initial data
  const loadData = useCallback(async () => {
    setError(null);

    try {
      const [fetchedTrips, fetchedRequests, fetchedAccs, fetchedPlaces] = await Promise.all([
        services.trips.listMine(),
        services.bookingRequests.listMine(),
        services.accommodation.list(),
        services.places.list(),
      ]);

      setTrips(fetchedTrips);
      setBookingRequests(fetchedRequests);
      setAccommodations(fetchedAccs);
      setPlaces(fetchedPlaces);

      // Auto-select primary trip if none selected or if previously selected no longer exists
      setSelectedTripId((prev) => {
        if (prev && fetchedTrips.some((t) => t.id === prev)) {
          return prev;
        }
        // Prefer active, then upcoming, then draft, then first available
        const active = fetchedTrips.find((t) => t.status === 'active');
        if (active) return active.id;
        const upcoming = fetchedTrips.find((t) => t.status === 'upcoming');
        if (upcoming) return upcoming.id;
        const draft = fetchedTrips.find((t) => t.status === 'draft');
        if (draft) return draft.id;
        return fetchedTrips[0]?.id ?? null;
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    let active = true;

    Promise.all([
      services.trips.listMine(),
      services.bookingRequests.listMine(),
      services.accommodation.list(),
      services.places.list(),
    ])
      .then(([fetchedTrips, fetchedRequests, fetchedAccs, fetchedPlaces]) => {
        if (!active) return;
        setTrips(fetchedTrips);
        setBookingRequests(fetchedRequests);
        setAccommodations(fetchedAccs);
        setPlaces(fetchedPlaces);

        const activeTripItem = fetchedTrips.find((t) => t.status === 'active');
        const upcomingTripItem = fetchedTrips.find((t) => t.status === 'upcoming');
        const draftTripItem = fetchedTrips.find((t) => t.status === 'draft');
        setSelectedTripId(
          activeTripItem?.id ??
            upcomingTripItem?.id ??
            draftTripItem?.id ??
            fetchedTrips[0]?.id ??
            null,
        );
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data.');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Periodic minute-tick to update countdown timer without polling the server
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  // Cross-tab and same-tab synchronization
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key.startsWith('discover-cairo.')) {
        void loadData();
      }
    };

    const handleCustomUpdate = () => {
      void loadData();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(STORE_UPDATED_EVENT, handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(STORE_UPDATED_EVENT, handleCustomUpdate);
    };
  }, [loadData]);

  // The active trip object
  const activeTrip = useMemo(() => {
    if (!selectedTripId) return trips[0] ?? null;
    return trips.find((t) => t.id === selectedTripId) ?? trips[0] ?? null;
  }, [trips, selectedTripId]);

  // Selected accommodation for the active trip
  const selectedAccommodation = useMemo(() => {
    if (!activeTrip?.accommodationId) return null;
    return accommodations.find((a) => a.id === activeTrip.accommodationId) ?? null;
  }, [accommodations, activeTrip]);

  // Booking requests for this trip (or all user requests if not linked to a specific trip)
  const tripBookingRequests = useMemo(() => {
    if (!activeTrip) return bookingRequests;
    return bookingRequests.filter((req) => !req.tripId || req.tripId === activeTrip.id);
  }, [bookingRequests, activeTrip]);

  // Saved places for this trip
  const savedPlaces = useMemo(() => {
    if (!activeTrip || !activeTrip.savedPlaceIds || activeTrip.savedPlaceIds.length === 0) {
      return [];
    }
    const idSet = new Set(activeTrip.savedPlaceIds);
    return places.filter((p) => idSet.has(p.id));
  }, [activeTrip, places]);

  // Trip phase & countdown calculation (recalculated on tick or activeTrip change)
  const tripPhaseInfo: TripPhaseInfo | null = useMemo(() => {
    if (!activeTrip) return null;
    return calculateTripPhase(activeTrip, new Date());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrip, tick]);

  // Budget analytics
  const budgetAnalytics: BudgetAnalyticsResult | null = useMemo(() => {
    if (!activeTrip) return null;
    return calculateBudgetAnalytics(activeTrip, selectedAccommodation, tripBookingRequests);
  }, [activeTrip, selectedAccommodation, tripBookingRequests]);

  // Actions
  const selectTrip = useCallback((tripId: string) => {
    setSelectedTripId(tripId);
  }, []);

  const cancelTrip = useCallback(async (tripId: string) => {
    setActionLoading(true);
    try {
      const updated = await services.trips.update(tripId, { status: 'cancelled' });
      setTrips((prev) => prev.map((t) => (t.id === tripId ? updated : t)));
      setActionNotice('Trip status updated to cancelled.');
      notifyStoreUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to cancel trip.');
    } finally {
      setActionLoading(false);
    }
  }, []);

  const cancelBookingRequest = useCallback(async (requestId: string) => {
    setActionLoading(true);
    try {
      const cancelled = await services.bookingRequests.cancel(requestId);
      setBookingRequests((prev) => prev.map((r) => (r.id === requestId ? cancelled : r)));
      setActionNotice('Transfer request was cancelled.');
      notifyStoreUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking request.');
    } finally {
      setActionLoading(false);
    }
  }, []);

  const simulateConfirmRequest = useCallback(async (requestId: string) => {
    setActionLoading(true);
    try {
      const confirmed = await services.bookingRequests.simulateConfirm(requestId);
      setBookingRequests((prev) => prev.map((r) => (r.id === requestId ? confirmed : r)));
      setActionNotice('Transfer confirmed (simulated).');
      notifyStoreUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to confirm request.');
    } finally {
      setActionLoading(false);
    }
  }, []);

  const removeSavedPlace = useCallback(
    async (placeId: string) => {
      if (!activeTrip) return;
      setActionLoading(true);
      try {
        const nextSaved = activeTrip.savedPlaceIds.filter((id) => id !== placeId);
        const updated = await services.trips.update(activeTrip.id, {
          savedPlaceIds: nextSaved,
        });
        setTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        notifyStoreUpdated();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to update saved places.');
      } finally {
        setActionLoading(false);
      }
    },
    [activeTrip],
  );

  const savePlace = useCallback(
    async (placeId: string) => {
      if (!activeTrip) return;
      if (activeTrip.savedPlaceIds.includes(placeId)) return;
      setActionLoading(true);
      try {
        const nextSaved = [...activeTrip.savedPlaceIds, placeId];
        const updated = await services.trips.update(activeTrip.id, {
          savedPlaceIds: nextSaved,
        });
        setTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        notifyStoreUpdated();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to save place.');
      } finally {
        setActionLoading(false);
      }
    },
    [activeTrip],
  );

  const resetLocalData = useCallback(async () => {
    setLoading(true);
    try {
      await services.resetLocalData();
      await loadData();
      notifyStoreUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset local data.');
      setLoading(false);
    }
  }, [loadData]);

  return {
    trips,
    activeTrip,
    selectedTripId,
    tripPhaseInfo,
    selectedAccommodation,
    bookingRequests: tripBookingRequests,
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
    savePlace,
    reload: () => {
      setLoading(true);
      void loadData();
    },
    resetLocalData,
    dismissNotice: () => setActionNotice(null),
  };
}
