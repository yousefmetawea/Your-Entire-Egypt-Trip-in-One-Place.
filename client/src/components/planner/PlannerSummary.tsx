import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { PlannerFormValues, PlaceId } from '../../types';
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
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ArrowRightIcon, InfoIcon } from '../ui/icons';

export interface PlannerSummaryProps {
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

function SummaryRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-space-md border-b border-hairline py-space-sm last:border-b-0">
      <dt className="type-small shrink-0 text-on-surface-variant">{label}</dt>
      <dd className="min-w-0 text-end type-title-sm text-primary">{children}</dd>
    </div>
  );
}

export function PlannerSummary({
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
}: PlannerSummaryProps) {
  const { t } = useTranslation();
  const startDate = formatIsoDate(values.startDate);
  const endDate = formatIsoDate(values.endDate);
  const travelers = Number(values.travelers);
  const hasTravelers = Number.isInteger(travelers) && travelers >= 1 && travelers <= MAX_TRAVELERS;
  const budgetTier = isBudgetTier(values.budgetTier) ? values.budgetTier : null;
  const interestLabels = values.interests.map((interest) => t(getInterestLabelKey(interest)));
  const dateSummary =
    startDate && endDate
      ? t('planner.summary.dateRange', { from: startDate, to: endDate })
      : startDate
        ? t('planner.summary.dateFrom', { date: startDate })
        : endDate
          ? t('planner.summary.dateUntil', { date: endDate })
          : t('planner.summary.notSet');
  const savedPlacesCount = savedPlaceIds.length;
  const generateLabel = isSubmitting
    ? t('planner.summary.generating')
    : isRegenerating
      ? t('planner.summary.regenerate')
      : t('planner.summary.generate');

  return (
    <Card variant="elevated" padding="lg" className="flex flex-col gap-space-md">
      <div className="flex items-start justify-between gap-space-sm">
        <div>
          <p className="type-label text-secondary">{t('planner.summary.eyebrow')}</p>
          <h2 className="type-card-title mt-space-xs text-primary">{t('planner.summary.title')}</h2>
        </div>
        <Badge tone="bronze" size="sm">
          {t('planner.demoBadge')}
        </Badge>
      </div>

      <p className="type-small text-on-surface-variant">{t('planner.summary.description')}</p>

      <dl className="rounded-xl bg-surface-container-low/60 px-space-md">
        <SummaryRow label={t('planner.summary.datesLabel')}>{dateSummary}</SummaryRow>
        <SummaryRow label={t('planner.summary.travelersLabel')}>
          {hasTravelers
            ? t('planner.travelers.summary', { count: travelers })
            : t('planner.summary.notSet')}
        </SummaryRow>
        <SummaryRow label={t('planner.summary.budgetLabel')}>
          {budgetTier ? t(getBudgetTierLabelKey(budgetTier)) : t('planner.summary.notSet')}
        </SummaryRow>
        <SummaryRow label={t('planner.summary.interestsLabel')}>
          {interestLabels.length > 0 ? (
            <span className="flex flex-wrap justify-end gap-space-xs">
              {interestLabels.map((label) => (
                <Badge key={label} tone="neutral" size="sm">
                  {label}
                </Badge>
              ))}
            </span>
          ) : (
            t('planner.summary.notSet')
          )}
        </SummaryRow>
        <SummaryRow label={t('planner.summary.stayLabel')}>
          {t(getAccommodationPreferenceLabelKey(values.accommodationType))}
        </SummaryRow>
        <SummaryRow label={t('planner.summary.transportLabel')}>
          {t(getTransportPreferenceLabelKey(values.transportType))}
        </SummaryRow>
      </dl>

      <div className="rounded-xl border border-hairline bg-surface-container-lowest p-space-md">
        <p className="type-label-sm text-primary">{t('planner.summary.savedPlacesLabel')}</p>

        {draftStatus === 'loading' ? (
          <p className="type-small mt-space-xs text-on-surface-variant">
            {t('planner.summary.checkingDraft')}
          </p>
        ) : draftStatus === 'error' ? (
          <p className="type-small mt-space-xs text-on-surface-variant">
            {t('planner.summary.draftError')}
          </p>
        ) : savedPlacesCount > 0 ? (
          <label className="mt-space-xs flex cursor-pointer items-start gap-space-sm">
            <input
              type="checkbox"
              checked={includeSavedPlaces}
              onChange={(event) => onIncludeSavedPlacesChange(event.target.checked)}
              className="mt-0.5 size-4 shrink-0 rounded border-hairline-strong accent-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
            />
            <span className="min-w-0">
              <span className="type-small block text-on-surface">
                {t('planner.summary.includeSavedPlaces')}
              </span>
              <span className="type-small block text-on-surface-variant">
                {includeSavedPlaces
                  ? t('planner.summary.savedPlacesHint', { count: savedPlacesCount })
                  : t('planner.summary.savedPlacesExcluded')}
              </span>
            </span>
          </label>
        ) : (
          <p className="type-small mt-space-xs text-on-surface-variant">
            {t('planner.summary.savedPlacesEmpty')}
          </p>
        )}
      </div>

      {hasExistingDraft ? (
        <p className="type-small flex items-start gap-space-xs text-on-surface-variant">
          <InfoIcon className="mt-0.5 size-4 shrink-0 text-secondary" />
          {isRegenerating
            ? t('planner.summary.generatedDraft')
            : t('planner.summary.existingDraft')}
        </p>
      ) : null}

      {generateError ? (
        <p
          role="alert"
          className="rounded-xl bg-error-container p-space-md type-small text-on-error-container"
        >
          {generateError === 'no-matches'
            ? t('planner.summary.noMatches')
            : t('planner.summary.error')}
        </p>
      ) : null}

      <p className="type-small text-on-surface-variant">{t('planner.summary.demoNote')}</p>

      <div className="flex flex-col gap-space-xs">
        <Button
          type="button"
          size="lg"
          fullWidth
          onClick={onGenerate}
          disabled={isSubmitting}
          endIcon={<ArrowRightIcon className="rtl:rotate-180" />}
        >
          {generateLabel}
        </Button>
        <p className="text-center type-small text-on-surface-variant">
          {t('planner.summary.saveNote')}
        </p>
        <p className="sr-only" role="status" aria-live="polite">
          {isSubmitting ? t('planner.summary.generating') : ''}
        </p>
      </div>
    </Card>
  );
}
