import type { CairoArea, PlaceCategory } from '../types';

export const PLACE_CATEGORIES = [
  'history',
  'culture',
  'adventure',
  'food',
] as const satisfies readonly PlaceCategory[];

export const CAIRO_AREAS = [
  'giza',
  'downtown',
  'islamic-cairo',
  'coptic-cairo',
  'zamalek',
  'old-cairo',
] as const satisfies readonly CairoArea[];

export const EGYPT_AREAS = [
  ...CAIRO_AREAS,
  'luxor',
  'aswan',
  'alexandria',
  'red-sea',
  'sinai',
  'western-desert',
  'siwa',
] as const satisfies readonly CairoArea[];

export const DURATION_FILTERS = ['under-2h', '2-4h', 'over-4h'] as const;

export type DurationFilter = (typeof DURATION_FILTERS)[number];

export interface DurationLabel {
  key: 'duration.minutes' | 'duration.hours' | 'duration.hoursMinutes';
  values: Record<string, number>;
}

export function isPlaceCategory(value: string): value is PlaceCategory {
  return (PLACE_CATEGORIES as readonly string[]).includes(value);
}

export function isCairoArea(value: string): value is CairoArea {
  return (EGYPT_AREAS as readonly string[]).includes(value);
}

export function isDurationFilter(value: string): value is DurationFilter {
  return (DURATION_FILTERS as readonly string[]).includes(value);
}

export function getCategoryLabelKey(category: PlaceCategory): string {
  return `catalog.categories.${category}`;
}

export function getAreaLabelKey(area: CairoArea): string {
  return `catalog.areas.${area}`;
}

export function getDurationFilterLabelKey(duration: DurationFilter): string {
  return `catalog.durations.${duration}`;
}

const areaSearchText: Record<CairoArea, string> = {
  giza: 'giza',
  downtown: 'downtown cairo',
  'islamic-cairo': 'islamic cairo',
  'coptic-cairo': 'coptic cairo',
  zamalek: 'zamalek',
  'old-cairo': 'old cairo',
  luxor: 'luxor',
  aswan: 'aswan',
  alexandria: 'alexandria',
  'red-sea': 'red sea hurghada el gouna',
  sinai: 'sinai dahab sharm el sheikh',
  'western-desert': 'western desert bahariya',
  siwa: 'siwa oasis',
};

export function getAreaSearchText(area: CairoArea): string {
  return areaSearchText[area];
}

export function splitVisitDuration(
  minutes: number | null,
): { hours: number; minutes: number } | null {
  if (minutes === null || !Number.isFinite(minutes) || minutes < 0) {
    return null;
  }

  const rounded = Math.round(minutes);
  return {
    hours: Math.floor(rounded / 60),
    minutes: rounded % 60,
  };
}

export function getDurationLabel(minutes: number | null): DurationLabel | null {
  const parts = splitVisitDuration(minutes);

  if (!parts) {
    return null;
  }

  if (parts.hours > 0 && parts.minutes > 0) {
    return {
      key: 'duration.hoursMinutes',
      values: { hours: parts.hours, minutes: parts.minutes },
    };
  }

  if (parts.hours > 0) {
    return {
      key: 'duration.hours',
      values: { count: parts.hours },
    };
  }

  return {
    key: 'duration.minutes',
    values: { count: parts.minutes },
  };
}
