import { describe, expect, it } from 'vitest';
import type { OpeningHours, Weekday } from '../types';
import {
  formatMoney,
  formatPriceQuote,
  formatTime,
  formatUpdatedDate,
  getOpeningHoursRows,
  normalizeTime,
  summarizeOpeningHours,
  toParagraphs,
  truncateText,
} from './placeDetails';

const WEEKDAYS: readonly Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

function dailyHours(opens = '09:00', closes = '17:00'): OpeningHours[] {
  return WEEKDAYS.map((day) => ({ day, opens, closes }));
}

describe('place details helpers', () => {
  it('normalizes and formats 24-hour times', () => {
    expect(normalizeTime('09:00')).toBe('09:00');
    expect(normalizeTime(' 23:59 ')).toBe('23:59');
    expect(normalizeTime('24:00')).toBeNull();
    expect(normalizeTime('9:00')).toBeNull();
    expect(normalizeTime(null)).toBeNull();

    expect(formatTime('09:00')).toBe('9:00 AM');
    expect(formatTime('13:05')).toBe('1:05 PM');
    expect(formatTime('not-a-time')).toBeNull();
  });

  it('formats stored price quotes without converting currency', () => {
    expect(
      formatPriceQuote({
        amount: 1250,
        currency: 'EGP',
        isEstimated: true,
        priceUpdatedAt: '2026-11-01',
      }),
    ).toMatch(/^EGP\s1,250$/);
    expect(formatMoney({ amount: 1250, currency: 'EGP' })).toMatch(/^EGP\s1,250$/);
  });

  it('formats valid update dates and ignores invalid values', () => {
    expect(formatUpdatedDate('2026-11-01')).toBe('1 Nov 2026');
    expect(formatUpdatedDate('2026-02-30')).toBeNull();
    expect(formatUpdatedDate(null)).toBeNull();
  });

  it('splits text into trimmed paragraphs', () => {
    expect(toParagraphs('First line.\r\n\r\nSecond\tline.\n\n\nThird.')).toEqual([
      'First line.',
      'Second\tline.',
      'Third.',
    ]);
    expect(toParagraphs('   ')).toEqual([]);
    expect(toParagraphs(null)).toEqual([]);
  });

  it('truncates text at a word boundary when possible', () => {
    expect(truncateText('Short text', 20)).toBe('Short text');
    expect(truncateText('The quick brown fox jumps', 20)).toBe('The quick brown…');
    expect(truncateText('Anything', 0)).toBe('');
    expect(truncateText('   ', 10)).toBe('');
  });

  it('builds weekly rows in calendar order and marks partial data honestly', () => {
    const rows = getOpeningHoursRows([
      { day: 'monday', opens: '09:00', closes: '17:00' },
      { day: 'tuesday', opens: '', closes: '17:00' },
      { day: 'wednesday', opens: '09:00', closes: '17:00', closed: true },
      { day: 'monday', opens: '10:00', closes: '18:00' },
    ]);

    expect(rows.map((row) => row.day)).toEqual(['monday', 'tuesday', 'wednesday']);
    expect(rows[0]).toMatchObject({ state: 'open', opens: '09:00', closes: '17:00' });
    expect(rows[1]).toMatchObject({ state: 'unknown', opens: null, closes: '17:00' });
    expect(rows[2]).toMatchObject({ state: 'closed' });
    expect(getOpeningHoursRows(null)).toEqual([]);
  });

  it('summarizes only complete daily hours', () => {
    expect(summarizeOpeningHours(getOpeningHoursRows(dailyHours()))).toEqual({
      kind: 'daily',
      opens: '09:00',
      closes: '17:00',
    });

    expect(
      summarizeOpeningHours(
        getOpeningHoursRows([
          { day: 'monday', opens: '09:00', closes: '17:00' },
          { day: 'tuesday', opens: '09:00', closes: '17:00' },
        ]),
      ),
    ).toEqual({ kind: 'partial', count: 2 });

    const varied = dailyHours().map((entry) =>
      entry.day === 'friday' ? { ...entry, closed: true } : entry,
    );
    expect(summarizeOpeningHours(getOpeningHoursRows(varied))).toEqual({ kind: 'weekly' });
    expect(summarizeOpeningHours([])).toBeNull();
  });
});
