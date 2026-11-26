import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useStayTransport } from '../hooks/useStayTransport';
import { usePageTitle } from '../hooks/usePageTitle';
import { Container } from '../components/ui/Container';
import { Section } from '../components/ui/Section';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { Reveal } from '../components/motion/Reveal';
import { TiltCard } from '../components/motion/TiltCard';
import { StayHero } from '../components/stay-transport/StayHero';
import { TabSwitch } from '../components/stay-transport/TabSwitch';
import { WaysToMove } from '../components/stay-transport/WaysToMove';
import { COPY } from '../components/stay-transport/copy';
import { AccommodationCard } from '../components/stay-transport/AccommodationCard';
import { AccommodationFilters } from '../components/stay-transport/AccommodationFilters';
import { AccommodationMap } from '../components/stay-transport/AccommodationMap';
import { TransportCard } from '../components/stay-transport/TransportCard';
import { TransferRequestModal } from '../components/stay-transport/TransferRequestModal';
import { RouteMap } from '../components/stay-transport/RouteMap';
import { MyRequestsList } from '../components/stay-transport/MyRequestsList';

function SectionHead({
  eyebrow,
  title,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  dark?: boolean;
}) {
  return (
    <Reveal className="mb-space-sm flex flex-col gap-2">
      <span
        className={`flex items-center gap-3 type-label font-semibold uppercase tracking-[0.25em] ${dark ? 'text-[#ffb25a]' : 'text-secondary'}`}
      >
        <span className={`h-px w-10 ${dark ? 'bg-[#ffb25a]' : 'bg-secondary'}`} />
        {eyebrow}
      </span>
      <h2 className={`type-display ${dark ? 'text-white' : 'text-primary'}`}>{title}</h2>
    </Reveal>
  );
}

export default function StayTransportPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const reduce = useReducedMotion();
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
  } = useStayTransport();

  // Modals state
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [externalUrlNotice, setExternalUrlNotice] = useState<string | null>(null);
  const [noTripStayId, setNoTripStayId] = useState<string | null>(null);

  const selectedAccommodationId = currentTrip?.accommodationId || null;
  const stayLocation =
    accommodations.find((a) => a.id === selectedAccommodationId)?.location ?? null;

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

  const copy = COPY[isAr ? 'ar' : 'en'];
  const contentRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focus, setFocus] = useState<{ id: string; n: number } | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const flashTimer = useRef<number | undefined>(undefined);

  const flashCard = (id: string) => {
    setFlashId(id);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlashId(null), 2400);
  };
  // Map pin clicked: bring its card into view and highlight it.
  const handlePinSelect = (id: string) => {
    setFocus((f) => ({ id, n: (f?.n ?? 0) + 1 }));
    document
      .getElementById(`stay-card-${id}`)
      ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    flashCard(id);
  };
  // Card clicked: fly the map to its pin.
  const handleCardFocus = (id: string) => setFocus((f) => ({ id, n: (f?.n ?? 0) + 1 }));

  const pick = (next: 'accommodation' | 'transportation') => {
    setTab(next);
    window.setTimeout(
      () =>
        contentRef.current?.scrollIntoView({
          behavior: reduce ? 'auto' : 'smooth',
          block: 'start',
        }),
      60,
    );
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      <StayHero
        copy={copy}
        isAr={isAr}
        stays={accommodations.length}
        ways={transports.length}
        onPick={pick}
      />

      {/* Tab switch + ticker */}
      <div ref={contentRef} className="relative scroll-mt-4 bg-[#070a12] pb-10">
        <div className="flex justify-center">
          <TabSwitch
            tab={tab as 'accommodation' | 'transportation'}
            onChange={setTab}
            labels={{ stay: copy.tabStay, transport: copy.tabTransport }}
          />
        </div>
        <div
          className="mt-10 overflow-hidden border-y border-white/10 py-4"
          dir="ltr"
          aria-hidden="true"
        >
          <motion.div
            className="flex w-max gap-12 whitespace-nowrap text-sm font-semibold uppercase tracking-[0.3em] text-white/45"
            animate={reduce ? undefined : { x: ['0%', '-50%'] }}
            transition={{ duration: 36, ease: 'linear', repeat: Infinity }}
          >
            {[...copy.ticker, ...copy.ticker, ...copy.ticker, ...copy.ticker].map((w, i) => (
              <span key={i} className="flex items-center gap-12">
                {w}
                <span className="text-[#ffb25a]">✦</span>
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {tab === 'transportation' && !loading && !error ? <WaysToMove copy={copy} /> : null}

      {/* Main Content Panels */}
      <Section
        tone="canvas"
        spacing="md"
        className={
          tab === 'accommodation' && !loading && !error ? '!bg-[#070a12] !text-white' : undefined
        }
      >
        <Container>
          {loading ? (
            <div className="py-space-2xl text-center">
              <p className="type-body text-on-surface-variant">
                {isAr ? 'جارٍ التحميل…' : 'Loading…'}
              </p>
            </div>
          ) : error ? (
            <EmptyState
              title={isAr ? 'تعذر التحميل' : 'Could not load options'}
              description={error}
              actions={
                <Button variant="secondary" size="md" onClick={reload}>
                  {isAr ? 'إعادة المحاولة' : 'Retry'}
                </Button>
              }
            />
          ) : tab === 'accommodation' ? (
            <div
              role="tabpanel"
              id="panel-accommodation"
              aria-labelledby="tab-accommodation"
              className="flex flex-col gap-space-md"
            >
              <SectionHead eyebrow={copy.stayEyebrow} title={copy.stayTitle} dark />
              <AccommodationMap
                accommodations={accommodations}
                selectedId={selectedAccommodationId}
                hoveredId={hoveredId}
                focus={focus}
                onSelectAccommodation={handlePinSelect}
                onHoverAccommodation={setHoveredId}
                onSetAsStay={handleSetStay}
              />
              <AccommodationFilters
                type={typeFilter}
                amenity={amenityFilter}
                onTypeChange={setTypeFilter}
                onAmenityChange={setAmenityFilter}
              />
              {accommodations.length > 0 ? (
                <div className="mt-space-sm grid grid-flow-dense grid-cols-1 gap-5 md:grid-cols-2 lg:auto-rows-[22rem] lg:grid-cols-3">
                  {accommodations.map((acc, i) => {
                    const featured = i % 6 === 0;
                    return (
                      <Reveal
                        key={acc.id}
                        delay={(i % 3) * 0.08}
                        className={featured ? 'h-full md:col-span-2 lg:row-span-2' : 'h-full'}
                      >
                        <AccommodationCard
                          accommodation={acc}
                          index={i}
                          featured={featured}
                          isSelected={selectedAccommodationId === acc.id}
                          isFlashing={flashId === acc.id}
                          onSetAsStay={() => handleSetStay(acc.id)}
                          onOpenExternalModal={(url) => setExternalUrlNotice(url)}
                          onHover={setHoveredId}
                          onFocusCard={handleCardFocus}
                        />
                      </Reveal>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title={isAr ? 'لا توجد نتائج' : 'No places match your filters'}
                  description={
                    isAr ? 'جرّب تغيير الفلاتر.' : 'Try changing the type or amenity filters.'
                  }
                  actions={
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setTypeFilter('all');
                        setAmenityFilter('all');
                      }}
                    >
                      {isAr ? 'إعادة ضبط' : 'Reset filters'}
                    </Button>
                  }
                />
              )}
            </div>
          ) : (
            <div
              role="tabpanel"
              id="panel-transportation"
              aria-labelledby="tab-transportation"
              className="flex flex-col gap-space-md"
            >
              <SectionHead eyebrow={copy.moveEyebrow} title={copy.moveTitle} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter-lg">
                {transports.map((opt, i) => (
                  <Reveal key={opt.id} delay={(i % 2) * 0.1}>
                    <TiltCard intensity={4} className="h-full">
                      <TransportCard
                        option={opt}
                        onRequestTransfer={() => setTransferModalOpen(true)}
                        onOpenExternalModal={(url) => setExternalUrlNotice(url)}
                      />
                    </TiltCard>
                  </Reveal>
                ))}
              </div>
              <RouteMap stayLocation={stayLocation} />
              <MyRequestsList requests={requests} onCancelRequest={cancelRequest} />
            </div>
          )}
        </Container>
      </Section>

      {/* Closing brand band */}
      <section className="relative overflow-hidden bg-[#070a12] py-28 text-center text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_300px_at_50%_100%,rgba(255,170,80,0.22),transparent_70%)]" />
        <Container>
          <Reveal className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-6">
            <h2 className="text-4xl font-semibold leading-tight md:text-6xl">
              {copy.closingTitle}
            </h2>
            <p className="text-lg text-white/65">{copy.closingLine}</p>
            <button
              type="button"
              onClick={() => navigate('/plan')}
              className="rounded-full bg-gradient-to-r from-[#ffd7a0] to-[#ffb25a] px-8 py-3.5 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5"
            >
              {copy.closingCta}
            </button>
          </Reveal>
        </Container>
      </section>

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
        description="You are following an external link. This link leads to an example URL."
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
