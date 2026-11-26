import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { PlannerFormValues } from '../../types';
import { enumerateDates, formatIsoDate, isIsoDate } from '../../lib/date';
import {
  getAccommodationPreferenceLabelKey,
  getBudgetTierLabelKey,
  getInterestLabelKey,
  getTransportPreferenceLabelKey,
  isBudgetTier,
  MAX_TRAVELERS,
} from '../../lib/planner/options';
import './printTicket.css';

function hashCode(seed: string): string {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36).toUpperCase().padStart(7, '0').slice(0, 7);
}

function barWidths(seed: string): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const out: number[] = [];
  for (let i = 0; i < 64; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    out.push(1 + ((h >>> 0) % 3));
  }
  return out;
}

/**
 * Print-only document (hidden on screen, shown by @media print). Rendered into <body> so the
 * rest of the app can be hidden cleanly when the user prints or saves as PDF.
 */
export function PrintTicket({ values }: { values: PlannerFormValues }) {
  const { t, i18n } = useTranslation();
  const notSet = '—';
  const start = formatIsoDate(values.startDate);
  const end = formatIsoDate(values.endDate);
  let length: { days: number; nights: number } | null = null;
  if (
    isIsoDate(values.startDate) &&
    isIsoDate(values.endDate) &&
    values.endDate >= values.startDate
  ) {
    try {
      const days = enumerateDates(values.startDate, values.endDate).length;
      length = { days, nights: Math.max(days - 1, 0) };
    } catch {
      length = null;
    }
  }
  const travelers = Number(values.travelers);
  const hasTravelers = Number.isInteger(travelers) && travelers >= 1 && travelers <= MAX_TRAVELERS;
  const seed = JSON.stringify(values);
  const issued = new Intl.DateTimeFormat(i18n.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const field = (label: string, value: string, wide = false) => (
    <div className={wide ? 'pt-field pt-wide' : 'pt-field'}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );

  return createPortal(
    <div id="print-ticket" aria-hidden="true">
      <div className="pt-sheet">
        <div className="pt-ticket">
          <header className="pt-band">
            <div>
              <p className="pt-brand">{t('planner.pass.brand')}</p>
              <p className="pt-doc">{t('planner.pass.title')}</p>
            </div>
          </header>

          <div className="pt-route">
            <div className="pt-city">
              <span>{t('planner.pass.routeFrom')}</span>
              <strong>{t('planner.pass.from')}</strong>
            </div>
            <div className="pt-path" aria-hidden="true">
              <span className="pt-dash" />
              <span className="pt-plane">✈</span>
              <span className="pt-dash" />
            </div>
            <div className="pt-city pt-city-end">
              <span>{t('planner.pass.routeTo')}</span>
              <strong>{t('planner.pass.to')}</strong>
            </div>
          </div>

          <div className="pt-dates">
            <div>
              <span>{t('planner.pass.depart')}</span>
              <strong>
                <bdi dir="ltr">{start ?? notSet}</bdi>
              </strong>
            </div>
            <div>
              <span>{t('planner.pass.return')}</span>
              <strong>
                <bdi dir="ltr">{end ?? notSet}</bdi>
              </strong>
            </div>
            <div>
              <span>{t('planner.dates.durationLabel')}</span>
              <strong>
                {length
                  ? t('planner.dates.duration', {
                      days: t('planner.dates.days', { count: length.days }),
                      nights: t('planner.dates.nights', { count: length.nights }),
                    })
                  : notSet}
              </strong>
            </div>
          </div>

          <dl className="pt-grid">
            {field(
              t('planner.summary.travelersLabel'),
              hasTravelers ? t('planner.travelers.summary', { count: travelers }) : notSet,
            )}
            {field(
              t('planner.summary.budgetLabel'),
              isBudgetTier(values.budgetTier)
                ? t(getBudgetTierLabelKey(values.budgetTier))
                : notSet,
            )}
            {field(
              t('planner.summary.stayLabel'),
              t(getAccommodationPreferenceLabelKey(values.accommodationType)),
            )}
            {field(
              t('planner.summary.transportLabel'),
              t(getTransportPreferenceLabelKey(values.transportType)),
            )}
            {field(
              t('planner.summary.interestsLabel'),
              values.interests.length > 0
                ? values.interests.map((i) => t(getInterestLabelKey(i))).join(' · ')
                : notSet,
              true,
            )}
          </dl>

          <div className="pt-tear" aria-hidden="true">
            <span className="pt-notch pt-notch-start" />
            <span className="pt-notch pt-notch-end" />
          </div>

          <footer className="pt-stub">
            <div className="pt-meta">
              <p>
                <span>{t('planner.pass.ref')}</span>
                <strong>YT-{hashCode(seed)}</strong>
              </p>
              <p>
                <span>{t('planner.pass.issued')}</span>
                <strong>{issued}</strong>
              </p>
            </div>
            <div className="pt-bars" aria-hidden="true">
              {barWidths(seed).map((w, i) => (
                <span key={i} style={{ width: `${w * 0.45}mm` }} />
              ))}
            </div>
          </footer>
        </div>
        <p className="pt-legal">{t('planner.pass.demoTicket')}</p>
      </div>
    </div>,
    document.body,
  );
}
