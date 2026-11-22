export const DAY_DROP_PREFIX = 'builder-day-drop-';

export function getDayDropId(dayId: string): string {
  return `${DAY_DROP_PREFIX}${dayId}`;
}
