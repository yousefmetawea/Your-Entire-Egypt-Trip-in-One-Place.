import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { CurrencyCode, TripActivity, TripDay } from '../../types';
import type { ActivityPatch } from '../../lib/builder/editor';
import { formatIsoDate, getTodayIsoDate } from '../../lib/date';
import { formatPriceQuote, formatUpdatedDate, normalizeTime } from '../../lib/placeDetails';
import { currencyOptions } from './currencyOptions';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export interface ActivityEditFormProps {
  activity: TripActivity;
  day: TripDay;
  days: TripDay[];
  onSave: (patch: ActivityPatch, targetDayId: string) => void;
  onCancel: () => void;
}

interface FormErrors {
  title?: string;
  startTime?: string;
  duration?: string;
  cost?: string;
}

export function ActivityEditForm({ activity, day, days, onSave, onCancel }: ActivityEditFormProps) {
  const { t } = useTranslation();
  const formId = useId();
  const notesId = useId();
  const customSource = activity.source.type === 'custom' ? activity.source : null;
  const isCustom = customSource !== null;
  const [title, setTitle] = useState(customSource?.title ?? '');
  const [startTime, setStartTime] = useState(activity.startTime ?? '');
  const [duration, setDuration] = useState(
    activity.durationMin === null ? '' : String(activity.durationMin),
  );
  const [costAmount, setCostAmount] = useState(
    isCustom && activity.estimatedCost ? String(activity.estimatedCost.amount) : '',
  );
  const [currency, setCurrency] = useState<CurrencyCode>(
    isCustom && activity.estimatedCost ? activity.estimatedCost.currency : 'EGP',
  );
  const [notes, setNotes] = useState(activity.notes ?? '');
  const [targetDayId, setTargetDayId] = useState(day.id);
  const [errors, setErrors] = useState<FormErrors>({});

  const updated = formatUpdatedDate(activity.estimatedCost?.priceUpdatedAt);
  const dayOptions = days.map((item, index) => ({
    value: item.id,
    label: t('trip.builder.editForm.dayOption', {
      number: index + 1,
      date: formatIsoDate(item.date) ?? item.date,
    }),
  }));

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    const trimmedTitle = title.trim();

    if (isCustom && !trimmedTitle) {
      nextErrors.title = t('trip.builder.errors.titleRequired');
    }

    if (startTime.trim() && !normalizeTime(startTime)) {
      nextErrors.startTime = t('trip.builder.errors.timeInvalid');
    }

    let durationMin: number | null = null;

    if (duration.trim()) {
      const parsed = Number(duration);

      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 1440) {
        nextErrors.duration = t('trip.builder.errors.durationInvalid');
      } else {
        durationMin = parsed;
      }
    }

    let estimatedCost = activity.estimatedCost;
    let source = activity.source;

    if (isCustom) {
      if (costAmount.trim()) {
        const parsed = Number(costAmount);

        if (!Number.isFinite(parsed) || parsed < 0) {
          nextErrors.cost = t('trip.builder.errors.costInvalid');
        } else {
          const priceUpdatedAt =
            activity.estimatedCost &&
            activity.estimatedCost.amount === parsed &&
            activity.estimatedCost.currency === currency
              ? activity.estimatedCost.priceUpdatedAt
              : getTodayIsoDate();

          estimatedCost = {
            amount: parsed,
            currency,
            isEstimated: true,
            priceUpdatedAt,
          };
        }
      } else {
        estimatedCost = null;
      }

      source = { type: 'custom', title: trimmedTitle };
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave(
      {
        startTime: startTime.trim() ? normalizeTime(startTime) : null,
        durationMin,
        estimatedCost,
        notes: notes.trim() || null,
        ...(isCustom ? { source } : {}),
      },
      targetDayId,
    );
  }

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      noValidate
      className="mt-space-md border-t border-hairline pt-space-md"
    >
      <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
        {isCustom ? (
          <div className="sm:col-span-2">
            <Input
              label={t('trip.builder.fields.activityTitle')}
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setErrors((current) => ({ ...current, title: undefined }));
              }}
              maxLength={120}
              error={errors.title}
              autoFocus
            />
          </div>
        ) : null}

        <Input
          label={t('trip.builder.fields.startTime')}
          type="time"
          value={startTime}
          onChange={(event) => {
            setStartTime(event.target.value);
            setErrors((current) => ({ ...current, startTime: undefined }));
          }}
          hint={t('trip.builder.fields.startTimeHint')}
          error={errors.startTime}
        />

        <Input
          label={t('trip.builder.fields.duration')}
          type="number"
          inputMode="numeric"
          min={1}
          max={1440}
          step={5}
          value={duration}
          onChange={(event) => {
            setDuration(event.target.value);
            setErrors((current) => ({ ...current, duration: undefined }));
          }}
          hint={t('trip.builder.fields.durationHint')}
          error={errors.duration}
        />

        {isCustom ? (
          <>
            <Input
              label={t('trip.builder.fields.cost')}
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={costAmount}
              onChange={(event) => {
                setCostAmount(event.target.value);
                setErrors((current) => ({ ...current, cost: undefined }));
              }}
              hint={t('trip.builder.fields.costHint')}
              error={errors.cost}
            />
            <Select
              label={t('trip.builder.fields.currency')}
              options={currencyOptions}
              value={currency}
              onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
            />
            <p className="type-small text-on-surface-variant sm:col-span-2">
              {t('trip.builder.fields.customPriceNote')}
            </p>
          </>
        ) : (
          <div className="rounded-xl bg-surface-container-low p-space-md sm:col-span-2">
            <p className="type-label-sm text-primary">{t('trip.builder.fields.placePriceLabel')}</p>
            <p className="type-small mt-space-xs text-on-surface-variant">
              {activity.estimatedCost
                ? `${formatPriceQuote(activity.estimatedCost)}${
                    updated ? ` · ${t('trip.activity.lastUpdated', { date: updated })}` : ''
                  }`
                : t('trip.builder.fields.priceMissing')}
            </p>
            <p className="type-small mt-space-xs text-on-surface-variant">
              {t('trip.builder.fields.placePriceNote')}
            </p>
          </div>
        )}

        <div className="sm:col-span-2">
          <label
            htmlFor={notesId}
            className="mb-space-xs block font-sans text-label-md text-on-surface"
          >
            {t('trip.builder.fields.notes')}
          </label>
          <textarea
            id={notesId}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            placeholder={t('trip.builder.fields.notesPlaceholder')}
            className="w-full rounded-xl border border-hairline-strong bg-surface-container-lowest px-space-md py-space-sm font-sans text-body-md text-on-surface placeholder:text-on-surface-variant/80 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
          />
        </div>

        <div className="sm:col-span-2">
          <Select
            label={t('trip.builder.fields.day')}
            options={dayOptions}
            value={targetDayId}
            onChange={(event) => setTargetDayId(event.target.value)}
            hint={t('trip.builder.fields.moveHint')}
          />
        </div>
      </div>

      <div className="mt-space-md flex flex-wrap items-center justify-end gap-space-sm">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          {t('trip.builder.cancel')}
        </Button>
        <Button type="submit" form={formId} size="sm">
          {t('trip.builder.editForm.save')}
        </Button>
      </div>
    </form>
  );
}
