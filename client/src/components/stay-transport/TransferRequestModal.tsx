import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AirportTransferDetails, BookingContact, BookingRequest, Trip } from '../../types';
import { useAuth } from '../../context/useAuth';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export interface TransferRequestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (details: AirportTransferDetails, contact: BookingContact) => Promise<BookingRequest>;
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
  const { user } = useAuth();

  const [direction, setDirection] = useState<'from-airport' | 'to-airport'>('from-airport');
  const [date, setDate] = useState(trip?.startDate || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('12:00');
  const [passengers, setPassengers] = useState(trip?.travelers || 2);
  const [flightNumber, setFlightNumber] = useState('');
  const [location, setLocation] = useState(defaultPickup);
  const [notes, setNotes] = useState('');
  const [contactName, setContactName] = useState(user?.name ?? '');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email ?? '');
  const [submitted, setSubmitted] = useState<BookingRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      setError('Please provide date and time for the transfer.');
      return;
    }

    if (contactName.trim().length < 2) {
      setError(t('stayTransport.booking.errName', 'Please enter your name.'));
      return;
    }
    if (!/^\+?[0-9 ()-]{7,20}$/.test(contactPhone.trim())) {
      setError(t('stayTransport.booking.errPhone', 'Please enter a valid phone number.'));
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
      const created = await onSubmit(details, {
        name: contactName.trim(),
        phone: contactPhone.trim(),
        ...(contactEmail.trim() ? { email: contactEmail.trim() } : {}),
      });
      setSubmitted(created);
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
      description={
        submitted
          ? undefined
          : t(
              'stayTransport.requestModal.desc',
              'Enter your flight and transfer details. This creates a pending request.',
            )
      }
      closeLabel={t('common.close', 'Close')}
      size="md"
    >
      {submitted ? (
        <div className="flex flex-col items-center gap-space-sm py-space-md text-center">
          <h3 className="type-card-title text-primary">
            {t('stayTransport.booking.received', 'Request received')}
          </h3>
          <p className="type-small text-on-surface-variant">
            {t('stayTransport.booking.receivedBody', {
              phone: `\u2066${submitted.contact?.phone ?? ''}\u2069`,
              defaultValue: 'We will contact you on {{phone}} to confirm the details.',
            })}
          </p>
          <div className="rounded-2xl border border-hairline-strong px-space-lg py-space-sm">
            <p className="type-label-sm text-on-surface-variant">
              {t('stayTransport.booking.reference', 'Reference')}
            </p>
            <p className="font-mono text-2xl font-semibold tracking-widest text-primary" dir="ltr">
              {submitted.referenceCode}
            </p>
          </div>
          <p className="type-small text-on-surface-variant">
            {t(
              'stayTransport.booking.keepCode',
              'Keep this code. You can quote it when we get in touch.',
            )}
          </p>
          <Button variant="primary" size="md" type="button" onClick={onClose}>
            {t('stayTransport.booking.done', 'Done')}
          </Button>
        </div>
      ) : (
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

          {/* Contact */}
          <p className="type-label-sm font-semibold text-primary">
            {t('stayTransport.booking.contactTitle', 'Your contact details')}
          </p>
          <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2">
            <Input
              id="transfer-contact-name"
              label={t('stayTransport.booking.name', 'Full name')}
              placeholder={t('stayTransport.booking.namePlaceholder', 'Your name')}
              autoComplete="name"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
            <Input
              id="transfer-contact-phone"
              label={t('stayTransport.booking.phone', 'Phone / WhatsApp')}
              placeholder={t('stayTransport.booking.phonePlaceholder', '+20 100 000 0000')}
              type="tel"
              dir="ltr"
              autoComplete="tel"
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>
          <Input
            id="transfer-contact-email"
            label={t('stayTransport.booking.email', 'Email (optional)')}
            type="email"
            dir="ltr"
            autoComplete="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />

          {/* Honesty Disclosure */}
          <div className="rounded-xl border border-secondary/30 bg-secondary-fixed/20 p-space-sm">
            <p className="type-small text-on-secondary-fixed-variant">
              {t(
                'stayTransport.booking.notice',
                'This is a request, not an instant booking. We review it and contact you to confirm before anything is final.',
              )}
            </p>
          </div>

          {error ? <p className="type-small text-error">{error}</p> : null}

          <div className="flex justify-end gap-space-xs pt-space-xs">
            <Button variant="secondary" size="md" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" disabled={loading}>
              {loading ? 'Submitting…' : 'Send request'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
