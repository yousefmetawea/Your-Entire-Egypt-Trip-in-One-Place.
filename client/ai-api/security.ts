import { AI_LIMITS } from './contract.js';
import type { AiErrorCode } from './contract.js';

export class AiHttpError extends Error {
  readonly code: AiErrorCode;
  readonly status: number;
  readonly retryAfterSec?: number;

  constructor(code: AiErrorCode, status: number, message: string, retryAfterSec?: number) {
    super(message);
    this.code = code;
    this.status = status;
    this.retryAfterSec = retryAfterSec;
  }
}

export function jsonResponse(body: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      ...headers,
    },
  });
}

export function errorResponse(error: AiHttpError): Response {
  const headers: Record<string, string> = {};
  if (error.retryAfterSec) headers['retry-after'] = String(error.retryAfterSec);
  return jsonResponse({ error: { code: error.code, message: error.message } }, error.status, headers);
}

/* ---------- request checks ---------- */

export function requirePost(request: Request): void {
  if (request.method !== 'POST') {
    throw new AiHttpError('method_not_allowed', 405, 'Use POST.');
  }
}

/** Reject browser requests that come from another site. Requests without Origin (curl) pass. */
export function requireSameOrigin(request: Request, allowedOrigins: string[] = []): void {
  const origin = request.headers.get('origin');
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite === 'cross-site') {
    if (!origin || !allowedOrigins.includes(origin)) {
      throw new AiHttpError('forbidden', 403, 'Cross-site requests are not allowed.');
    }
    return;
  }
  if (!origin) return;
  if (allowedOrigins.includes(origin)) return;
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new AiHttpError('forbidden', 403, 'Bad origin.');
  }
  if (!host || originHost !== host) {
    throw new AiHttpError('forbidden', 403, 'Cross-site requests are not allowed.');
  }
}

export async function readJsonBody(request: Request): Promise<unknown> {
  const type = request.headers.get('content-type') ?? '';
  if (!type.toLowerCase().includes('application/json')) {
    throw new AiHttpError('bad_request', 400, 'Send JSON.');
  }
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (declared > AI_LIMITS.maxBodyChars * 4) {
    throw new AiHttpError('bad_request', 400, 'Request is too large.');
  }
  const text = await request.text();
  if (text.length > AI_LIMITS.maxBodyChars) {
    throw new AiHttpError('bad_request', 400, 'Request is too large.');
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new AiHttpError('bad_request', 400, 'Invalid JSON.');
  }
}

export function getClientKey(request: Request): string {
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim().slice(0, 64);
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return (forwarded.split(',')[0] ?? '').trim().slice(0, 64) || 'unknown';
  return 'unknown';
}

/* ---------- rate limiting ----------
 * HONEST LIMIT: the counters live in the memory of ONE serverless function instance.
 * Vercel may run several instances and restarts them, so this is a best-effort brake,
 * NOT a hard per-user or daily cap across the whole site. For a hard cap, add a Vercel
 * Firewall rate-limit rule on /api/ai/* and set a spend/quota limit in Google AI Studio.
 */

export interface RateStore {
  hits: Map<string, number[]>;
  day: string;
  dayCount: number;
}

export function createRateStore(): RateStore {
  return { hits: new Map(), day: '', dayCount: 0 };
}

export interface RateRule {
  bucket: string;
  limit: number;
  windowMs: number;
}

export function checkRateLimit(
  store: RateStore,
  clientKey: string,
  rule: RateRule,
  dailyCap: number,
  now: number,
): void {
  const today = new Date(now).toISOString().slice(0, 10);
  if (store.day !== today) {
    store.day = today;
    store.dayCount = 0;
  }
  if (store.dayCount >= dailyCap) {
    throw new AiHttpError('rate_limited', 429, 'The daily AI limit was reached.', 3600);
  }

  const key = `${rule.bucket}:${clientKey}`;
  const recent = (store.hits.get(key) ?? []).filter((time) => now - time < rule.windowMs);
  if (recent.length >= rule.limit) {
    const oldest = recent[0] ?? now;
    const wait = Math.max(1, Math.ceil((rule.windowMs - (now - oldest)) / 1000));
    store.hits.set(key, recent);
    throw new AiHttpError('rate_limited', 429, 'Too many requests. Try again later.', wait);
  }
  recent.push(now);
  store.hits.set(key, recent);
  store.dayCount += 1;

  if (store.hits.size > 5000) {
    for (const [mapKey, times] of store.hits) {
      if (!times.some((time) => now - time < rule.windowMs)) store.hits.delete(mapKey);
    }
  }
}

/* ---------- text hygiene ---------- */

/** Remove obvious personal data before text is sent to a third party. */
export function redactPersonalData(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '[email removed]')
    .replace(/(?:\+|00)?\d[\d\s().-]{7,}\d/g, '[number removed]');
}

export function cleanText(value: unknown, maxChars: number): string {
  if (typeof value !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  const stripped = value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ');
  return stripped.replace(/\s+/g, ' ').trim().slice(0, maxChars);
}

/* ---------- claim guard: no invented prices, hours or durations ---------- */

export interface ClaimContext {
  hasPrice: boolean;
  hasHours: boolean;
  hasVisitMinutes: boolean;
}

const CURRENCY_AMOUNT =
  /(?:\b(?:EGP|USD|LE|L\.E\.)\s?\d|[$£€]\s?\d|\d[\d,.]*\s?(?:EGP|USD|LE\b|L\.E\.|dollars?|pounds?|euros?|جنيه|دولار|يورو))/i;
const TRAVEL_TIME =
  /\d+\s?(?:-|to|–)?\s?\d*\s?(?:minutes?|mins?|hours?|hrs?|ساعة|ساعات|دقيقة|دقائق)\s+(?:by|drive|driving|walk|walking|flight|away|from|ride|بالسيارة|بالطائرة|مشيا|بعيد)/i;
const OPEN_HOURS =
  /\b(?:opens?|closes?|open from|open until|closed on|hours?:)\b[^.]{0,30}\d{1,2}(?::\d{2})?\s?(?:am|pm|a\.m\.|p\.m\.)?/i;
const VISIT_DURATION =
  /\b(?:spend|allow|plan for|takes?|need|budget)\b[^.]{0,25}\d+\s?(?:-|to|–)?\s?\d*\s?(?:hours?|hrs?|minutes?|mins?)/i;

/** True when the text states a price, hour or duration the place data does not hold. */
export function hasUnsupportedClaim(text: string, context: ClaimContext): boolean {
  if (TRAVEL_TIME.test(text)) return true;
  if (!context.hasPrice && CURRENCY_AMOUNT.test(text)) return true;
  if (!context.hasHours && OPEN_HOURS.test(text)) return true;
  if (!context.hasVisitMinutes && VISIT_DURATION.test(text)) return true;
  return false;
}
