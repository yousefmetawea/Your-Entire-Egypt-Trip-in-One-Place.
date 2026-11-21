import { describe, expect, it } from 'vitest';
import {
  CAIRO_AREAS,
  DURATION_FILTERS,
  PLACE_CATEGORIES,
  getAreaLabelKey,
  getAreaSearchText,
  getCategoryLabelKey,
  getDurationFilterLabelKey,
  getDurationLabel,
  splitVisitDuration,
} from './catalog';

describe('catalog helpers', () => {
  it('exposes every supported filter value', () => {
    expect(PLACE_CATEGORIES).toEqual(['history', 'culture', 'adventure', 'food']);
    expect(CAIRO_AREAS).toHaveLength(6);
    expect(DURATION_FILTERS).toEqual(['under-2h', '2-4h', 'over-4h']);
  });

  it('returns translation keys for catalog labels', () => {
    expect(getCategoryLabelKey('history')).toBe('catalog.categories.history');
    expect(getAreaLabelKey('islamic-cairo')).toBe('catalog.areas.islamic-cairo');
    expect(getDurationFilterLabelKey('2-4h')).toBe('catalog.durations.2-4h');
  });

  it('builds searchable area text from the area key', () => {
    expect(getAreaSearchText('islamic-cairo')).toBe('islamic cairo');
    expect(getAreaSearchText('downtown')).toBe('downtown cairo');
    expect(getAreaSearchText('giza')).toBe('giza');
  });

  it('splits visit durations into hours and minutes', () => {
    expect(splitVisitDuration(null)).toBeNull();
    expect(splitVisitDuration(-1)).toBeNull();
    expect(splitVisitDuration(45)).toEqual({ hours: 0, minutes: 45 });
    expect(splitVisitDuration(60)).toEqual({ hours: 1, minutes: 0 });
    expect(splitVisitDuration(90)).toEqual({ hours: 1, minutes: 30 });
    expect(splitVisitDuration(240)).toEqual({ hours: 4, minutes: 0 });
    expect(splitVisitDuration(300)).toEqual({ hours: 5, minutes: 0 });
  });

  it('selects the correct duration translation key', () => {
    expect(getDurationLabel(null)).toBeNull();
    expect(getDurationLabel(45)).toEqual({
      key: 'duration.minutes',
      values: { count: 45 },
    });
    expect(getDurationLabel(60)).toEqual({
      key: 'duration.hours',
      values: { count: 1 },
    });
    expect(getDurationLabel(90)).toEqual({
      key: 'duration.hoursMinutes',
      values: { hours: 1, minutes: 30 },
    });
  });
});
