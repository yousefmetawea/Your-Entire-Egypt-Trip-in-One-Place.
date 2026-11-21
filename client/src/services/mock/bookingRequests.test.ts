import { describe, expect, it } from 'vitest';
import { createMockServices } from './createMockServices';
import { createMemoryStorage } from './storage';

function createServices() {
  return createMockServices({
    latencyMs: 0,
    storage: createMemoryStorage(),
  });
}

describe('mock booking request service', () => {
  it('creates a pending demo request with status history', async () => {
    const services = createServices();
    const request = await services.bookingRequests.create({
      kind: 'guided-tour',
      details: {
        placeId: 'place_cairo_tower',
        date: '2026-12-02',
        time: '10:30',
        groupSize: 2,
      },
    });

    expect(request.kind).toBe('guided-tour');
    expect(request.status).toBe('pending');
    expect(request.isDemo).toBe(true);
    expect(request.statusHistory).toEqual([{ status: 'pending', changedAt: expect.any(String) }]);

    const mine = await services.bookingRequests.listMine();
    expect(mine.map((item) => item.id)).toContain(request.id);
  });

  it('rejects unknown places and invalid booking details', async () => {
    const services = createServices();

    await expect(
      services.bookingRequests.create({
        kind: 'guided-tour',
        details: {
          placeId: 'place_unknown',
          date: '2026-12-02',
          time: '10:30',
          groupSize: 2,
        },
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });

    await expect(
      services.bookingRequests.create({
        kind: 'airport-transfer',
        details: {
          pickupLocation: '',
          dropoffLocation: 'Zamalek',
          date: '2026-12-02',
          time: '25:00',
          passengers: 2,
        },
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION' });
  });
});
