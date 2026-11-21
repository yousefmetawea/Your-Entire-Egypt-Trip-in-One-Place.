import type { CairoArea, IsoDate, Place, PlaceCategory } from '../types';
import { getAreaSearchText, isCairoArea, isDurationFilter, isPlaceCategory } from './catalog';
import type { DurationFilter } from './catalog';
import { isIsoDate } from './date';

export interface DiscoverFilters {
  q: string;
  category: PlaceCategory | null;
  area: CairoArea | null;
  duration: DurationFilter | null;
}

export interface DiscoverContext {
  from: IsoDate | null;
  to: IsoDate | null;
  travelers: number | null;
}

export interface DiscoverState {
  filters: DiscoverFilters;
  context: DiscoverContext;
}

export interface DiscoverContextInput {
  from?: string | null;
  to?: string | null;
  travelers?: string | number | null;
}

export interface DiscoverHrefInput {
  filters?: Partial<DiscoverFilters>;
  context?: DiscoverContextInput;
}

export const EMPTY_DISCOVER_FILTERS: DiscoverFilters = {
  q: '',
  category: null,
  area: null,
  duration: null,
};

export const EMPTY_DISCOVER_CONTEXT: DiscoverContext = {
  from: null,
  to: null,
  travelers: null,
};

function normalizeText(value: string | null | undefined): string {
  return value?.trim() ?? '';
}

function normalizeTravelers(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isSafeInteger(numeric) && numeric >= 1 ? numeric : null;
}

function sanitizeFilters(filters: Partial<DiscoverFilters> = {}): DiscoverFilters {
  const category = filters.category;
  const area = filters.area;
  const duration = filters.duration;

  return {
    q: normalizeText(filters.q),
    category: typeof category === 'string' && isPlaceCategory(category) ? category : null,
    area: typeof area === 'string' && isCairoArea(area) ? area : null,
    duration: typeof duration === 'string' && isDurationFilter(duration) ? duration : null,
  };
}

export function normalizeContext(input: DiscoverContextInput = {}): DiscoverContext {
  const rawFrom = normalizeText(input.from);
  const rawTo = normalizeText(input.to);
  const from = isIsoDate(rawFrom) ? rawFrom : null;
  let to = isIsoDate(rawTo) ? rawTo : null;

  if (from && to && to < from) {
    to = null;
  }

  return {
    from,
    to,
    travelers: normalizeTravelers(input.travelers),
  };
}

export function parseDiscoverState(params: URLSearchParams): DiscoverState {
  return {
    filters: sanitizeFilters({
      q: params.get('q') ?? '',
      category: params.get('category') as PlaceCategory | null,
      area: params.get('area') as CairoArea | null,
      duration: params.get('duration') as DurationFilter | null,
    }),
    context: normalizeContext({
      from: params.get('from'),
      to: params.get('to'),
      travelers: params.get('travelers'),
    }),
  };
}

export function serializeDiscoverState(state: DiscoverState): URLSearchParams {
  const filters = sanitizeFilters(state.filters);
  const context = normalizeContext(state.context);
  const params = new URLSearchParams();

  if (filters.q) {
    params.set('q', filters.q);
  }

  if (filters.category) {
    params.set('category', filters.category);
  }

  if (filters.area) {
    params.set('area', filters.area);
  }

  if (filters.duration) {
    params.set('duration', filters.duration);
  }

  if (context.from) {
    params.set('from', context.from);
  }

  if (context.to) {
    params.set('to', context.to);
  }

  if (context.travelers !== null) {
    params.set('travelers', String(context.travelers));
  }

  return params;
}

export function createDiscoverHref(input: DiscoverHrefInput = {}): string {
  const search = serializeDiscoverState({
    filters: sanitizeFilters(input.filters),
    context: normalizeContext(input.context),
  }).toString();

  return search ? `/discover?${search}` : '/discover';
}

export function hasActiveFilters(filters: DiscoverFilters): boolean {
  return Boolean(filters.q || filters.category || filters.area || filters.duration);
}

export function matchesDuration(minutes: number | null, duration: DurationFilter | null): boolean {
  if (!duration) {
    return true;
  }

  if (minutes === null) {
    return false;
  }

  if (duration === 'under-2h') {
    return minutes < 120;
  }

  if (duration === '2-4h') {
    return minutes >= 120 && minutes <= 240;
  }

  return minutes > 240;
}

export function filterPlaces(places: readonly Place[], filters: DiscoverFilters): Place[] {
  const search = normalizeText(filters.q).toLowerCase().replaceAll('-', ' ');

  return places.filter((place) => {
    if (filters.category && place.category !== filters.category) {
      return false;
    }

    if (filters.area && place.area !== filters.area) {
      return false;
    }

    if (!matchesDuration(place.avgVisitMinutes, filters.duration)) {
      return false;
    }

    if (!search) {
      return true;
    }

    const name = place.name.en.toLowerCase().replaceAll('-', ' ');

    return name.includes(search) || getAreaSearchText(place.area).includes(search);
  });
}
