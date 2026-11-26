import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { BookingRequest } from '../../types';
import { cn } from '../../lib/cn';
import { fmtDate } from '../../lib/mytrip/format';
import { RequestStatusChip } from '../stay-transport/RequestStatusChip';
import { StatusTimeline } from '../stay-transport/StatusTimeline';
import { ArrowRightIcon, CarIcon, ChevronDownIcon } from '../ui/icons';
import { SectionHeading } from './shared';

function TransferCard({
  request,
  onCancel,
  busy,
}: {
  request: Extract<BookingRequest, { kind: 'airport-transfer' }>;
  onCancel: (id: string) => void;
  busy: boolean;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const d = request.details;
  const panelId = `transfer-${request.id}`;

  return (
    <li
      className={cn(
        'rounded-3xl bg-white p-6 sm:p-8',
        request.status === 'cancelled' && 'opacity-70',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-(--yt-ink-2) uppercase">
            <CarIcon className="size-4" />
            {t('myTrip.transport.service')}
            {request.referenceCode ? (
              <span className="text-(--yt-green)">· {request.referenceCode}</span>
            ) : null}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-display text-2xl leading-snug font-medium sm:text-3xl">
            <span>{d.pickupLocation}</span>
            <ArrowRightIcon
              aria-hidden="true"
              className="size-6 shrink-0 text-(--yt-ink-2) rtl:rotate-180"
            />
            <span>{d.dropoffLocation}</span>
          </div>
        </div>
        <motion.div
          key={request.status}
          initial={reduce ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
        >
          <RequestStatusChip status={request.status} />
        </motion.div>
      </div>

      <dl className="mt-6 grid gap-x-8 gap-y-4 border-t border-(--yt-green)/10 pt-5 sm:grid-cols-3">
        <div>
          <dt className="text-[0.68rem] font-semibold tracking-[0.2em] text-(--yt-ink-2) uppercase">
            {t('myTrip.transport.when')}
          </dt>
          <dd className="mt-1 font-medium">
            {fmtDate(d.date, lang)} · {d.time}
          </dd>
        </div>
        <div>
          <dt className="text-[0.68rem] font-semibold tracking-[0.2em] text-(--yt-ink-2) uppercase">
            {t('myTrip.transport.passengers')}
          </dt>
          <dd className="mt-1 font-medium">
            {t('myTrip.hero.guestsValue', { count: d.passengers })}
          </dd>
        </div>
        {d.flightNumber ? (
          <div>
            <dt className="text-[0.68rem] font-semibold tracking-[0.2em] text-(--yt-ink-2) uppercase">
              {t('myTrip.transport.flight')}
            </dt>
            <dd className="mt-1 font-medium">
              <bdi>{d.flightNumber}</bdi>
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={panelId}
          className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold"
        >
          {open
            ? t('myTrip.transport.hideLog')
            : t('myTrip.transport.showLog', { count: request.statusHistory.length })}
          <ChevronDownIcon
            className={cn('size-4 transition-transform duration-300', open && 'rotate-180')}
          />
        </button>
        {request.status === 'pending' ? (
          <button
            type="button"
            onClick={() => onCancel(request.id)}
            disabled={busy}
            className="cursor-pointer rounded-full border border-danger/40 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
          >
            {t('myTrip.transport.cancel')}
          </button>
        ) : null}
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              {d.notes ? (
                <p className="mb-3 rounded-2xl bg-(--yt-ivory) p-4 text-sm italic">{d.notes}</p>
              ) : null}
              <StatusTimeline history={request.statusHistory} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

export function TransportSection({
  requests,
  onCancelRequest,
  actionLoading,
}: {
  requests: BookingRequest[];
  onCancelRequest: (id: string) => void;
  actionLoading: boolean;
}) {
  const { t } = useTranslation();
  const transfers = requests.filter(
    (r): r is Extract<BookingRequest, { kind: 'airport-transfer' }> =>
      r.kind === 'airport-transfer',
  );

  return (
    <section aria-labelledby="mt-transport-heading" className="bg-(--yt-sage) py-20 md:py-28">
      <div className="mx-auto w-full max-w-page px-gutter-sm md:px-margin-md lg:px-margin-lg">
        <SectionHeading
          id="mt-transport-heading"
          eyebrow={t('myTrip.transport.eyebrow')}
          title={t('myTrip.transport.title')}
          aside={
            <Link
              to="/stay-transport?tab=transportation"
              className="inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
            >
              {transfers.length > 0 ? t('myTrip.transport.request') : t('myTrip.transport.book')}
              <ArrowRightIcon className="size-4 rtl:rotate-180" />
            </Link>
          }
        />
        <p className="mt-4 max-w-2xl text-(--yt-ink-2)">{t('myTrip.transport.note')}</p>
        {transfers.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border border-dashed border-(--yt-green)/30 p-10 text-center">
            <CarIcon className="mx-auto size-8 text-(--yt-ink-2)" />
            <p className="mt-3 text-(--yt-ink-2)">{t('myTrip.transport.none')}</p>
            <Link
              to="/stay-transport?tab=transportation"
              className="mt-5 inline-flex h-12 items-center rounded-full bg-(--yt-green) px-7 text-sm font-semibold text-(--yt-on-dark)"
            >
              {t('myTrip.transport.schedule')}
            </Link>
          </div>
        ) : (
          <ul className="mt-10 space-y-5">
            {transfers.map((r) => (
              <TransferCard
                key={r.id}
                request={r}
                onCancel={onCancelRequest}
                busy={actionLoading}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
