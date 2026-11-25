import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { services } from '../services';
import { useAuth } from '../context/useAuth';
import { usePageTitle } from '../hooks/usePageTitle';
import { Container } from '../components/ui/Container';
import { Section } from '../components/ui/Section';
import { RequestStatusChip } from '../components/stay-transport/RequestStatusChip';
import { StatusTimeline } from '../components/stay-transport/StatusTimeline';
import type { BookingRequest, BookingStatus } from '../types';

type Filter = 'all' | BookingStatus;

const REFRESH_MS = 30000;

const pill =
  'whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50';

function describe(req: BookingRequest) {
  if (req.kind === 'airport-transfer') {
    return {
      route: `${req.details.pickupLocation} → ${req.details.dropoffLocation}`,
      people: req.details.passengers,
      extra: [req.details.flightNumber, req.details.notes].filter(Boolean).join(' · '),
    };
  }
  return {
    route: req.details.placeId,
    people: req.details.groupSize,
    extra: req.details.notes ?? '',
  };
}

function RequestCard({
  req,
  busy,
  onSetStatus,
}: {
  req: BookingRequest;
  busy: boolean;
  onSetStatus: (id: string, status: 'confirmed' | 'cancelled', note: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const [note, setNote] = useState('');
  const [open, setOpen] = useState(false);
  const info = describe(req);
  const contactPhone = req.contact?.phone ?? '';
  const phoneDigits = contactPhone.replace(/\D/g, '');
  const received = new Date(req.createdAt).toLocaleString(i18n.language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const canAct = req.status === 'pending' || req.status === 'confirmed';

  return (
    <article className="flex flex-col gap-4 rounded-3xl bg-white/[0.04] p-5 ring-1 ring-white/10 backdrop-blur">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <RequestStatusChip status={req.status} size="sm" dark />
            <span className="text-lg font-semibold">
              {req.kind === 'airport-transfer'
                ? t('stayTransport.admin.transfer', 'Airport transfer')
                : t('stayTransport.admin.tour', 'Guided tour')}
            </span>
          </div>
          <p className="text-sm text-white/60">
            <span className="font-mono tracking-wider text-[#ffb25a]" dir="ltr">
              {req.referenceCode ?? '-'}
            </span>
            {' · '}
            {t('stayTransport.admin.requestedAt', 'Received')} {received}
          </p>
        </div>
        <div className={`flex flex-wrap gap-2 ${phoneDigits ? '' : 'hidden'}`}>
          <a
            href={`tel:${contactPhone.replace(/[^\d+]/g, '')}`}
            className={`${pill} bg-white/10 text-white hover:bg-white/20`}
          >
            {t('stayTransport.admin.call', 'Call')}
          </a>
          <a
            href={`https://wa.me/${phoneDigits}`}
            target="_blank"
            rel="noreferrer"
            className={`${pill} bg-emerald-400/15 text-emerald-300 hover:bg-emerald-400/25`}
          >
            {t('stayTransport.admin.whatsapp', 'WhatsApp')}
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 border-t border-white/10 pt-4 text-sm text-white/60 sm:grid-cols-2">
        <div>
          <span className="font-semibold text-white">
            {req.contact?.name ??
              t('stayTransport.admin.noContact', 'No contact details (older request)')}
          </span>{' '}
          <span dir="ltr">{contactPhone}</span>
          {req.contact?.email ? <span dir="ltr"> · {req.contact.email}</span> : null}{' '}
          <span className="text-white/40">
            (
            {req.userId
              ? t('stayTransport.admin.account', 'Account')
              : t('stayTransport.admin.guest', 'Guest')}
            )
          </span>
        </div>
        <div>
          <span className="font-semibold text-white">
            {t('stayTransport.admin.when', 'When')}:{' '}
          </span>
          <span dir="ltr">
            {req.details.date} {req.details.time}
          </span>
        </div>
        <div className="sm:col-span-2">
          <span className="font-semibold text-white">
            {t('stayTransport.admin.route', 'Route')}:{' '}
          </span>
          <span dir="auto">{info.route}</span>
        </div>
        <div>
          <span className="font-semibold text-white">
            {t('stayTransport.admin.people', 'People')}:{' '}
          </span>
          {info.people}
        </div>
        {info.extra ? <div dir="auto">{info.extra}</div> : null}
      </div>

      {canAct ? (
        <div className="flex flex-col gap-3 border-t border-white/10 pt-4 md:flex-row md:items-center">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            placeholder={t(
              'stayTransport.admin.notePlaceholder',
              'Note for the customer (optional)',
            )}
            aria-label={t(
              'stayTransport.admin.notePlaceholder',
              'Note for the customer (optional)',
            )}
            className="min-w-0 flex-1 rounded-full bg-white/[0.06] px-4 py-2.5 text-sm text-white ring-1 ring-white/15 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#ffb25a]"
          />
          <div className="flex gap-2">
            {req.status === 'pending' ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => onSetStatus(req.id, 'confirmed', note)}
                className={`${pill} bg-white text-[#0a0e17] hover:bg-[#ffb25a]`}
              >
                {t('stayTransport.admin.confirm', 'Confirm')}
              </button>
            ) : null}
            <button
              type="button"
              disabled={busy}
              onClick={() => onSetStatus(req.id, 'cancelled', note)}
              className={`${pill} text-rose-300 ring-1 ring-rose-400/30 hover:bg-rose-400/10`}
            >
              {t('stayTransport.admin.decline', 'Decline')}
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="self-start text-xs font-semibold uppercase tracking-[0.2em] text-[#ffb25a] hover:underline"
      >
        {t('stayTransport.requestsList.timeline', 'Status history')}
      </button>
      {open ? <StatusTimeline history={req.statusHistory} dark /> : null}
    </article>
  );
}

export default function AdminBookingsPage() {
  usePageTitle();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [filter, setFilter] = useState<Filter>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const all = await services.adminBookings.list();
      setRequests(all);
      setError(null);
      setUpdatedAt(new Date());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('stayTransport.admin.loadError', 'Could not load requests.'),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isAdmin) return;
    const first = window.setTimeout(() => void load(), 0);
    const timer = window.setInterval(() => void load(), REFRESH_MS);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, [isAdmin, load]);

  const counts = useMemo(
    () => ({
      all: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      confirmed: requests.filter((r) => r.status === 'confirmed').length,
      cancelled: requests.filter((r) => r.status === 'cancelled').length,
    }),
    [requests],
  );
  const visible = requests.filter((r) => filter === 'all' || r.status === filter);

  const setStatus = async (id: string, status: 'confirmed' | 'cancelled', note: string) => {
    setBusyId(id);
    try {
      const updated = await services.adminBookings.setStatus(id, status, note.trim() || undefined);
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('stayTransport.admin.loadError', 'Could not load requests.'),
      );
    } finally {
      setBusyId(null);
    }
  };

  const tabs: Array<{ id: Filter; label: string; count: number }> = [
    { id: 'pending', label: t('stayTransport.admin.pending', 'New'), count: counts.pending },
    {
      id: 'confirmed',
      label: t('stayTransport.admin.confirmed', 'Confirmed'),
      count: counts.confirmed,
    },
    {
      id: 'cancelled',
      label: t('stayTransport.admin.cancelled', 'Cancelled'),
      count: counts.cancelled,
    },
    { id: 'all', label: t('stayTransport.admin.all', 'All'), count: counts.all },
  ];

  return (
    <Section>
      <Container>
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#070a12] p-5 text-white shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)] ring-1 ring-white/10 md:p-8">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(600px_280px_at_80%_0%,rgba(255,170,80,0.14),transparent_70%)]" />

          {!isAdmin ? (
            <div className="py-10 text-center">
              <h1 className="text-2xl font-semibold">
                {t('stayTransport.admin.title', 'Booking requests')}
              </h1>
              <p className="mt-3 text-white/60">
                {t('stayTransport.admin.notAdmin', 'This page is for the site operator only.')}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <span className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#ffb25a]">
                    <span className="h-px w-10 bg-[#ffb25a]" />
                    {t('stayTransport.admin.eyebrow', 'Operator')}
                  </span>
                  <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
                    {t('stayTransport.admin.title', 'Booking requests')}
                  </h1>
                  <p className="max-w-xl text-sm text-white/60">
                    {t(
                      'stayTransport.admin.subtitle',
                      'New requests appear here. Confirm or decline each one and add a note for the customer.',
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {updatedAt ? (
                    <span className="text-xs text-white/45">
                      {t('stayTransport.admin.updated', {
                        time: updatedAt.toLocaleTimeString(i18n.language, { timeStyle: 'short' }),
                        defaultValue: 'Updated {{time}}',
                      })}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void load()}
                    className={`${pill} bg-white text-[#0a0e17] hover:bg-[#ffb25a]`}
                  >
                    {t('stayTransport.admin.refresh', 'Refresh')}
                  </button>
                </div>
              </div>

              <div className="mb-5 flex gap-2 overflow-x-auto pb-1" role="tablist">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={filter === tab.id}
                    onClick={() => setFilter(tab.id)}
                    className={`${pill} flex items-center gap-2 ring-1 ${
                      filter === tab.id
                        ? 'bg-white/10 text-white ring-[#ffb25a]/60'
                        : 'text-white/60 ring-white/10 hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        tab.id === 'pending' && tab.count > 0
                          ? 'bg-[#ffb25a] text-[#0a0e17]'
                          : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {error ? (
                <p
                  role="alert"
                  className="mb-4 rounded-2xl bg-rose-400/10 px-4 py-3 text-sm text-rose-300"
                >
                  {error}
                </p>
              ) : null}

              {loading ? (
                <p className="py-10 text-center text-white/50">…</p>
              ) : visible.length === 0 ? (
                <p className="py-10 text-center text-white/50">
                  {t('stayTransport.admin.empty', 'No requests here yet.')}
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {visible.map((req) => (
                    <RequestCard
                      key={req.id}
                      req={req}
                      busy={busyId === req.id}
                      onSetStatus={setStatus}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Container>
    </Section>
  );
}
