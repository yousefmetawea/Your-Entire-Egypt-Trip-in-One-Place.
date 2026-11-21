import { describe, expect, it } from 'vitest';
import { enumerateDates, isIsoDate } from './date';

describe('date helpers', () => {
  it('accepts valid ISO calendar dates only', () => {
    expect(isIsoDate('2024-02-29')).toBe(true);
    expect(isIsoDate('2026-02-29')).toBe(false);
    expect(isIsoDate('2026-12-01')).toBe(true);
    expect(isIsoDate('2026-13-01')).toBe(false);
    expect(isIsoDate('01-12-2026')).toBe(false);
  });

  it('enumerates inclusive date ranges across month boundaries', () => {
    expect(enumerateDates('2026-12-30', '2027-01-02')).toEqual([
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
      '2027-01-02',
    ]);
  });

  it('rejects invalid or reversed ranges', () => {
    expect(() => enumerateDates('2026-12-03', '2026-12-01')).toThrow(RangeError);
    expect(() => enumerateDates('2026-12-01', 'not-a-date')).toThrow(RangeError);
  });
});
