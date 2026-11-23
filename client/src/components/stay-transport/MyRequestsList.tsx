import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { BookingRequest } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { RequestStatusChip } from './RequestStatusChip';
import { StatusTimeline } from './StatusTimeline';
import { ChevronDownIcon, ChevronUpIcon } from '../ui/icons';

export interface MyRequestsListProps {
  requests: BookingRequest[];
  onCancelRequest: (id: string) => Promise<void>;
  onSimulateConfirm: (id: string) => Promise<void>;
}

export function MyRequestsList({
  requests,
  onCancelRequest,
  onSimulateConfirm,
}: MyRequestsListProps) {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const isDemoSimulationAllowed =
    import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_ACTIONS === 'true';

  if (!requests || requests.length === 0) {
    return null;
  }

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleCancel = async (id: string) => {
    setActionLoadingId(id);
    try {
      await onCancelRequest(id);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirm = async (id: string) => {
    setActionLoadingId(id);
    try {
      await onSimulateConfirm(id);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-space-md mt-space-xl">
      <div className="flex items-center justify-between">
        <h3 className="type-card-title text-primary">
          {t('stayTransport.requests.heading', 'Your Transfer Requests')}
        </h3>
        <span className="type-label-sm text-on-surface-variant">
          {requests.length} {requests.length === 1 ? 'request' : 'requests'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-space-sm">
        {requests.map((req) => {
          const isPending = req.status === 'pending';
          const isExpanded = expandedId === req.id;
          const isLoading = actionLoadingId === req.id;
          const details = req.kind === 'airport-transfer' ? req.details : null;

          return (
            <Card
              key={req.id}
              variant="surface"
              padding="md"
              className="flex flex-col gap-space-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-xs flex-wrap">
                  <RequestStatusChip status={req.status} size="sm" />
                  <span className="type-title-sm font-semibold text-primary">
                    {req.kind === 'airport-transfer' ? 'Airport Chauffeur Transfer' : 'Guided Tour'}
                  </span>
                  {details ? (
                    <span className="type-small text-on-surface-variant">
                      · {details.date} at {details.time}
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-space-xs self-end sm:self-auto">
                  {isPending ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isLoading}
                      onClick={() => handleCancel(req.id)}
                      className="text-error hover:bg-error-container/20"
                    >
                      {t('stayTransport.requests.cancel', 'Cancel request')}
                    </Button>
                  ) : null}

                  {isPending && isDemoSimulationAllowed ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={isLoading}
                      onClick={() => handleConfirm(req.id)}
                      title="Simulates confirmation without real backend"
                    >
                      {t('stayTransport.requests.simulateConfirm', 'Simulate Confirmation')}
                    </Button>
                  ) : null}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(req.id)}
                    aria-label={isExpanded ? 'Collapse audit timeline' : 'Expand audit timeline'}
                  >
                    {isExpanded ? (
                      <ChevronUpIcon className="size-4" />
                    ) : (
                      <ChevronDownIcon className="size-4" />
                    )}
                  </Button>
                </div>
              </div>

              {details ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-space-xs type-small text-on-surface-variant pt-space-xs border-t border-hairline">
                  <div>
                    <span className="font-semibold text-primary">Pickup: </span>
                    {details.pickupLocation}
                  </div>
                  <div>
                    <span className="font-semibold text-primary">Drop-off: </span>
                    {details.dropoffLocation}
                  </div>
                  <div>
                    <span className="font-semibold text-primary">Passengers: </span>
                    {details.passengers}
                  </div>
                  {details.flightNumber ? (
                    <div>
                      <span className="font-semibold text-primary">Flight: </span>
                      {details.flightNumber}
                    </div>
                  ) : null}
                  {details.notes ? (
                    <div className="col-span-full">
                      <span className="font-semibold text-primary">Notes: </span>
                      {details.notes}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {isExpanded ? (
                <div className="pt-space-xs border-t border-hairline">
                  <p className="type-label-sm text-secondary font-semibold">
                    Status Audit Timeline
                  </p>
                  <StatusTimeline history={req.statusHistory} />
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
