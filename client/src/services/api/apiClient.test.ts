import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './apiClient';
import { ServiceError } from '../errors';

describe('API Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('normalizes 404 response to ServiceError with NOT_FOUND code', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: { message: 'Place not found' } }),
    });

    await expect(apiClient('/places/non-existent')).rejects.toThrow(ServiceError);
    await expect(apiClient('/places/non-existent')).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'Place not found',
    });
  });

  it('normalizes 400 validation response to ServiceError with VALIDATION code', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: 'Invalid coordinates' } }),
    });

    await expect(apiClient('/trips', { method: 'POST' })).rejects.toMatchObject({
      code: 'VALIDATION',
      message: 'Invalid coordinates',
    });
  });

  it('handles network failure and returns UNAVAILABLE error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

    await expect(apiClient('/places')).rejects.toMatchObject({
      code: 'UNAVAILABLE',
      message: 'Failed to fetch',
    });
  });
});
