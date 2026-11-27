import type { Place } from '../src/types/index.js';
import type { GeminiEnv } from './gemini.js';
import { getServerPlaces } from './catalog.js';
import { createRateStore } from './security.js';
import type { RateStore } from './security.js';

export interface AiEnv extends GeminiEnv {
  /** Comma separated extra origins allowed to call the API (optional). */
  AI_ALLOWED_ORIGINS?: string;
  /** Requests per day per function instance (optional, default 400). */
  AI_DAILY_LIMIT?: string;
}

export interface AiDeps {
  env: AiEnv;
  fetch: typeof fetch;
  now: () => number;
  rateStore: RateStore;
  places: readonly Place[];
}

const sharedStore = createRateStore();

export function defaultDeps(): AiDeps {
  return {
    env: process.env as AiEnv,
    fetch: globalThis.fetch.bind(globalThis),
    now: () => Date.now(),
    rateStore: sharedStore,
    places: getServerPlaces(),
  };
}

export function dailyCap(env: AiEnv): number {
  const parsed = Number(env.AI_DAILY_LIMIT);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 400;
}

export function allowedOrigins(env: AiEnv): string[] {
  return (env.AI_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
