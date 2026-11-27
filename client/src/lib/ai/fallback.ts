import type { AiDay, PlanRequest, PlanResponse } from '../../../ai-api/contract';
import { AI_LIMITS } from '../../../ai-api/contract';
import type { LocalizedText, Place, PlaceCategory } from '../../types';
import { generateItinerary } from '../planner/itinerary';

const FIXED_START = '2026-01-01';

function addDays(days: number): string {
  const date = new Date(`${FIXED_START}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days - 1);
  return date.toISOString().slice(0, 10);
}

/**
 * Non-AI itinerary built from the existing catalog planner. Used when the AI
 * service is not available. It never uses text the site does not own.
 */
export function buildFallbackPlan(places: readonly Place[], request: PlanRequest): PlanResponse | null {
  const preferred = request.regions.length
    ? places.filter((place) => request.regions.includes(place.area))
    : [];
  const pool = preferred.length >= request.days ? preferred : places;
  const interests: PlaceCategory[] = request.interests.length
    ? request.interests
    : ['history', 'culture', 'adventure', 'food'];

  const result = generateItinerary({
    tripId: 'ai-fallback',
    userId: 'ai-fallback',
    title: 'fallback',
    answers: {
      startDate: FIXED_START,
      endDate: addDays(request.days),
      travelers: 1,
      budgetTier: request.budget,
      interests,
      accommodationType: 'any',
      transportType: 'any',
    },
    places: pool,
    includeSavedPlaces: false,
  });
  if (!result.ok) return null;

  const cap = AI_LIMITS.stopsPerDay[request.style];
  const days: AiDay[] = result.itinerary.trip.days
    .map((day, index) => ({
      day: index + 1,
      title: '',
      stops: day.activities
        .flatMap((activity) =>
          activity.source.type === 'place' ? [{ placeId: activity.source.placeId, why: '' }] : [],
        )
        .slice(0, cap),
    }))
    .filter((day) => day.stops.length > 0);
  if (days.length === 0) return null;
  return { summary: '', days, warnings: [] };
}

export type PresetKey = 'history' | 'bestTime' | 'expect' | 'tips';

export interface LocalAnswerInput {
  place: Place;
  preset: PresetKey;
  lang: 'en' | 'ar';
}

export interface LocalAnswerParts {
  /** Text taken from the place data, or null when the data has none. */
  text: string | null;
}

/** Answer built only from the place's own data. Returns null text when the data has nothing. */
export function buildLocalAnswer({ place, preset, lang }: LocalAnswerInput): LocalAnswerParts {
  const pick = (value: LocalizedText | null): string | null =>
    value ? (lang === 'ar' && value.ar ? value.ar : value.en) || null : null;

  switch (preset) {
    case 'history':
      return { text: pick(place.history) ?? pick(place.description) };
    case 'expect':
      return { text: pick(place.description) };
    case 'tips': {
      if (!place.tips || place.tips.length === 0) return { text: null };
      return {
        text: place.tips
          .map((tip) => `${pick(tip.title) ?? ''}: ${pick(tip.body) ?? ''}`.trim())
          .join('\n'),
      };
    }
    case 'bestTime':
      return { text: null };
  }
}
