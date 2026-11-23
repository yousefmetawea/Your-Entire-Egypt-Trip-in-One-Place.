import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AirportTransferDetails, Trip } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export interface TransferRequestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (details: AirportTransferDetails) => Promise<void>;
  trip: Trip | null;
  defaultPickup?: string;
}

export function TransferRequestModal({
  open,
  onClose,
  onSubmit,
  trip,
  defaultPickup = 'Cairo International Airport',
}: TransferRequestModalProps) {
  const { t } = useTranslation();

  const [direction, setDirection] = useState<'from-airport' | 'to-airport'>('from-airport');
  const [date, setDate] = useState(trip?.startDate || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('12:00');
  const [passengers, setPassengers] = useState(trip?.travelers || 2);
  const [flightNumber, setFlightNumber] = useState('');
  const [location, setLocation] = useState(defaultPickup);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      setError('Please provide date and time for the transfer.');
      return;
    }

    setLoading(true);
    setError(null);

    const details: AirportTransferDetails = {
      pickupLocation: direction === 'from-airport' ? 'Cairo International Airport' : location,
      dropoffLocation: direction === 'from-airport' ? location : 'Cairo International Airport',
      date,
      time,
      passengers: Number(passengers),
      ...(flightNumber ? { flightNumber } : {}),
      ...(notes ? { notes } : {}),
    };

    try {
      await onSubmit(details);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit transfer request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('stayTransport.requestModal.title', 'Request Airport Chauffeur Transfer')}
      description={t(
        'stayTransport.requestModal.desc',
        'Enter your flight and transfer details. This creates a pending request.',
      )}
      closeLabel={t('common.close', 'Close')}
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-space-md pt-space-xs">
        {/* Direction Switch */}
        <div className="flex flex-col gap-space-xs">
          <label className="type-label-sm font-semibold text-primary">Transfer Direction</label>
          <div className="grid grid-cols-2 gap-space-xs">
            <button
              type="button"
              className={`rounded-xl py-space-xs px-space-sm type-label-sm border transition-colors ${
                direction === 'from-airport'
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface-container-low text-on-surface-variant border-hairline'
              }`}
              onClick={() => {
                setDirection('from-airport');
                setLocation(defaultPickup);
              }}
            >
              From Airport to Stay
            </button>
            <button
              type="button"
              className={`rounded-xl py-space-xs px-space-sm type-label-sm border transition-colors ${
                direction === 'to-airport'
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface-container-low text-on-surface-variant border-hairline'
              }`}
              onClick={() => {
                setDirection('to-airport');
                setLocation(defaultPickup);
              }}
            >
              From Stay to Airport
            </button>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-space-sm">
          <Input
            id="transfer-date"
            label="Date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input
            id="transfer-time"
            label="Time"
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        {/* Passengers & Flight */}
        <div className="grid grid-cols-2 gap-space-sm">
          <Input
            id="transfer-passengers"
            label="Passengers"
            type="number"
            min={1}
            max={8}
            required
            value={passengers}
            onChange={(e) => setPassengers(Number(e.target.value))}
          />
          <Input
            id="transfer-flight"
            label="Flight No. (Optional)"
            placeholder="e.g. MS 777"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
          />
        </div>

        {/* Stay Location */}
        <Input
          id="transfer-location"
          label={direction === 'from-airport' ? 'Drop-off Accommodation' : 'Pickup Accommodation'}
          required
          placeholder="Accommodation name or address"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        {/* Notes */}
        <Input
          id="transfer-notes"
          label="Notes / Special Instructions (Optional)"
          placeholder="e.g. Extra luggage or child booster seat"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {/* Honesty Disclosure */}
        <div className="rounded-xl border border-secondary/30 bg-secondary-fixed/20 p-space-sm">
          <p className="type-small text-on-secondary-fixed-variant">
            <strong>Notice:</strong> This is an internal booking request, not an instant
            confirmation. A provider must review and confirm the transfer before it is finalized.
          </p>
        </div>

        {error ? <p className="type-small text-error">{error}</p> : null}

        <div className="flex justify-end gap-space-xs pt-space-xs">
          <Button variant="secondary" size="md" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" disabled={loading}>
            {loading ? 'Submitting…' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
