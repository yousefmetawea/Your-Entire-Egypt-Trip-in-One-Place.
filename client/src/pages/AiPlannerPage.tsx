import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { AI_AREAS, AI_BUDGETS, AI_CATEGORIES, AI_LIMITS, AI_STYLES } from '../../ai-api/contract';
import type {
  AiArea,
  AiBudget,
  AiCategory,
  AiDay,
  AiStyle,
  PlanRequest,
  PlanResponse,
} from '../../ai-api/contract';
import { AiSparkIcon } from '../components/ai/AiSparkIcon';
import { PlaceMedia } from '../components/places/PlaceMedia';
import { Container } from '../components/ui/Container';
import { usePageTitle } from '../hooks/usePageTitle';
import { usePlaces } from '../hooks/useCatalog';
import { buildFallbackPlan } from '../lib/ai/fallback';
import { getAreaLabelKey, getCategoryLabelKey, getDurationLabel } from '../lib/catalog';
import { AiRequestError, requestAiPlan } from '../services/ai/aiApi';
import type { Place } from '../types';
import '../components/ai/ai.css';

type Source = 'ai' | 'fallback';

interface Result {
  source: Source;
  summary: string;
  days: AiDay[];
  warnings: string[];
}

function Chip({
  active,
  onClick,
  children,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled && !active}
      onClick={onClick}
      className={`min-h-10 cursor-pointer rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F5A3A] disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'border-[#101C15] bg-[#101C15] text-[#B6CE67]'
          : 'border-[#B4BCA6] bg-[#F4F2E9] text-[#101C15] hover:border-[#101C15]'
      }`}
    >
      {children}
    </button>
  );
}

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((value) => value !== item) : [...list, item];
}

export default function AiPlannerPage() {
  const { t, i18n } = useTranslation();
  usePageTitle();
  const lang: 'en' | 'ar' = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const { data: places } = usePlaces();
  const byId = useMemo(() => new Map(places.map((place) => [place.id, place] as const)), [places]);

  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState<AiBudget>('balanced');
  const [interests, setInterests] = useState<AiCategory[]>([]);
  const [regions, setRegions] = useState<AiArea[]>([]);
  const [style, setStyle] = useState<AiStyle>('balanced');

  const [loading, setLoading] = useState<'all' | number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [errorText, setErrorText] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestRef = useRef<PlanRequest | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  function describeError(error: unknown): string {
    const code = error instanceof AiRequestError ? error.code : 'generic';
    const known = [
      'rate_limited',
      'not_configured',
      'unavailable',
      'timeout',
      'network',
      'bad_request',
    ];
    return t(`ai.planner.errors.${known.includes(code) ? code : 'generic'}`);
  }

  function currentRequest(): PlanRequest {
    return { days, budget, interests, regions, style, lang };
  }

  async function generate(dayIndex?: number) {
    if (loading !== null) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setErrorText('');
    setLoading(dayIndex ?? 'all');

    const base = dayIndex === undefined || !result ? currentRequest() : { ...(requestRef.current ?? currentRequest()) };
    const request: PlanRequest =
      dayIndex !== undefined && result
        ? {
            ...base,
            regenerate: { dayIndex, currentDays: result.days.map((day) => day.stops.map((stop) => stop.placeId)) },
          }
        : base;
    if (dayIndex === undefined) requestRef.current = request;

    try {
      const response: PlanResponse = await requestAiPlan(request, controller.signal);
      if (dayIndex !== undefined && result) {
        const replacement = response.days[0];
        if (!replacement) throw new AiRequestError('invalid_response', 'empty');
        setResult({
          ...result,
          warnings: [...new Set([...result.warnings, ...response.warnings])],
          days: result.days.map((day, index) =>
            index === dayIndex ? { ...replacement, day: day.day } : day,
          ),
        });
      } else {
        setResult({ source: 'ai', summary: response.summary, days: response.days, warnings: response.warnings });
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      setErrorText(describeError(error));
      if (dayIndex !== undefined && result) {
        setErrorText(`${describeError(error)} ${t('ai.planner.errors.dayFailed', { day: dayIndex + 1 })}`);
      } else {
        const fallback = buildFallbackPlan(places, request);
        if (fallback) {
          setResult({ source: 'fallback', summary: '', days: fallback.days, warnings: [] });
        } else {
          setResult(null);
          setErrorText(`${describeError(error)} ${t('ai.planner.errors.noPlan')}`);
        }
      }
    } finally {
      if (abortRef.current === controller) setLoading(null);
      window.setTimeout(() => resultRef.current?.focus({ preventScroll: false }), 50);
    }
  }

  const busy = loading !== null;

  return (
    <div className="yt-ivory yt-ai">
      <header className="yt-dark relative isolate -mt-24 overflow-hidden bg-[#101C15] pb-16 pt-40 text-[#F4F2E9] md:-mt-28 md:pb-20">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(760px_340px_at_85%_0%,rgba(182,206,103,0.18),transparent_70%)]"
        />
        <Container>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#B6CE67]">
            <AiSparkIcon className="size-4" />
            {t('ai.planner.eyebrow')}
          </p>
          <h1 className="type-display mt-4 max-w-3xl text-[#F4F2E9]">{t('ai.planner.title')}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#F4F2E9]/75">
            {t('ai.planner.subtitle')}
          </p>
          <p className="mt-6 inline-block rounded-full border border-[#B6CE67]/40 px-4 py-1.5 text-xs text-[#F4F2E9]/80">
            {t('ai.notice')}
          </p>
        </Container>
      </header>

      <Container className="grid gap-gutter-lg py-space-xl lg:grid-cols-12">
        <form
          className="space-y-6 rounded-3xl border border-[#CDD3C0] bg-[#F4F2E9] p-6 lg:col-span-4 lg:self-start"
          onSubmit={(event) => {
            event.preventDefault();
            void generate();
          }}
        >
          <fieldset>
            <legend className="text-sm font-semibold text-[#101C15]">{t('ai.planner.form.days')}</legend>
            <div className="mt-3 flex items-center gap-4">
              <button
                type="button"
                aria-label={t('ai.planner.form.daysLess')}
                disabled={days <= AI_LIMITS.minDays}
                onClick={() => setDays(days - 1)}
                className="size-11 cursor-pointer rounded-full border border-[#B4BCA6] text-xl text-[#101C15] hover:border-[#101C15] disabled:opacity-40"
              >
                −
              </button>
              <output aria-live="polite" className="min-w-24 text-center text-lg font-semibold text-[#101C15]">
                {t('ai.planner.form.daysValue', { count: days })}
              </output>
              <button
                type="button"
                aria-label={t('ai.planner.form.daysMore')}
                disabled={days >= AI_LIMITS.maxDays}
                onClick={() => setDays(days + 1)}
                className="size-11 cursor-pointer rounded-full border border-[#B4BCA6] text-xl text-[#101C15] hover:border-[#101C15] disabled:opacity-40"
              >
                +
              </button>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-[#101C15]">{t('ai.planner.form.budget')}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {AI_BUDGETS.map((item) => (
                <Chip key={item} active={budget === item} onClick={() => setBudget(item)}>
                  {t(`planner.budget.tiers.${item}.label`)}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-[#101C15]">{t('ai.planner.form.interests')}</legend>
            <p className="mt-1 text-xs text-[#3B4A3F]">{t('ai.planner.form.interestsHint')}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {AI_CATEGORIES.map((item) => (
                <Chip key={item} active={interests.includes(item)} onClick={() => setInterests(toggle(interests, item))}>
                  {t(getCategoryLabelKey(item))}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-[#101C15]">{t('ai.planner.form.regions')}</legend>
            <p className="mt-1 text-xs text-[#3B4A3F]">
              {t('ai.planner.form.regionsHint', { count: AI_LIMITS.maxRegions })}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {AI_AREAS.map((item) => (
                <Chip
                  key={item}
                  active={regions.includes(item)}
                  disabled={regions.length >= AI_LIMITS.maxRegions}
                  onClick={() => setRegions(toggle(regions, item))}
                >
                  {t(getAreaLabelKey(item))}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-[#101C15]">{t('ai.planner.form.style')}</legend>
            <div className="mt-3 grid gap-2">
              {AI_STYLES.map((item) => (
                <label
                  key={item}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[#2F5A3A] ${
                    style === item ? 'border-[#101C15] bg-[#101C15] text-[#F4F2E9]' : 'border-[#B4BCA6] text-[#101C15]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="ai-style"
                      value={item}
                      checked={style === item}
                      onChange={() => setStyle(item)}
                      className="size-4 accent-[#B6CE67]"
                    />
                    <span className="font-medium">{t(`ai.planner.form.styles.${item}`)}</span>
                  </span>
                  <span className={style === item ? 'text-[#B6CE67]' : 'text-[#3B4A3F]'}>
                    {t(`ai.planner.form.styles.${item}Hint`)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={busy}
            className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#101C15] px-6 text-sm font-semibold text-[#B6CE67] transition-colors hover:bg-[#193426] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F5A3A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <AiSparkIcon className="size-4" />
            {loading === 'all' ? t('ai.planner.form.submitting') : t('ai.planner.form.submit')}
          </button>
        </form>

        <div className="lg:col-span-8" ref={resultRef} tabIndex={-1} aria-live="polite">
          {loading === 'all' ? (
            <div className="space-y-4" role="status">
              <p className="text-sm font-medium text-[#3B4A3F]">{t('ai.planner.loading')}</p>
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-40 animate-pulse rounded-3xl bg-[#DDE1D0]" />
              ))}
            </div>
          ) : null}

          {errorText ? (
            <p role="alert" className="mb-4 rounded-2xl border border-[#B4BCA6] bg-[#F4F2E9] px-4 py-3 text-sm text-[#7A2E1F]">
              {errorText}
            </p>
          ) : null}

          {result && loading !== 'all' ? (
            <ResultView
              result={result}
              byId={byId}
              lang={lang}
              loading={loading}
              onRegenerateAll={() => void generate()}
              onRegenerateDay={(index) => void generate(index)}
              onRetryAi={() => void generate()}
            />
          ) : null}
        </div>
      </Container>
    </div>
  );
}

function ResultView({
  result,
  byId,
  lang,
  loading,
  onRegenerateAll,
  onRegenerateDay,
  onRetryAi,
}: {
  result: Result;
  byId: Map<string, Place>;
  lang: 'en' | 'ar';
  loading: 'all' | number | null;
  onRegenerateAll: () => void;
  onRegenerateDay: (index: number) => void;
  onRetryAi: () => void;
}) {
  const { t } = useTranslation();
  const busy = loading !== null;
  return (
    <div className="space-y-5">
      <div
        className={`rounded-2xl border px-4 py-3 text-sm ${
          result.source === 'ai'
            ? 'border-[#B6CE67] bg-[#B6CE67]/25 text-[#101C15]'
            : 'border-[#B4BCA6] bg-[#E4E4D6] text-[#101C15]'
        }`}
      >
        <p>{t(result.source === 'ai' ? 'ai.planner.banner.ai' : 'ai.planner.banner.fallback')}</p>
        {result.warnings.length > 0 ? <p className="mt-1 text-xs">{t('ai.planner.banner.warnings')}</p> : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="type-section text-[#101C15]">{t('ai.planner.result.title')}</h2>
        <button
          type="button"
          disabled={busy}
          onClick={result.source === 'ai' ? onRegenerateAll : onRetryAi}
          className="min-h-10 cursor-pointer rounded-full border border-[#101C15] px-5 text-sm font-semibold text-[#101C15] hover:bg-[#101C15] hover:text-[#B6CE67] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t(result.source === 'ai' ? 'ai.planner.result.regenerateAll' : 'ai.planner.result.tryAi')}
        </button>
      </div>

      {result.summary ? (
        <p className="max-w-3xl text-base leading-relaxed text-[#3B4A3F]">{result.summary}</p>
      ) : null}

      <ol className="space-y-5">
        {result.days.map((day, dayIndex) => (
          <li key={day.day} className="overflow-hidden rounded-3xl border border-[#CDD3C0] bg-[#F4F2E9]">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#101C15] px-5 py-4 text-[#F4F2E9]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B6CE67]">
                  {t('ai.planner.result.day', { day: day.day })}
                </p>
                <h3 className="mt-1 text-lg font-semibold">
                  {day.title || t('ai.planner.result.dayTitleFallback', { day: day.day })}
                </h3>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => onRegenerateDay(dayIndex)}
                className="min-h-9 cursor-pointer rounded-full border border-[#B6CE67]/60 px-4 text-xs font-semibold text-[#B6CE67] hover:bg-[#B6CE67] hover:text-[#101C15] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading === dayIndex
                  ? t('ai.planner.loadingDay', { day: day.day })
                  : t('ai.planner.result.regenerateDay')}
              </button>
            </div>
            <ol className="divide-y divide-[#CDD3C0]">
              {day.stops.map((stop, stopIndex) => {
                const place = byId.get(stop.placeId);
                if (!place) return null;
                return (
                  <StopRow key={stop.placeId} place={place} why={stop.why} index={stopIndex + 1} lang={lang} />
                );
              })}
            </ol>
          </li>
        ))}
      </ol>
    </div>
  );
}

function StopRow({ place, why, index, lang }: { place: Place; why: string; index: number; lang: 'en' | 'ar' }) {
  const { t } = useTranslation();
  const name = lang === 'ar' && place.name.ar ? place.name.ar : place.name.en;
  const desc = (lang === 'ar' && place.description?.ar ? place.description.ar : place.description?.en) ?? '';
  const snippet = desc.length > 150 ? `${desc.slice(0, 149).trimEnd()}…` : desc;
  const duration = getDurationLabel(place.avgVisitMinutes);
  return (
    <li className="flex gap-4 p-4 sm:p-5">
      <PlaceMedia
        place={place}
        sizes="120px"
        className="h-24 w-24 shrink-0 rounded-2xl sm:h-28 sm:w-32"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-[#B6CE67] text-xs font-bold text-[#101C15]">
            {index}
          </span>
          <h4 className="text-base font-semibold text-[#101C15]">{name}</h4>
          <span className="rounded-full border border-[#B4BCA6] px-2.5 py-0.5 text-xs text-[#3B4A3F]">
            {t(getAreaLabelKey(place.area))}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[#101C15]">
          <span className="font-semibold">{t('ai.planner.result.why')}: </span>
          {why || t('ai.planner.result.whyFallback')}
        </p>
        {snippet ? <p className="mt-1 text-sm leading-relaxed text-[#3B4A3F]">{snippet}</p> : null}
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          {duration ? (
            <span className="text-[#3B4A3F]">
              {t('ai.planner.result.visit', { duration: t(duration.key, duration.values) })}
            </span>
          ) : null}
          <Link
            to={`/places/${place.slug}`}
            className="font-semibold text-[#2F5A3A] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-[#2F5A3A]"
          >
            {t('ai.planner.result.viewPlace')} <span aria-hidden="true" className="inline-block rtl:rotate-180">→</span>
          </Link>
        </div>
      </div>
    </li>
  );
}
