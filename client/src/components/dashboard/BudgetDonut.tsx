import type { BudgetAnalyticsResult } from '../../lib/dashboard/budgetAnalytics';
import { Card } from '../ui/Card';

export interface BudgetDonutProps {
  analytics: BudgetAnalyticsResult | null;
}

const CIRCUMFERENCE = 2 * Math.PI * 48; // ~301.59

function computeSliceOffsets(slices: BudgetAnalyticsResult['slices'], totalUtilized: number) {
  let currentOffset = 0;
  return slices.map((slice) => {
    const sliceLength = totalUtilized > 0 ? (slice.amount / totalUtilized) * CIRCUMFERENCE : 0;
    const dashArray = `${sliceLength.toFixed(1)} ${(CIRCUMFERENCE - sliceLength).toFixed(1)}`;
    const dashOffset = (-currentOffset).toFixed(1);
    currentOffset += sliceLength;

    return {
      ...slice,
      dashArray,
      dashOffset,
    };
  });
}

export function BudgetDonut({ analytics }: BudgetDonutProps) {
  if (!analytics || (analytics.totalUtilized === 0 && analytics.slices.length === 0)) {
    return (
      <Card
        variant="surface"
        className="flex flex-col gap-space-md p-space-md sm:p-space-lg rounded-[24px] border border-hairline/60"
      >
        <div>
          <span className="type-label-sm uppercase tracking-widest text-secondary font-semibold">
            Expense Ledger
          </span>
          <h3 className="font-serif text-xl text-primary font-medium mt-0.5">
            Budget &amp; Cost Overview
          </h3>
        </div>
        <div className="py-space-xl text-center flex flex-col items-center justify-center gap-space-xs bg-surface-container-low rounded-xl p-space-md">
          <p className="type-body text-xs text-on-surface-variant max-w-sm">
            No estimated costs recorded yet. Add activities or select accommodation to see your
            expense breakdown.
          </p>
        </div>
      </Card>
    );
  }

  const renderedSlices = computeSliceOffsets(analytics.slices, analytics.totalUtilized);

  const levelColor =
    analytics.budgetLevel === 'over'
      ? 'text-danger font-semibold'
      : analytics.budgetLevel === 'near'
        ? 'text-warning font-semibold'
        : 'text-secondary font-semibold';

  return (
    <Card
      variant="surface"
      className="flex flex-col gap-space-md p-space-md sm:p-space-lg rounded-[24px] border border-hairline/60"
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="type-label-sm uppercase tracking-widest text-secondary font-semibold">
            Expense Ledger
          </span>
          <h3 className="font-serif text-xl text-primary font-medium mt-0.5">
            Budget &amp; Cost Overview
          </h3>
        </div>

        <span className="type-label-sm px-space-sm py-1 bg-surface-container text-on-surface-variant rounded-full font-semibold">
          {analytics.currency}
        </span>
      </div>

      {/* Donut and Legend */}
      <div className="flex flex-col sm:flex-row items-center gap-space-lg py-space-xs">
        {/* SVG Donut */}
        <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
          <svg
            className="w-full h-full -rotate-90"
            viewBox="0 0 120 120"
            role="img"
            aria-label={`Donut chart showing total utilized ${analytics.totalUtilized} ${analytics.currency}`}
          >
            {/* Background Ring */}
            <circle cx="60" cy="60" r="48" fill="none" stroke="#F1EDE6" strokeWidth="12" />

            {/* Slices */}
            {renderedSlices.map((slice) => (
              <circle
                key={slice.id}
                cx="60"
                cy="60"
                r="48"
                fill="none"
                stroke={slice.color}
                strokeWidth="12"
                strokeDasharray={slice.dashArray}
                strokeDashoffset={slice.dashOffset}
                strokeLinecap="butt"
              />
            ))}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
            <span className="type-label-sm uppercase text-[9px] text-on-surface-variant tracking-wider">
              Total Utilized
            </span>
            <span className="font-serif text-lg sm:text-xl text-primary font-semibold leading-tight">
              {analytics.totalUtilized.toLocaleString()} {analytics.currency}
            </span>
            {analytics.budgetCap && (
              <span className="type-small text-[10px] text-on-surface-variant mt-0.5">
                of {analytics.budgetCap.amount.toLocaleString()} Cap
              </span>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 flex flex-col gap-space-xs w-full">
          {analytics.slices.map((slice) => (
            <div
              key={slice.id}
              className="flex items-center justify-between py-1 border-b border-hairline/30 text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: slice.color }}
                  aria-hidden="true"
                />
                <span className="type-body text-xs text-primary">{slice.label}</span>
              </div>
              <span className="type-title text-xs text-primary font-semibold">
                {slice.amount > 0 ? (
                  <>
                    {slice.amount.toLocaleString()} {analytics.currency}{' '}
                    <span className="text-on-surface-variant text-[11px] font-normal">
                      ({slice.percentage}%)
                    </span>
                  </>
                ) : (
                  <span className="text-on-surface-variant italic font-normal">Not priced yet</span>
                )}
              </span>
            </div>
          ))}

          {/* Remaining Reserve if budget is set */}
          {analytics.budgetCap && analytics.remainingReserve !== null && (
            <div className="mt-space-xs pt-space-xs border-t border-hairline flex justify-between text-xs">
              <span className="type-body text-xs text-on-surface-variant">Remaining Reserve</span>
              <span className={levelColor}>
                {analytics.remainingReserve.toLocaleString()} {analytics.currency}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Unpriced items disclosure */}
      {analytics.unpricedItemsTotal > 0 && (
        <div className="p-space-xs bg-surface-container-low rounded-lg text-start border border-hairline/40">
          <p className="type-small text-[11px] text-on-surface-variant">
            <strong>Partial estimate note:</strong> Based on priced items only.{' '}
            {analytics.unpricedItemsTotal}{' '}
            {analytics.unpricedItemsTotal === 1 ? 'item is' : 'items are'} unpriced and not included
            in this total.
          </p>
        </div>
      )}

      {/* Mixed currency note if applicable */}
      {analytics.hasMixedCurrencies && (
        <div className="p-space-xs bg-surface-container-low rounded-lg text-start border border-hairline/40">
          <p className="type-small text-[11px] text-on-surface-variant">
            Multiple currencies present ({analytics.currenciesPresent.join(', ')}). Totals are
            displayed in {analytics.currency} without automated currency conversion.
          </p>
        </div>
      )}

      {/* Screen-reader accessible data table for AA compliance */}
      <div className="sr-only">
        <table>
          <caption>Expense Breakdown Ledger</caption>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Amount</th>
              <th scope="col">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {analytics.slices.map((slice) => (
              <tr key={slice.id}>
                <th scope="row">{slice.label}</th>
                <td>
                  {slice.amount} {analytics.currency}
                </td>
                <td>{slice.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
