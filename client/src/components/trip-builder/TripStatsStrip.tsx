import { useEffect } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { ItinerarySummary } from '../../lib/builder/summary';
import { formatMoney } from '../../lib/placeDetails';
import type { CurrencyCode } from '../../types';

function Money({ amount, currency }: { amount: number; currency: CurrencyCode }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? amount : 0);
  const text = useTransform(mv, (v) => formatMoney({ amount: Math.round(v), currency }));

  useEffect(() => {
    if (reduce) {
      mv.set(amount);
      return;
    }
    const controls = animate(mv, amount, { duration: 1.1, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [amount, reduce, mv]);

  return <motion.span>{text}</motion.span>;
}

function Tile({
  label,
  index,
  children,
  accent = false,
}: {
  label: string;
  index: number;
  children: React.ReactNode;
  accent?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.35 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className={
        accent
          ? 'rounded-2xl border border-[#B6CE67]/35 bg-[#B6CE67]/10 px-space-lg py-space-md'
          : 'rounded-2xl border border-white/12 bg-surface-container px-space-lg py-space-md'
      }
    >
      <dt className="type-label-sm text-on-surface-variant">{label}</dt>
      <dd
        className={
          accent
            ? 'mt-space-xs font-display text-[1.65rem] leading-tight sm:text-3xl text-[#B6CE67] md:text-4xl'
            : 'mt-space-xs font-display text-xl leading-tight sm:text-2xl text-primary md:text-3xl'
        }
      >
        {children}
      </dd>
    </motion.div>
  );
}

export function TripStatsStrip({
  summary,
  dayCount,
}: {
  summary: ItinerarySummary;
  dayCount: number;
}) {
  const { t } = useTranslation();

  return (
    <dl className="grid grid-cols-2 gap-space-md lg:grid-cols-4">
      <Tile accent index={0} label={t('trip.builder.summary.costTitle')}>
        {summary.costs.length > 0 ? (
          summary.costs.map((cost, i) => (
            <span key={cost.currency}>
              {i > 0 ? ' + ' : null}
              <Money amount={cost.groupTotal} currency={cost.currency} />
            </span>
          ))
        ) : (
          <span className="text-on-surface-variant">{'\u2014'}</span>
        )}
      </Tile>
      <Tile index={1} label={t('trip.summary.daysLabel')}>
        {t('trip.summary.dayCount', { count: dayCount })}
      </Tile>
      <Tile index={2} label={t('trip.summary.activitiesLabel')}>
        {t('trip.summary.activityCount', { count: summary.activityCount })}
      </Tile>
      <Tile index={3} label={t('trip.summary.placesLabel')}>
        {t('trip.summary.placeCount', { count: summary.placeCount })}
      </Tile>
    </dl>
  );
}
