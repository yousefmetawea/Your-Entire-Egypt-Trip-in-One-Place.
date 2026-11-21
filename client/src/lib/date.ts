import type { IsoDate } from '../types';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_IN_MS = 86_400_000;

const shortDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }

  const time = Date.parse(`${value}T00:00:00Z`);
  return !Number.isNaN(time) && new Date(time).toISOString().slice(0, 10) === value;
}

export function formatIsoDate(value: string | null | undefined): string | null {
  if (!value || !isIsoDate(value)) {
    return null;
  }

  return shortDateFormatter.format(new Date(`${value}T00:00:00Z`));
}

export function getTodayIsoDate(now = new Date()): IsoDate {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function enumerateDates(startDate: IsoDate, endDate: IsoDate): IsoDate[] {
  if (!isIsoDate(startDate)) {
    throw new RangeError('Start date must use YYYY-MM-DD.');
  }

  if (!isIsoDate(endDate)) {
    throw new RangeError('End date must use YYYY-MM-DD.');
  }

  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);

  if (end < start) {
    throw new RangeError('End date must not be before the start date.');
  }

  const dates: IsoDate[] = [];

  for (let time = start; time <= end; time += DAY_IN_MS) {
    dates.push(new Date(time).toISOString().slice(0, 10));
  }

  return dates;
}
