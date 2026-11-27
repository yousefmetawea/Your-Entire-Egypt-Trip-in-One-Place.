import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { AI_LIMITS } from '../../../ai-api/contract';
import type { Place } from '../../types';
import { buildLocalAnswer } from '../../lib/ai/fallback';
import type { PresetKey } from '../../lib/ai/fallback';
import { AiRequestError, requestAiAnswer } from '../../services/ai/aiApi';
import { AiSparkIcon } from './AiSparkIcon';

const PRESETS: PresetKey[] = ['history', 'bestTime', 'expect', 'tips'];

type Kind = 'ai' | 'local' | 'message';

interface Entry {
  id: number;
  question: string;
  status: 'loading' | 'done';
  answer: string;
  kind: Kind;
  general: boolean;
  tone?: 'warn';
}

export function AskAboutPlace({ place }: { place: Place }) {
  const { t, i18n } = useTranslation();
  const lang: 'en' | 'ar' = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const [entries, setEntries] = useState<Entry[]>([]);
  const [text, setText] = useState('');
  const [hint, setHint] = useState('');
  const counter = useRef(0);
  const controllers = useRef(new Set<AbortController>());
  const busy = entries.some((entry) => entry.status === 'loading');

  useEffect(() => {
    const active = controllers.current;
    return () => {
      active.forEach((controller) => controller.abort());
      active.clear();
    };
  }, []);

  function patch(id: number, next: Partial<Entry>) {
    setEntries((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, ...next } : entry)),
    );
  }

  function localFor(preset: PresetKey | null): { answer: string; kind: Kind } {
    if (!preset) return { answer: t('ai.ask.unavailable'), kind: 'message' };
    const { text: fromData } = buildLocalAnswer({ place, preset, lang });
    if (fromData) return { answer: fromData, kind: 'local' };
    return {
      answer: t(preset === 'bestTime' ? 'ai.ask.noBestTime' : 'ai.ask.noData'),
      kind: 'message',
    };
  }

  async function ask(question: string, preset: PresetKey | null) {
    const clean = question.trim();
    if (clean.length < 2 || busy) {
      if (clean.length < 2) setHint(t('ai.ask.tooShort'));
      return;
    }
    setHint('');
    const id = (counter.current += 1);
    setEntries((current) =>
      [...current, { id, question: clean, status: 'loading' as const, answer: '', kind: 'ai' as const, general: false }].slice(-6),
    );
    const controller = new AbortController();
    controllers.current.add(controller);
    try {
      const result = await requestAiAnswer(
        { slug: place.slug, question: clean.slice(0, AI_LIMITS.maxQuestionChars), lang },
        controller.signal,
      );
      patch(id, { status: 'done', answer: result.answer, kind: 'ai', general: result.usesGeneralKnowledge });
    } catch (error) {
      if (controller.signal.aborted) return;
      if (error instanceof AiRequestError && error.code === 'rate_limited') {
        patch(id, { status: 'done', answer: t('ai.ask.rateLimited'), kind: 'message', tone: 'warn' });
      } else {
        const local = localFor(preset);
        patch(id, { status: 'done', ...local, general: false });
      }
    } finally {
      controllers.current.delete(controller);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void ask(text, null);
    setText('');
  }

  return (
    <section
      aria-labelledby="ask-place-title"
      className="yt-dark relative isolate overflow-hidden rounded-3xl border border-[#B6CE67]/25 bg-[#101C15] p-6 text-[#F4F2E9] shadow-[0_24px_60px_-30px_rgba(16,28,21,0.7)] md:p-8"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(520px_240px_at_90%_0%,rgba(182,206,103,0.16),transparent_70%)]"
      />
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#B6CE67]">
        <AiSparkIcon className="size-4" />
        {t('ai.ask.eyebrow')}
      </p>
      <h2 id="ask-place-title" className="type-section mt-3 text-[#F4F2E9]">
        {t('ai.ask.title', { name: lang === 'ar' && place.name.ar ? place.name.ar : place.name.en })}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#F4F2E9]/75">
        {t('ai.ask.subtitle')}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            disabled={busy}
            onClick={() => void ask(t(`ai.ask.presetQuestions.${preset}`), preset)}
            className="min-h-10 cursor-pointer rounded-full border border-[#B6CE67]/45 px-4 text-sm font-medium text-[#F4F2E9] transition-colors hover:bg-[#B6CE67] hover:text-[#101C15] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t(`ai.ask.presets.${preset}`)}
          </button>
        ))}
      </div>

      <div aria-live="polite" className="mt-5 space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="space-y-2">
            <p className="ms-auto w-fit max-w-[90%] rounded-2xl rounded-ee-sm bg-[#B6CE67] px-4 py-2 text-sm font-medium text-[#101C15]">
              {entry.question}
            </p>
            <div className="max-w-[95%] rounded-2xl rounded-es-sm border border-white/10 bg-white/[0.06] px-4 py-3">
              {entry.status === 'loading' ? (
                <p className="flex items-center gap-2 text-sm text-[#F4F2E9]/80">
                  <span className="size-2 animate-pulse rounded-full bg-[#B6CE67]" aria-hidden="true" />
                  {t('ai.ask.asking')}
                </p>
              ) : (
                <>
                  <p
                    className={`whitespace-pre-line text-sm leading-relaxed ${entry.tone === 'warn' ? 'text-[#F2D98B]' : 'text-[#F4F2E9]'}`}
                  >
                    {entry.answer}
                  </p>
                  {entry.kind === 'ai' && entry.general ? (
                    <p className="mt-2 text-xs text-[#B6CE67]">{t('ai.ask.general')}</p>
                  ) : null}
                  {entry.kind === 'local' ? (
                    <p className="mt-2 text-xs text-[#F4F2E9]/60">{t('ai.ask.local')}</p>
                  ) : null}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-5">
        <label htmlFor="ask-place-input" className="sr-only">
          {t('ai.ask.label')}
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <textarea
            id="ask-place-input"
            value={text}
            maxLength={AI_LIMITS.maxQuestionChars}
            rows={2}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder={t('ai.ask.placeholder')}
            className="min-h-[3.25rem] flex-1 resize-none rounded-2xl border border-white/20 bg-white/[0.07] px-4 py-3 text-sm text-[#F4F2E9] placeholder:text-[#F4F2E9]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B6CE67]"
          />
          <button
            type="submit"
            disabled={busy}
            className="min-h-12 cursor-pointer rounded-full bg-[#B6CE67] px-6 text-sm font-semibold text-[#101C15] transition-colors hover:bg-[#c9df7d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? t('ai.ask.asking') : t('ai.ask.send')}
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-[#F4F2E9]/60">
          <span>{hint}</span>
          <span dir="ltr">
            {t('ai.ask.count', { count: text.length, max: AI_LIMITS.maxQuestionChars })}
          </span>
        </div>
      </form>

      <p className="mt-4 border-t border-white/10 pt-3 text-xs text-[#F4F2E9]/60">{t('ai.notice')}</p>
    </section>
  );
}
