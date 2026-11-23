import { useState } from 'react';
import { Link } from 'react-router';
import type { BookingRequest } from '../../types';
import { formatIsoDate } from '../../lib/date';
import { Card } from '../ui/Card';
import { RequestStatusChip } from '../stay-transport/RequestStatusChip';
import { StatusTimeline } from '../stay-transport/StatusTimeline';

export interface DashboardRequestsProps {
  requests: BookingRequest[];
  onCancelRequest: (requestId: string) => void;
  onSimulateConfirmRequest?: (requestId: string) => void;
  actionLoading?: boolean;
}

const showDemoActions = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_ACTIONS === 'true';

export function DashboardRequests({
  requests,
  onCancelRequest,
  onSimulateConfirmRequest,
  actionLoading = false,
}: DashboardRequestsProps) {
  const [expandedTimelineId, setExpandedTimelineId] = useState<string | null>(null);

  const transferRequests = requests.filter((r) => r.kind === 'airport-transfer');

  return (
    <Card
      variant="surface"
      className="flex flex-col gap-space-sm p-space-md sm:p-space-lg rounded-[20px] border border-hairline/60"
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="type-label-sm uppercase tracking-widest text-secondary font-semibold">
            Transportation
          </span>
          <h3 className="font-serif text-xl text-primary font-medium mt-0.5">Transfer Requests</h3>
        </div>

        <Link
          to="/stay-transport?tab=transportation"
          className="type-label-sm text-xs text-secondary hover:text-primary transition-colors underline"
        >
          {transferRequests.length > 0 ? 'Request Transfer' : 'Book Transfers'}
        </Link>
      </div>

      <p className="type-body text-xs text-on-surface-variant">
        Internal requests are managed with local partners. They remain pending until confirmed.
      </p>

      {transferRequests.length === 0 ? (
        <div className="py-space-lg text-center flex flex-col items-center justify-center gap-space-xs bg-surface-container-low rounded-xl p-space-md">
          <p className="type-body text-xs text-on-surface-variant max-w-sm">
            No transfer requests have been scheduled for this trip.
          </p>
          <Link
            to="/stay-transport?tab=transportation"
            className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-secondary hover:bg-secondary-fixed hover:text-on-secondary-fixed text-on-secondary type-label text-xs font-medium transition-all shadow-xs mt-1"
          >
            Schedule Airport Chauffeur
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-space-sm">
          {transferRequests.map((request) => {
            const isPending = request.status === 'pending';
            const details = request.details;
            const isTimelineOpen = expandedTimelineId === request.id;

            return (
              <div
                key={request.id}
                className="flex flex-col gap-space-xs p-space-md rounded-xl bg-surface-container-low/80 border border-hairline/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-space-xs">
                  <div>
                    <span className="type-label-sm uppercase tracking-wider text-secondary font-semibold text-[10px]">
                      Cairo Airport Chauffeur Transfer
                    </span>
                    <h4 className="type-title text-sm text-primary font-semibold mt-0.5">
                      {details.pickupLocation} &rarr; {details.dropoffLocation}
                    </h4>
                    <p className="type-small text-on-surface-variant">
                      {formatIsoDate(details.date)} at {details.time} · {details.passengers}{' '}
                      {details.passengers === 1 ? 'Passenger' : 'Passengers'}
                      {details.flightNumber ? ` · Flight: ${details.flightNumber}` : ''}
                    </p>
                  </div>

                  <RequestStatusChip status={request.status} size="sm" />
                </div>

                {details.notes && (
                  <p className="type-small text-on-surface-variant italic bg-surface p-2 rounded">
                    Notes: {details.notes}
                  </p>
                )}

                {/* Actions & Timeline Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-space-xs pt-space-xs border-t border-hairline/40">
                  <button
                    type="button"
                    onClick={() => setExpandedTimelineId(isTimelineOpen ? null : request.id)}
                    className="type-label-sm text-xs text-secondary hover:underline"
                  >
                    {isTimelineOpen
                      ? 'Hide History ▲'
                      : `View Status Log (${request.statusHistory.length}) ▼`}
                  </button>

                  <div className="flex items-center gap-space-xs">
                    {/* Cancellation action if pending */}
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => onCancelRequest(request.id)}
                        disabled={actionLoading}
                        className="px-2.5 py-1 rounded-full bg-danger/10 text-danger hover:bg-danger/20 type-label-sm text-xs transition-colors"
                      >
                        Cancel Request
                      </button>
                    )}

                    {/* Simulation action behind dev flag */}
                    {showDemoActions && isPending && onSimulateConfirmRequest && (
                      <button
                        type="button"
                        onClick={() => onSimulateConfirmRequest(request.id)}
                        disabled={actionLoading}
                        className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant hover:text-primary type-label-sm text-[11px] transition-colors border border-hairline"
                      >
                        Simulate Confirmation
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Timeline */}
                {isTimelineOpen && (
                  <div className="pt-space-xs">
                    <StatusTimeline history={request.statusHistory} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
