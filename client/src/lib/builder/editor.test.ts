import { describe, expect, it } from 'vitest';
import type { Trip, TripActivity, TripDay } from '../../types';
import { createEditorState, itineraryEditorReducer, MAX_EDITOR_HISTORY } from './editor';

function makeActivity(id: string, overrides: Partial<TripActivity> = {}): TripActivity {
  return {
    id,
    source: { type: 'custom', title: `Activity ${id}` },
    startTime: '09:00',
    durationMin: 60,
    travelMin: null,
    estimatedCost: null,
    order: 0,
    ...overrides,
  };
}

function makeTrip(days?: TripDay[]): Trip {
  return {
    id: 'trip-1',
    userId: 'demo-user',
    title: 'Cairo',
    startDate: '2026-12-01',
    endDate: '2026-12-01',
    travelers: 2,
    budget: null,
    budgetTier: 'balanced',
    interests: ['history'],
    preferences: {},
    status: 'draft',
    days: days ?? [
      {
        id: 'day-2026-12-01',
        date: '2026-12-01',
        activities: [],
      },
    ],
    accommodationId: null,
    savedPlaceIds: [],
    isDemo: true,
  };
}

describe('itinerary editor reducer', () => {
  it('adds an activity, normalizes its order, and saves history', () => {
    const state = createEditorState(makeTrip());
    const next = itineraryEditorReducer(state, {
      type: 'addActivity',
      dayId: 'day-2026-12-01',
      activity: makeActivity('a1', { order: 42 }),
    });

    expect(next.present.days[0].activities).toMatchObject([{ id: 'a1', order: 0 }]);
    expect(next.past).toHaveLength(1);
    expect(next.future).toEqual([]);
    expect(state.present.days[0].activities).toEqual([]);
  });

  it('updates nullable fields and ignores an unchanged patch', () => {
    const trip = makeTrip([
      {
        id: 'day-2026-12-01',
        date: '2026-12-01',
        activities: [makeActivity('a1')],
      },
    ]);
    const state = createEditorState(trip);
    const changed = itineraryEditorReducer(state, {
      type: 'updateActivity',
      dayId: 'day-2026-12-01',
      activityId: 'a1',
      patch: { startTime: null, durationMin: null },
    });
    const unchanged = itineraryEditorReducer(changed, {
      type: 'updateActivity',
      dayId: 'day-2026-12-01',
      activityId: 'a1',
      patch: { startTime: null, durationMin: null },
    });

    expect(changed.present.days[0].activities[0]).toMatchObject({
      startTime: null,
      durationMin: null,
    });
    expect(unchanged).toBe(changed);
  });

  it('removes an activity and reindexes the day', () => {
    const trip = makeTrip([
      {
        id: 'day-2026-12-01',
        date: '2026-12-01',
        activities: [makeActivity('a1'), makeActivity('a2'), makeActivity('a3')],
      },
    ]);
    const state = createEditorState(trip);
    const next = itineraryEditorReducer(state, {
      type: 'removeActivity',
      dayId: 'day-2026-12-01',
      activityId: 'a2',
    });

    expect(next.present.days[0].activities).toMatchObject([
      { id: 'a1', order: 0 },
      { id: 'a3', order: 1 },
    ]);
  });

  it('reorders within a day without rewriting start times', () => {
    const trip = makeTrip([
      {
        id: 'day-2026-12-01',
        date: '2026-12-01',
        activities: [
          makeActivity('a1', { startTime: '09:00' }),
          makeActivity('a2', { startTime: '11:30' }),
          makeActivity('a3', { startTime: '14:00' }),
        ],
      },
    ]);
    const next = itineraryEditorReducer(createEditorState(trip), {
      type: 'moveActivity',
      activityId: 'a3',
      fromDayId: 'day-2026-12-01',
      toDayId: 'day-2026-12-01',
      toIndex: 0,
    });

    expect(next.present.days[0].activities.map((activity) => activity.id)).toEqual([
      'a3',
      'a1',
      'a2',
    ]);
    expect(next.present.days[0].activities[0].startTime).toBe('14:00');
  });

  it('moves an activity across days and reindexes both days', () => {
    const trip = makeTrip([
      {
        id: 'day-2026-12-01',
        date: '2026-12-01',
        activities: [makeActivity('a1'), makeActivity('a2')],
      },
      {
        id: 'day-2026-12-02',
        date: '2026-12-02',
        activities: [makeActivity('b1')],
      },
    ]);
    trip.endDate = '2026-12-02';
    const next = itineraryEditorReducer(createEditorState(trip), {
      type: 'moveActivity',
      activityId: 'a1',
      fromDayId: 'day-2026-12-01',
      toDayId: 'day-2026-12-02',
      toIndex: 1,
    });

    expect(next.present.days[0].activities).toMatchObject([{ id: 'a2', order: 0 }]);
    expect(next.present.days[1].activities).toMatchObject([
      { id: 'b1', order: 0 },
      { id: 'a1', order: 1 },
    ]);
  });

  it('renames the trip with a trimmed title and ignores an empty title', () => {
    const state = createEditorState(makeTrip());
    const renamed = itineraryEditorReducer(state, {
      type: 'renameTrip',
      title: '  Cairo in slow motion  ',
    });
    const ignored = itineraryEditorReducer(renamed, {
      type: 'renameTrip',
      title: '   ',
    });

    expect(renamed.present.title).toBe('Cairo in slow motion');
    expect(renamed.past).toHaveLength(1);
    expect(ignored).toBe(renamed);
  });

  it('adds the next consecutive day and updates the end date', () => {
    const next = itineraryEditorReducer(createEditorState(makeTrip()), { type: 'addDay' });

    expect(next.present.days[1]).toEqual({
      id: 'day-2026-12-02',
      date: '2026-12-02',
      activities: [],
    });
    expect(next.present.endDate).toBe('2026-12-02');
  });

  it('caps added days at 14', () => {
    const days: TripDay[] = Array.from({ length: 14 }, (_, index) => {
      const date = new Date(Date.UTC(2026, 11, 1 + index)).toISOString().slice(0, 10);
      return { id: `day-${date}`, date, activities: [] };
    });
    const trip = makeTrip(days);
    trip.endDate = days[13].date;
    const state = createEditorState(trip);

    expect(itineraryEditorReducer(state, { type: 'addDay' })).toBe(state);
  });

  it('removes only the last day and keeps at least one day', () => {
    const trip = makeTrip([
      { id: 'day-2026-12-01', date: '2026-12-01', activities: [] },
      { id: 'day-2026-12-02', date: '2026-12-02', activities: [] },
    ]);
    trip.endDate = '2026-12-02';
    const state = createEditorState(trip);
    const removed = itineraryEditorReducer(state, { type: 'removeLastDay' });
    const single = itineraryEditorReducer(removed, { type: 'removeLastDay' });

    expect(removed.present.days).toHaveLength(1);
    expect(removed.present.endDate).toBe('2026-12-01');
    expect(single).toBe(removed);
  });

  it('undoes and redoes changes, capping history at 30 snapshots', () => {
    let state = createEditorState(makeTrip());
    const original = state.present;

    for (let index = 0; index < MAX_EDITOR_HISTORY + 2; index += 1) {
      state = itineraryEditorReducer(state, {
        type: 'addActivity',
        dayId: 'day-2026-12-01',
        activity: makeActivity(`a${index}`),
      });
    }

    expect(state.past).toHaveLength(MAX_EDITOR_HISTORY);

    let undone = state;

    for (let index = 0; index < MAX_EDITOR_HISTORY; index += 1) {
      undone = itineraryEditorReducer(undone, { type: 'undo' });
    }

    expect(undone.present).not.toBe(original);
    expect(undone.present.days[0].activities).toHaveLength(2);
    expect(undone.past).toEqual([]);

    const redone = itineraryEditorReducer(undone, { type: 'redo' });

    expect(redone.present.days[0].activities).toHaveLength(3);
  });
});
