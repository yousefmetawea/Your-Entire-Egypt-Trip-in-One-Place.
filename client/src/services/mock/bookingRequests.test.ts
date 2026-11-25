import { describe, expect, it } from 'vitest';
import { createMockServices } from './createMockServices';
import { createMemoryStorage } from './storage';

function createServices() {
  return createMockServices({
    latencyMs: 0,
    storage: createMemoryStorage(),
  });
}

const contact = { name: 'Sara Ali', phone: '+20 100 123 4567' };
const details = {
  pickupLocation: 'Cairo International Airport',
  dropoffLocation: 'The Grand Citadel Retreat',
  date: '2026-12-01',
  time: '14:30',
  passengers: 2,
};

describe('BookingRequestService status transitions', () => {
  it('creates a request with a reference code, contact and pending status', async () => {
    const services = createServices();
    const req = await services.bookingRequests.create({
      kind: 'airport-transfer',
      contact,
      details: { ...details, flightNumber: 'MS 777' },
    });

    expect(req.status).toBe('pending');
    expect(req.referenceCode).toMatch(/^EG-[A-Z0-9]{6}$/);
    expect(req.contact.phone).toBe(contact.phone);
    expect(req.statusHistory).toHaveLength(1);
    expect(req.statusHistory[0].status).toBe('pending');
  });

  it('allows cancelling a pending request and updates history', async () => {
    const services = createServices();
    const req = await services.bookingRequests.create({
      kind: 'airport-transfer',
      contact,
      details,
    });

    const cancelled = await services.bookingRequests.cancel(req.id);
    expect(cancelled.status).toBe('cancelled');
    expect(cancelled.statusHistory).toHaveLength(2);
    expect(cancelled.statusHistory[1].status).toBe('cancelled');

    await expect(services.bookingRequests.cancel(req.id)).rejects.toThrow();
  });

  it('lets the operator confirm a pending request with a note', async () => {
    const services = createServices();
    const req = await services.bookingRequests.create({
      kind: 'airport-transfer',
      contact,
      details,
    });

    const pending = await services.adminBookings.list('pending');
    expect(pending.map((r) => r.id)).toContain(req.id);

    const confirmed = await services.adminBookings.setStatus(
      req.id,
      'confirmed',
      'Driver at arrivals',
    );
    expect(confirmed.status).toBe('confirmed');
    expect(confirmed.statusHistory).toHaveLength(2);
    expect(confirmed.statusHistory[1].note).toContain('Driver at arrivals');

    // A confirmed request cannot be confirmed again or cancelled by the customer.
    await expect(services.adminBookings.setStatus(req.id, 'confirmed')).rejects.toThrow();
    await expect(services.bookingRequests.cancel(req.id)).rejects.toThrow();
  });

  it('lets the operator decline a pending request', async () => {
    const services = createServices();
    const req = await services.bookingRequests.create({
      kind: 'airport-transfer',
      contact,
      details,
    });
    const declined = await services.adminBookings.setStatus(req.id, 'cancelled', 'No driver');
    expect(declined.status).toBe('cancelled');
    expect(declined.statusHistory[1].note).toContain('Declined');
  });
});
