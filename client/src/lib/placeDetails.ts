import type { CurrencyCode, Money, OpeningHours, PriceQuote, Weekday } from '../types';
import { formatIsoDate } from './date';

const WEEKDAYS: readonly Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const timeFormatter = new Intl.DateTimeFormat('en', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'UTC',
});

const priceFormatters = new Map<CurrencyCode, Intl.NumberFormat>();

export type OpeningHoursState = 'open' | 'closed' | 'unknown';

export interface OpeningHoursRow {
  day: Weekday;
  state: OpeningHoursState;
  opens: string | null;
  closes: string | null;
}

export type OpeningHoursSummary =
  | { kind: 'daily'; opens: string; closes: string }
  | { kind: 'partial'; count: number }
  | { kind: 'weekly' };

export function normalizeTime(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return TIME_PATTERN.test(trimmed) ? trimmed : null;
}

export function formatTime(value: string | null | undefined): string | null {
  const normalized = normalizeTime(value);

  if (!normalized) {
    return null;
  }

  const [hours, minutes] = normalized.split(':').map(Number);
  return timeFormatter.format(new Date(Date.UTC(2000, 0, 1, hours, minutes)));
}

function getPriceFormatter(currency: CurrencyCode): Intl.NumberFormat {
  const existing = priceFormatters.get(currency);

  if (existing) {
    return existing;
  }

  const formatter = new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
    currencyDisplay: 'code',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  priceFormatters.set(currency, formatter);
  return formatter;
}

export function formatMoney(money: Money): string {
  return getPriceFormatter(money.currency).format(money.amount);
}

export function formatPriceQuote(quote: PriceQuote): string {
  return formatMoney(quote);
}

export function formatUpdatedDate(value: string | null | undefined): string | null {
  return formatIsoDate(value);
}

export function toParagraphs(text: string | null | undefined): string[] {
  if (!text) {
    return [];
  }

  return text
    .replaceAll('\r\n', '\n')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function truncateText(text: string, maxLength: number): string {
  const normalized = text.replace(/\s+/g, ' ').trim();

  if (maxLength <= 0 || !normalized) {
    return '';
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const slice = normalized.slice(0, maxLength - 1);
  const lastSpace = slice.lastIndexOf(' ');
  const cut = lastSpace > maxLength * 0.6 ? slice.slice(0, lastSpace) : slice;

  return `${cut.trimEnd()}…`;
}

export function getOpeningHoursRows(
  hours: readonly OpeningHours[] | null | undefined,
): OpeningHoursRow[] {
  if (!hours || hours.length === 0) {
    return [];
  }

  const byDay = new Map<Weekday, OpeningHours>();

  for (const entry of hours) {
    if (WEEKDAYS.includes(entry.day) && !byDay.has(entry.day)) {
      byDay.set(entry.day, entry);
    }
  }

  return WEEKDAYS.flatMap((day) => {
    const entry = byDay.get(day);

    if (!entry) {
      return [];
    }

    const opens = normalizeTime(entry.opens);
    const closes = normalizeTime(entry.closes);
    const state: OpeningHoursState = entry.closed ? 'closed' : opens && closes ? 'open' : 'unknown';

    return [{ day, state, opens, closes }];
  });
}

export function summarizeOpeningHours(
  rows: readonly OpeningHoursRow[],
): OpeningHoursSummary | null {
  const first = rows[0];

  if (!first) {
    return null;
  }

  const allOpen = rows.every((row) => row.state === 'open');
  const sameHours =
    allOpen && rows.every((row) => row.opens === first.opens && row.closes === first.closes);
  const opens = first.opens;
  const closes = first.closes;

  if (rows.length === 7 && sameHours && opens && closes) {
    return { kind: 'daily', opens, closes };
  }

  if (rows.length < 7) {
    return { kind: 'partial', count: rows.length };
  }

  return { kind: 'weekly' };
}
