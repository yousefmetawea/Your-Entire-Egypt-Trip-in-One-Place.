/**
 * Shared contract between the browser and the Vercel functions under /api/ai.
 * Pure types and constants only: no imports, so it is safe on both sides.
 */

export const AI_AREAS = [
  'giza',
  'downtown',
  'islamic-cairo',
  'coptic-cairo',
  'zamalek',
  'old-cairo',
  'luxor',
  'aswan',
  'alexandria',
  'red-sea',
  'sinai',
  'western-desert',
  'siwa',
] as const;
export type AiArea = (typeof AI_AREAS)[number];

export const AI_CATEGORIES = ['history', 'culture', 'adventure', 'food'] as const;
export type AiCategory = (typeof AI_CATEGORIES)[number];

export const AI_BUDGETS = ['essential', 'balanced', 'signature'] as const;
export type AiBudget = (typeof AI_BUDGETS)[number];

export const AI_STYLES = ['relaxed', 'balanced', 'packed'] as const;
export type AiStyle = (typeof AI_STYLES)[number];

export const AI_LANGS = ['en', 'ar'] as const;
export type AiLang = (typeof AI_LANGS)[number];

export const AI_LIMITS = {
  minDays: 1,
  maxDays: 7,
  maxRegions: 6,
  maxQuestionChars: 300,
  maxBodyChars: 6000,
  maxWhyChars: 220,
  maxTitleChars: 80,
  maxSummaryChars: 320,
  maxAnswerChars: 1600,
  /** Stops allowed per day for each travel style. */
  stopsPerDay: { relaxed: 2, balanced: 3, packed: 4 } satisfies Record<AiStyle, number>,
  /** Stops of one day must be within this distance of the first stop. */
  maxDaySpreadKm: 80,
} as const;

export interface PlanRequest {
  days: number;
  budget: AiBudget;
  interests: AiCategory[];
  regions: AiArea[];
  style: AiStyle;
  lang: AiLang;
  /** Regenerate one day only. `currentDays` holds the place ids of every day now shown. */
  regenerate?: { dayIndex: number; currentDays: string[][] };
}

export interface AiStop {
  placeId: string;
  /** Short reason in the requested language. May be empty. */
  why: string;
}

export interface AiDay {
  /** 1-based day number in the full plan. */
  day: number;
  title: string;
  stops: AiStop[];
}

export interface PlanResponse {
  summary: string;
  days: AiDay[];
  /** Stable codes, e.g. "far_stop_removed". */
  warnings: string[];
}

export interface AskRequest {
  slug: string;
  question: string;
  lang: AiLang;
}

export interface AskResponse {
  answer: string;
  /** True when the answer uses general knowledge beyond the place data. */
  usesGeneralKnowledge: boolean;
}

export type AiErrorCode =
  | 'bad_request'
  | 'forbidden'
  | 'method_not_allowed'
  | 'not_found'
  | 'rate_limited'
  | 'not_configured'
  | 'unavailable';

export interface AiErrorBody {
  error: { code: AiErrorCode; message: string };
}
