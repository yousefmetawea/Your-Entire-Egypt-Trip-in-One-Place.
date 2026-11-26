import type { IsoDate } from '../../types';
import { isIsoDate } from '../date';

function locale(lang: string): string {
  // Latin digits in Arabic too, so numbers match the rest of the site.
  return lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB';
}

export function fmtDate(
  value: IsoDate | string | null | undefined,
  lang: string,
  withYear = true,
): string | null {
  if (!value || !isIsoDate(value)) return null;
  return new Intl.DateTimeFormat(locale(lang), {
    day: 'numeric',
    month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}

export function fmtWeekday(value: string, lang: string): string | null {
  if (!isIsoDate(value)) return null;
  return new Intl.DateTimeFormat(locale(lang), { weekday: 'short', timeZone: 'UTC' }).format(
    new Date(`${value}T00:00:00Z`),
  );
}

export function fmtNumber(value: number, lang: string, max = 0): string {
  return new Intl.NumberFormat(locale(lang), { maximumFractionDigits: max }).format(value);
}

export function fmtMoney(value: number, currency: string, lang: string): string {
  return new Intl.NumberFormat(locale(lang), {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
