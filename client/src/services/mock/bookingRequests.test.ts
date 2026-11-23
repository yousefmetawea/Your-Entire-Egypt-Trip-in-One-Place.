import { describe, expect, it } from 'vitest';
import { createMockServices } from './createMockServices';
import { createMemoryStorage } from './storage';

function createServices() {
  return createMockServices({
    latencyMs: 0,
    storage: createMemoryStorage(),
  });
}

describe('BookingRequestService status transitions', () => {
  it('creates an airport transfer request in pending status', async () => {
    const services = createServices();
    const req = await services.bookingRequests.create({
      kind: 'airport-transfer',
      details: {
        pickupLocation: 'Cairo International Airport',
        dropoffLocation: 'The Grand Citadel Retreat',
        date: '2026-12-01',
        time: '14:30',
        passengers: 2,
        flightNumber: 'MS 777',
      },
    });

    expect(req.status).toBe('pending');
    expect(req.statusHistory).toHaveLength(1);
    expect(req.statusHistory[0].status).toBe('pending');
    expect(req.isDemo).toBe(true);
  });

  it('allows cancelling a pending request and updates history', async () => {
    const services = createServices();
    const req = await services.bookingRequests.create({
      kind: 'airport-transfer',
      details: {
        pickupLocation: 'Cairo International Airport',
        dropoffLocation: 'The Grand Citadel Retreat',
        date: '2026-12-01',
        time: '14:30',
        passengers: 2,
      },
    });

    const cancelled = await services.bookingRequests.cancel(req.id);
    expect(cancelled.status).toBe('cancelled');
    expect(cancelled.statusHistory).toHaveLength(2);
    expect(cancelled.statusHistory[1].status).toBe('cancelled');

    // Cancelling an already cancelled request should be rejected
    await expect(services.bookingRequests.cancel(req.id)).rejects.toThrow();
  });

  it('allows simulating confirmation on a pending request and updates history', async () => {
    const services = createServices();
    const req = await services.bookingRequests.create({
      kind: 'airport-transfer',
      details: {
        pickupLocation: 'Cairo International Airport',
        dropoffLocation: 'The Grand Citadel Retreat',
        date: '2026-12-01',
        time: '14:30',
        passengers: 2,
      },
    });

    const confirmed = await services.bookingRequests.simulateConfirm(req.id);
    expect(confirmed.status).toBe('confirmed');
    expect(confirmed.statusHistory).toHaveLength(2);
    expect(confirmed.statusHistory[1].status).toBe('confirmed');
    expect(confirmed.statusHistory[1].note).toContain('Simulated');

    // Simulating confirmation on an already confirmed request should be rejected
    await expect(services.bookingRequests.simulateConfirm(req.id)).rejects.toThrow();

    // Cancelling a confirmed request should be rejected
    await expect(services.bookingRequests.cancel(req.id)).rejects.toThrow();
  });
});
