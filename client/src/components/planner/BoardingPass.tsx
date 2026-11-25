import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import type { PlaceId, PlannerFormValues } from '../../types';
import { formatIsoDate } from '../../lib/date';
import {
  getAccommodationPreferenceLabelKey,
  getBudgetTierLabelKey,
  getInterestLabelKey,
  getTransportPreferenceLabelKey,
  isBudgetTier,
  MAX_TRAVELERS,
} from '../../lib/planner/options';
import type { PlannerDraftStatus, PlannerGenerateError } from '../../hooks/useTripPlanner';
import { ArrowRightIcon } from '../ui/icons';
import { getRouteCities, orderRoute } from '../../lib/planner/routeMap';
import { PrintTicket } from './PrintTicket';
import './boardingPass.css';

export interface BoardingPassProps {
  values: PlannerFormValues;
  savedPlaceIds: PlaceId[];
  draftStatus: PlannerDraftStatus;
  includeSavedPlaces: boolean;
  isSubmitting: boolean;
  generateError: PlannerGenerateError | null;
  hasExistingDraft: boolean;
  isRegenerating: boolean;
  onIncludeSavedPlacesChange: (include: boolean) => void;
  onGenerate: () => void;
}

function Row({
  label,
  children,
  ltr = false,
}: {
  label: string;
  children: React.ReactNode;
  ltr?: boolean;
}) {
  return (
    <div className="pass-row">
      <dt>{label}</dt>
      <dd dir={ltr ? 'ltr' : undefined}>{children}</dd>
    </div>
  );
}

/** Deterministic decorative bars derived from the answers (not a real code). */
function bars(seed: string): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const out: number[] = [];
  for (let i = 0; i < 38; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    out.push(1 + ((h >>> 0) % 3));
  }
  return out;
}

export function BoardingPass(props: BoardingPassProps) {
  const {
    values,
    savedPlaceIds,
    draftStatus,
    includeSavedPlaces,
    isSubmitting,
    generateError,
    hasExistingDraft,
    isRegenerating,
    onIncludeSavedPlacesChange,
    onGenerate,
  } = props;
  const { t, i18n } = useTranslation();
  const reduce = useReducedMotion();
  const startDate = formatIsoDate(values.startDate);
  const endDate = formatIsoDate(values.endDate);
  const travelers = Number(values.travelers);
  const hasTravelers = Number.isInteger(travelers) && travelers >= 1 && travelers <= MAX_TRAVELERS;
  const budgetTier = isBudgetTier(values.budgetTier) ? values.budgetTier : null;
  const notSet = t('planner.summary.notSet');
  const dateSummary =
    startDate && endDate
      ? t('planner.summary.dateRange', { from: startDate, to: endDate })
      : startDate
        ? t('planner.summary.dateFrom', { date: startDate })
        : endDate
          ? t('planner.summary.dateUntil', { date: endDate })
          : notSet;
  const routeNames = orderRoute(getRouteCities(values.interests))
    .map((city) => t(`planner.stage.cities.${city.id}`))
    .join(i18n.dir() === 'rtl' ? ' ← ' : ' → ');
  const barSeed = JSON.stringify(values);
  const barList = useMemo(() => bars(barSeed), [barSeed]);
  const generateLabel = isSubmitting
    ? t('planner.summary.generating')
    : isRegenerating
      ? t('planner.summary.regenerate')
      : t('planner.summary.generate');

  function download(): void {
    const previous = document.title;
    document.title = `YourTrip-${t('planner.pass.fileName')}`;
    const restore = () => {
      document.title = previous;
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);
    window.print();
  }

  return (
    <aside aria-label={t('planner.pass.label')} className="boarding-pass-wrap">
      <PrintTicket values={values} />
      <motion.div
        id="boarding-pass"
        className="pass"
        initial={reduce ? false : { opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="pass-main">
          <header className="pass-head">
            <div>
              <p className="pass-kicker">{t('planner.pass.brand')}</p>
              <h2 className="pass-title">{t('planner.pass.title')}</h2>
            </div>
            <span className="pass-badge">{t('planner.demoBadge')}</span>
          </header>

          <div className="pass-route" aria-hidden="true">
            <span>{t('planner.pass.from')}</span>
            <span className="pass-line" />
            <span className="pass-plane">✈</span>
            <span className="pass-line" />
            <span>{t('planner.pass.to')}</span>
          </div>

          <dl className="pass-grid">
            <Row label={t('planner.summary.datesLabel')} ltr>
              {dateSummary}
            </Row>
            <Row label={t('planner.summary.travelersLabel')}>
              {hasTravelers ? t('planner.travelers.summary', { count: travelers }) : notSet}
            </Row>
            <Row label={t('planner.summary.budgetLabel')}>
              {budgetTier ? t(getBudgetTierLabelKey(budgetTier)) : notSet}
            </Row>
            <Row label={t('planner.summary.stayLabel')}>
              {t(getAccommodationPreferenceLabelKey(values.accommodationType))}
            </Row>
            <Row label={t('planner.summary.transportLabel')}>
              {t(getTransportPreferenceLabelKey(values.transportType))}
            </Row>
            <Row label={t('planner.stage.routeLabel')}>{routeNames}</Row>
            <Row label={t('planner.summary.interestsLabel')}>
              {values.interests.length > 0
                ? values.interests.map((i) => t(getInterestLabelKey(i))).join(' · ')
                : notSet}
            </Row>
          </dl>
        </div>

        <div className="pass-tear" aria-hidden="true" />

        <footer className="pass-foot">
          <div className="pass-bars" aria-hidden="true">
            {barList.map((w, i) => (
              <span key={i} style={{ width: `${w * 2}px` }} />
            ))}
          </div>
          <p className="pass-note">{t('planner.pass.demoTicket')}</p>
        </footer>
      </motion.div>

      <div className="pass-actions">
        <div className="pass-saved">
          <p className="pass-saved-label">{t('planner.summary.savedPlacesLabel')}</p>
          {draftStatus === 'loading' ? (
            <p>{t('planner.summary.checkingDraft')}</p>
          ) : draftStatus === 'error' ? (
            <p>{t('planner.summary.draftError')}</p>
          ) : savedPlaceIds.length > 0 ? (
            <label className="pass-check">
              <input
                type="checkbox"
                checked={includeSavedPlaces}
                onChange={(event) => onIncludeSavedPlacesChange(event.target.checked)}
              />
              <span>
                {t('planner.summary.includeSavedPlaces')}
                <small>
                  {includeSavedPlaces
                    ? t('planner.summary.savedPlacesHint', { count: savedPlaceIds.length })
                    : t('planner.summary.savedPlacesExcluded')}
                </small>
              </span>
            </label>
          ) : (
            <p>{t('planner.summary.savedPlacesEmpty')}</p>
          )}
          {hasExistingDraft ? (
            <p>
              {isRegenerating
                ? t('planner.summary.generatedDraft')
                : t('planner.summary.existingDraft')}
            </p>
          ) : null}
        </div>

        {generateError ? (
          <p role="alert" className="pass-error">
            {generateError === 'no-matches'
              ? t('planner.summary.noMatches')
              : t('planner.summary.error')}
          </p>
        ) : null}

        <button
          type="button"
          className="pass-generate"
          onClick={onGenerate}
          disabled={isSubmitting}
        >
          {generateLabel}
          <ArrowRightIcon className="rtl:rotate-180" />
        </button>
        <div className="pass-secondary">
          <button type="button" onClick={() => window.print()}>
            {t('planner.pass.print')}
          </button>
          <button type="button" onClick={download}>
            {t('planner.pass.download')}
          </button>
        </div>
        <p className="pass-note">{t('planner.summary.demoNote')}</p>
        <p className="sr-only" role="status" aria-live="polite">
          {isSubmitting ? t('planner.summary.generating') : ''}
        </p>
      </div>
    </aside>
  );
}
