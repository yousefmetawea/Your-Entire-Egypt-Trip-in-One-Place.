import { describe, expect, it, vi } from 'vitest';
import { handleAsk, parseAskRequest, validateAnswer } from './ask.js';
import { createRateStore, checkRateLimit, hasUnsupportedClaim, redactPersonalData, AiHttpError } from './security.js';
import { handlePlan, parsePlanRequest, sanitizePlan } from './plan.js';
import { getServerPlaces } from './catalog.js';
import type { AiDeps } from './deps.js';

const places = getServerPlaces();
const ids = new Set(places.map((p) => p.id));
const giza = places.find((p) => p.area === 'giza')!;
const luxor = places.find((p) => p.area === 'luxor')!;

const baseBody = { days: 2, budget: 'balanced', interests: ['history'], regions: ['giza'], style: 'balanced', lang: 'en' };

function deps(over: Partial<AiDeps> & { reply?: unknown; status?: number } = {}): AiDeps {
  const fetchMock = vi.fn(async () =>
    new Response(
      JSON.stringify({
        candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(over.reply ?? {}) }] } }],
      }),
      { status: over.status ?? 200 },
    ),
  ) as unknown as typeof fetch;
  return {
    env: { GEMINI_API_KEY: 'test-key' },
    fetch: fetchMock,
    now: () => 1_000_000,
    rateStore: createRateStore(),
    places,
    ...over,
  };
}

function post(path: string, body: unknown, headers: Record<string, string> = {}) {
  return new Request(`https://site.test${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', host: 'site.test', ...headers },
    body: JSON.stringify(body),
  });
}

describe('validation', () => {
  it('accepts a good plan request', () => {
    expect(parsePlanRequest(baseBody, ids).days).toBe(2);
  });
  it.each([
    { ...baseBody, days: 0 },
    { ...baseBody, days: 8 },
    { ...baseBody, days: 1.5 },
    { ...baseBody, budget: 'free' },
    { ...baseBody, interests: ['beach'] },
    { ...baseBody, regions: ['mars'] },
    { ...baseBody, lang: 'fr' },
    { ...baseBody, regenerate: { dayIndex: 5, currentDays: [[], []] } },
    { ...baseBody, regenerate: { dayIndex: 0, currentDays: [['nope'], []] } },
  ])('rejects bad plan request %#', (body) => {
    expect(() => parsePlanRequest(body, ids)).toThrow(AiHttpError);
  });
  it('rejects bad ask requests and redacts personal data', () => {
    expect(() => parseAskRequest({ slug: '../x', question: 'hi there', lang: 'en' })).toThrow();
    expect(() => parseAskRequest({ slug: 'a', question: '', lang: 'en' })).toThrow();
    const ok = parseAskRequest({ slug: 'a', question: 'mail me at a.b@x.com or +20 122 649 6173', lang: 'en' });
    expect(ok.question).not.toContain('@');
    expect(ok.question).not.toContain('6173');
  });
});

describe('rate limit', () => {
  it('blocks after the limit and per-day cap', () => {
    const store = createRateStore();
    const rule = { bucket: 't', limit: 2, windowMs: 1000 };
    checkRateLimit(store, 'ip', rule, 100, 0);
    checkRateLimit(store, 'ip', rule, 100, 1);
    expect(() => checkRateLimit(store, 'ip', rule, 100, 2)).toThrow(/Too many/);
    checkRateLimit(store, 'ip', rule, 100, 2000);
    expect(() => checkRateLimit(store, 'other', rule, 2, 2001)).toThrow(/daily/);
  });
});

describe('claim guard', () => {
  const none = { hasPrice: false, hasHours: false, hasVisitMinutes: false };
  it('flags invented numbers', () => {
    expect(hasUnsupportedClaim('Tickets cost 200 EGP.', none)).toBe(true);
    expect(hasUnsupportedClaim('Opens at 9 am daily.', none)).toBe(true);
    expect(hasUnsupportedClaim('Plan to spend 3 hours here.', none)).toBe(true);
    expect(hasUnsupportedClaim('It is 2 hours by car from Cairo.', none)).toBe(true);
  });
  it('allows plain text and known data', () => {
    expect(hasUnsupportedClaim('A great place for history lovers.', none)).toBe(false);
    expect(hasUnsupportedClaim('Tickets cost 200 EGP.', { ...none, hasPrice: true })).toBe(false);
  });
  it('redacts', () => {
    expect(redactPersonalData('x@y.com')).toBe('[email removed]');
  });
});

describe('sanitizePlan', () => {
  const req = parsePlanRequest({ ...baseBody, days: 2 }, ids);
  it('drops unknown, duplicate and far stops', () => {
    const raw = {
      summary: 's',
      days: [
        { day: 1, title: 'A', stops: [{ placeId: giza.id, why: 'ok' }, { placeId: 'ghost', why: '' }, { placeId: giza.id, why: '' }, { placeId: luxor.id, why: '' }] },
        { day: 2, title: 'B', stops: [{ placeId: luxor.id, why: 'Costs 500 EGP' }] },
      ],
    };
    const out = sanitizePlan(raw, req, places);
    expect(out.days[0]!.stops.map((s) => s.placeId)).toEqual([giza.id]);
    expect(out.days[1]!.stops[0]!.why).toBe('');
    expect(out.warnings).toEqual(expect.arrayContaining(['unknown_place_removed', 'duplicate_removed', 'far_stop_removed']));
  });
  it('fails when a day has no valid stop', () => {
    expect(() => sanitizePlan({ summary: '', days: [{ stops: [] }, { stops: [] }] }, req, places)).toThrow();
  });
});

describe('handlers', () => {
  it('plan: success path', async () => {
    const reply = { summary: 'Hi', days: [{ day: 1, title: 'D1', stops: [{ placeId: giza.id, why: 'Fits history.' }] }, { day: 2, title: 'D2', stops: [{ placeId: luxor.id, why: '' }] }] };
    const res = await handlePlan(post('/api/ai/plan', baseBody), deps({ reply }));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { days: unknown[] };
    expect(json.days).toHaveLength(2);
  });
  it('no key -> 503 not_configured', async () => {
    const res = await handlePlan(post('/api/ai/plan', baseBody), deps({ env: {} }));
    expect(res.status).toBe(503);
    expect(((await res.json()) as { error: { code: string } }).error.code).toBe('not_configured');
  });
  it('maps upstream failure to a generic 503 without upstream text', async () => {
    const res = await handlePlan(post('/api/ai/plan', baseBody), deps({ status: 500 }));
    expect(res.status).toBe(503);
    expect(await res.text()).not.toContain('test-key');
  });
  it('405, 403, 400, 429', async () => {
    expect((await handlePlan(new Request('https://site.test/api/ai/plan'), deps())).status).toBe(405);
    expect((await handlePlan(post('/api/ai/plan', baseBody, { origin: 'https://evil.test' }), deps())).status).toBe(403);
    expect((await handlePlan(post('/api/ai/plan', { days: 99 }), deps())).status).toBe(400);
    const d = deps({ reply: { summary: '', days: [] } });
    let last = 0;
    for (let i = 0; i < 7; i += 1) last = (await handlePlan(post('/api/ai/plan', baseBody), d)).status;
    expect(last).toBe(429);
  });
  it('same-origin passes', async () => {
    const res = await handlePlan(post('/api/ai/plan', { days: 99 }, { origin: 'https://site.test' }), deps());
    expect(res.status).toBe(400);
  });
  it('ask: grounds on the place and returns an answer', async () => {
    const d = deps({ reply: { answer: 'A famous site in Giza.', usesGeneralKnowledge: true } });
    const res = await handleAsk(post('/api/ai/ask', { slug: giza.slug, question: 'History?', lang: 'en' }), d);
    expect(res.status).toBe(200);
    const sent = (d.fetch as unknown as { mock: { calls: [string, { body: string }][] } }).mock.calls[0]![1].body;
    expect(sent).toContain(giza.name.en);
    expect(sent).not.toContain('test-key');
  });
  it('ask: unknown place 404, invented price rejected', async () => {
    expect((await handleAsk(post('/api/ai/ask', { slug: 'nope', question: 'hello?', lang: 'en' }), deps())).status).toBe(404);
    const noPrice = places.find((p) => p.ticketPrice === null);
    if (noPrice) {
      expect(() => validateAnswer({ answer: 'Tickets cost 300 EGP.' }, noPrice)).toThrow();
    }
  });
});
