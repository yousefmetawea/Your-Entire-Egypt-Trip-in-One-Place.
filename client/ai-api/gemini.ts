import { AiHttpError } from './security.js';

export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite';
const DEFAULT_BASE = 'https://generativelanguage.googleapis.com/v1beta';

export interface GeminiEnv {
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  /** Test hook only. Never set in production. */
  GEMINI_API_BASE?: string;
}

export interface GeminiCall {
  system: string;
  user: string;
  maxOutputTokens: number;
  temperature: number;
}

interface GeminiPart {
  text?: string;
}

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: GeminiPart[] }; finishReason?: string }>;
}

/** Calls Gemini and returns the JSON text of the first candidate. Throws AiHttpError only. */
export async function callGemini(
  env: GeminiEnv,
  call: GeminiCall,
  fetchImpl: typeof fetch,
  timeoutMs = 25_000,
): Promise<string> {
  const apiKey = env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new AiHttpError('not_configured', 503, 'AI is not configured.');
  }
  const model = (env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL).replace(/[^\w.-]/g, '');
  const base = (env.GEMINI_API_BASE?.trim() || DEFAULT_BASE).replace(/\/$/, '');
  const url = `${base}/models/${encodeURIComponent(model)}:generateContent`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: call.system }] },
        contents: [{ role: 'user', parts: [{ text: call.user }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: call.temperature,
          maxOutputTokens: call.maxOutputTokens,
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      // Log the status only. Never log the key, the prompt or the upstream body.
      console.error(`[ai] gemini http ${response.status}`);
      throw new AiHttpError('unavailable', 503, 'The AI service is busy. Try again later.');
    }

    const data = (await response.json()) as GeminiResponse;
    const candidate = data.candidates?.[0];
    const text = (candidate?.content?.parts ?? [])
      .map((part) => part.text ?? '')
      .join('')
      .trim();
    if (!text || (candidate?.finishReason && candidate.finishReason !== 'STOP')) {
      console.error(`[ai] gemini finish ${candidate?.finishReason ?? 'none'}`);
      throw new AiHttpError('unavailable', 503, 'The AI service gave no usable answer.');
    }
    return text;
  } catch (error) {
    if (error instanceof AiHttpError) throw error;
    console.error('[ai] gemini request failed');
    throw new AiHttpError('unavailable', 503, 'The AI service is not reachable.');
  } finally {
    clearTimeout(timer);
  }
}

/** Parse JSON that may be wrapped in a code fence. Returns null when invalid. */
export function parseJsonLoose(text: string): unknown {
  const trimmed = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return null;
  }
}
