import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import type {
  Accommodation,
  AirportTransferDetails,
  BookingRequest,
  TransportOption,
  Trip,
} from '../types';
import { services } from '../services';

export function useStayTransport() {
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = searchParams.get('tab') === 'transportation' ? 'transportation' : 'accommodation';
  const typeFilter = searchParams.get('type') || 'all';
  const amenityFilter = searchParams.get('amenity') || 'all';

  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [transports, setTransports] = useState<TransportOption[]>([]);
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    Promise.all([
      services.accommodation.list({
        type: typeFilter !== 'all' ? (typeFilter as Accommodation['type']) : undefined,
        amenity: amenityFilter !== 'all' ? amenityFilter : undefined,
      }),
      services.transport.list(),
      services.bookingRequests.listMine(),
      services.trips.listMine(),
    ])
      .then(([accs, trans, reqs, trips]) => {
        if (active) {
          setAccommodations(accs);
          setTransports(trans);
          setRequests(reqs);
          setCurrentTrip(trips.find((t) => t.status === 'draft') || trips[0] || null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load stay & transport data.');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [typeFilter, amenityFilter, attempt]);

  const reload = useCallback(() => {
    setLoading(true);
    setAttempt((c) => c + 1);
  }, []);

  const setTab = (newTab: 'accommodation' | 'transportation') => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', newTab);
    setSearchParams(next, { replace: true });
  };

  const setTypeFilter = (type: string) => {
    const next = new URLSearchParams(searchParams);
    if (type === 'all') next.delete('type');
    else next.set('type', type);
    setSearchParams(next, { replace: true });
  };

  const setAmenityFilter = (amenity: string) => {
    const next = new URLSearchParams(searchParams);
    if (amenity === 'all') next.delete('amenity');
    else next.set('amenity', amenity);
    setSearchParams(next, { replace: true });
  };

  const setAsMyStay = async (
    accommodationId: string,
  ): Promise<{ success: boolean; needsTrip: boolean }> => {
    if (!currentTrip) {
      return { success: false, needsTrip: true };
    }

    const updated = await services.trips.update(currentTrip.id, {
      accommodationId,
    });
    setCurrentTrip(updated);
    return { success: true, needsTrip: false };
  };

  const createDraftWithStay = async (accommodationId: string) => {
    const created = await services.trips.create({
      title: 'My Cairo trip',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      travelers: 2,
      accommodationId,
    });
    setCurrentTrip(created);
  };

  const requestTransfer = async (details: AirportTransferDetails) => {
    const req = await services.bookingRequests.create({
      kind: 'airport-transfer',
      tripId: currentTrip?.id,
      details,
    });
    setRequests((prev) => [...prev, req]);
  };

  const cancelRequest = async (id: string) => {
    const updated = await services.bookingRequests.cancel(id);
    setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
  };

  const simulateConfirmRequest = async (id: string) => {
    const updated = await services.bookingRequests.simulateConfirm(id);
    setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
  };

  return {
    tab,
    typeFilter,
    amenityFilter,
    setTab,
    setTypeFilter,
    setAmenityFilter,
    accommodations,
    transports,
    requests,
    currentTrip,
    loading,
    error,
    reload,
    setAsMyStay,
    createDraftWithStay,
    requestTransfer,
    cancelRequest,
    simulateConfirmRequest,
  };
}
