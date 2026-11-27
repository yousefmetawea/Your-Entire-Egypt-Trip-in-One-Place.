import type {
  AiErrorBody,
  AiErrorCode,
  AskRequest,
  AskResponse,
  PlanRequest,
  PlanResponse,
} from '../../../ai-api/contract';

export class AiRequestError extends Error {
  readonly code: AiErrorCode | 'network' | 'timeout' | 'invalid_response';
  readonly retryAfterSec?: number;

  constructor(
    code: AiRequestError['code'],
    message: string,
    retryAfterSec?: number,
  ) {
    super(message);
    this.name = 'AiRequestError';
    this.code = code;
    this.retryAfterSec = retryAfterSec;
  }
}

const REQUEST_TIMEOUT_MS = 35_000;

async function postJson<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort);

  try {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const error = (data as AiErrorBody | null)?.error;
      const retry = Number(response.headers.get('retry-after'));
      throw new AiRequestError(
        error?.code ?? 'unavailable',
        error?.message ?? 'AI request failed.',
        Number.isFinite(retry) && retry > 0 ? retry : undefined,
      );
    }
    if (typeof data !== 'object' || data === null) {
      // A static host without the function answers with the SPA html.
      throw new AiRequestError('not_configured', 'AI is not available here.');
    }
    return data as T;
  } catch (error) {
    if (error instanceof AiRequestError) throw error;
    if (controller.signal.aborted && !signal?.aborted) {
      throw new AiRequestError('timeout', 'The AI request timed out.');
    }
    throw new AiRequestError('network', 'Could not reach the AI service.');
  } finally {
    window.clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

export function requestAiPlan(request: PlanRequest, signal?: AbortSignal): Promise<PlanResponse> {
  return postJson<PlanResponse>('/api/ai/plan', request, signal).then((data) => {
    if (!Array.isArray(data.days)) throw new AiRequestError('invalid_response', 'Bad AI answer.');
    return data;
  });
}

export function requestAiAnswer(request: AskRequest, signal?: AbortSignal): Promise<AskResponse> {
  return postJson<AskResponse>('/api/ai/ask', request, signal).then((data) => {
    if (typeof data.answer !== 'string') {
      throw new AiRequestError('invalid_response', 'Bad AI answer.');
    }
    return data;
  });
}
