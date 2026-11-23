import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useStayTransport } from '../hooks/useStayTransport';
import { usePageTitle } from '../hooks/usePageTitle';
import { Container } from '../components/ui/Container';
import { Section } from '../components/ui/Section';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { SplitText } from '../components/motion/SplitText';
import { AccommodationCard } from '../components/stay-transport/AccommodationCard';
import { AccommodationFilters } from '../components/stay-transport/AccommodationFilters';
import { AccommodationMap } from '../components/stay-transport/AccommodationMap';
import { TransportCard } from '../components/stay-transport/TransportCard';
import { TransferRequestModal } from '../components/stay-transport/TransferRequestModal';
import { MyRequestsList } from '../components/stay-transport/MyRequestsList';
import { BedIcon, CarIcon, InfoIcon } from '../components/ui/icons';

export default function StayTransportPage() {
  const { t } = useTranslation();
  usePageTitle();
  const navigate = useNavigate();

  const {
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
  } = useStayTransport();

  // Modals state
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [externalUrlNotice, setExternalUrlNotice] = useState<string | null>(null);
  const [noTripStayId, setNoTripStayId] = useState<string | null>(null);

  const selectedAccommodationId = currentTrip?.accommodationId || null;

  const handleSetStay = async (accId: string) => {
    const res = await setAsMyStay(accId);
    if (res.needsTrip) {
      setNoTripStayId(accId);
    }
  };

  const handleCreateDraftWithStay = async () => {
    if (noTripStayId) {
      await createDraftWithStay(noTripStayId);
      setNoTripStayId(null);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Top Header Section */}
      <Section tone="canvas" spacing="sm" className="border-b border-hairline">
        <Container>
          <div className="flex flex-col gap-space-sm max-w-3xl">
            <span className="type-label text-secondary uppercase font-semibold">
              {t('stayTransport.header.eyebrow', 'Sanctuaries & Transit')}
            </span>
            <h1 className="type-display text-primary">
              <SplitText as="span">{t('stayTransport.header.title', 'Stay & Transport')}</SplitText>
            </h1>
            <p className="type-body-lg text-on-surface-variant">
              {t(
                'stayTransport.header.subtitle',
                'Compare places to stay and seamless ways to get around Cairo, with estimated prices clearly labeled.',
              )}
            </p>

            {/* Persistent Honesty Notice */}
            <div className="rounded-xl border border-hairline bg-surface-container-low p-space-sm mt-space-xs flex items-start gap-space-xs">
              <InfoIcon className="size-5 text-secondary shrink-0 mt-0.5" />
              <p className="type-small text-on-surface-variant">
                Rates and prices shown are estimates with last-updated dates. Availability is not
                checked in real-time. Transfers start as pending requests and external stays link
                out to providers.
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div
            className="flex items-center gap-space-xs mt-space-lg"
            role="tablist"
            aria-label="Stay and transport categories"
          >
            <button
              role="tab"
              aria-selected={tab === 'accommodation'}
              aria-controls="panel-accommodation"
              id="tab-accommodation"
              tabIndex={tab === 'accommodation' ? 0 : -1}
              onClick={() => setTab('accommodation')}
              className={`flex items-center gap-space-xs px-space-lg py-space-sm rounded-full type-button transition-all duration-200 ${
                tab === 'accommodation'
                  ? 'bg-primary text-on-primary shadow-resting'
                  : 'bg-surface-container text-on-surface-variant hover:text-primary'
              }`}
            >
              <BedIcon className="size-4" />
              <span>{t('stayTransport.tabs.accommodation', 'Accommodation')}</span>
            </button>

            <button
              role="tab"
              aria-selected={tab === 'transportation'}
              aria-controls="panel-transportation"
              id="tab-transportation"
              tabIndex={tab === 'transportation' ? 0 : -1}
              onClick={() => setTab('transportation')}
              className={`flex items-center gap-space-xs px-space-lg py-space-sm rounded-full type-button transition-all duration-200 ${
                tab === 'transportation'
                  ? 'bg-primary text-on-primary shadow-resting'
                  : 'bg-surface-container text-on-surface-variant hover:text-primary'
              }`}
            >
              <CarIcon className="size-4" />
              <span>{t('stayTransport.tabs.transportation', 'Transportation')}</span>
            </button>
          </div>
        </Container>
      </Section>

      {/* Main Content Panels */}
      <Section tone="canvas" spacing="md">
        <Container>
          {loading ? (
            <div className="py-space-2xl text-center">
              <p className="type-body text-on-surface-variant">Loading catalog…</p>
            </div>
          ) : error ? (
            <EmptyState
              title="Failed to load options"
              description={error}
              actions={
                <Button variant="secondary" size="md" onClick={reload}>
                  Retry
                </Button>
              }
            />
          ) : tab === 'accommodation' ? (
            /* Accommodation Tab Panel */
            <div
              role="tabpanel"
              id="panel-accommodation"
              aria-labelledby="tab-accommodation"
              className="flex flex-col gap-space-md"
            >
              {/* Accommodation Map */}
              <AccommodationMap
                accommodations={accommodations}
                selectedId={selectedAccommodationId}
                onSetAsStay={handleSetStay}
              />

              {/* Filters */}
              <AccommodationFilters
                type={typeFilter}
                amenity={amenityFilter}
                onTypeChange={setTypeFilter}
                onAmenityChange={setAmenityFilter}
              />

              {/* Accommodation Grid */}
              {accommodations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter-lg mt-space-sm">
                  {accommodations.map((acc) => (
                    <AccommodationCard
                      key={acc.id}
                      accommodation={acc}
                      isSelected={selectedAccommodationId === acc.id}
                      onSetAsStay={() => handleSetStay(acc.id)}
                      onOpenExternalModal={(url) => setExternalUrlNotice(url)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No places match your filters"
                  description="Try adjusting your type or amenity filters to see more accommodation options."
                  actions={
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setTypeFilter('all');
                        setAmenityFilter('all');
                      }}
                    >
                      Reset filters
                    </Button>
                  }
                />
              )}
            </div>
          ) : (
            /* Transportation Tab Panel */
            <div
              role="tabpanel"
              id="panel-transportation"
              aria-labelledby="tab-transportation"
              className="flex flex-col gap-space-md"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter-lg">
                {transports.map((opt) => (
                  <TransportCard
                    key={opt.id}
                    option={opt}
                    onRequestTransfer={() => setTransferModalOpen(true)}
                    onOpenExternalModal={(url) => setExternalUrlNotice(url)}
                  />
                ))}
              </div>

              {/* Transfer Requests List */}
              <MyRequestsList
                requests={requests}
                onCancelRequest={cancelRequest}
                onSimulateConfirm={simulateConfirmRequest}
              />
            </div>
          )}
        </Container>
      </Section>

      {/* Airport Transfer Request Modal */}
      <TransferRequestModal
        open={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        onSubmit={requestTransfer}
        trip={currentTrip}
      />

      {/* External Link Notice Modal */}
      <Modal
        open={externalUrlNotice !== null}
        onClose={() => setExternalUrlNotice(null)}
        title="External Provider Booking"
        description="You are following an external link. In this demo experience, the link leads to an example URL."
        closeLabel="Cancel"
        size="sm"
        footer={
          <div className="flex justify-end gap-space-xs">
            <Button variant="secondary" size="sm" onClick={() => setExternalUrlNotice(null)}>
              Cancel
            </Button>
            <a
              href={externalUrlNotice || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-primary px-space-md py-space-xs type-button text-on-primary"
              onClick={() => setExternalUrlNotice(null)}
            >
              Proceed to provider ↗
            </a>
          </div>
        }
      >
        <p className="type-small text-on-surface-variant">
          URL: <code className="bg-surface-container px-1 py-0.5 rounded">{externalUrlNotice}</code>
        </p>
      </Modal>

      {/* No Trip Dialog for Set as Stay */}
      <Modal
        open={noTripStayId !== null}
        onClose={() => setNoTripStayId(null)}
        title="Set As My Stay"
        description="You do not have an active trip yet. You can create a starter draft trip with this stay or plan an itinerary first."
        closeLabel="Close"
        size="sm"
        footer={
          <div className="flex justify-end gap-space-xs flex-wrap">
            <Button variant="secondary" size="sm" onClick={() => navigate('/plan')}>
              Plan a Trip
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateDraftWithStay}>
              Create Draft Trip with Stay
            </Button>
          </div>
        }
      />
    </div>
  );
}
