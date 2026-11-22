import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { CurrencyCode, Place, PlaceCategory, TripDay } from '../../types';
import type { CustomActivityFields } from '../../hooks/useTripEditor';
import { getDurationLabel, isPlaceCategory, PLACE_CATEGORIES } from '../../lib/catalog';
import { getCategoryLabelKey } from '../../lib/catalog';
import { filterPlaces } from '../../lib/discover';
import { formatIsoDate, getTodayIsoDate } from '../../lib/date';
import { normalizeTime } from '../../lib/placeDetails';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Tabs } from '../ui/Tabs';
import { PlusIcon, SearchIcon } from '../ui/icons';
import { currencyOptions } from './currencyOptions';

export interface AddActivityDialogProps {
  open: boolean;
  day: TripDay;
  dayNumber: number;
  places: Place[];
  usedPlaceIds: ReadonlySet<string>;
  onClose: () => void;
  onAddPlace: (dayId: string, place: Place) => boolean;
  onAddCustom: (dayId: string, fields: CustomActivityFields) => void;
}

interface CustomFormErrors {
  title?: string;
  startTime?: string;
  duration?: string;
  cost?: string;
}

function CustomActivityForm({ onAdd }: { onAdd: (fields: CustomActivityFields) => void }) {
  const { t } = useTranslation();
  const formId = useId();
  const notesId = useId();
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [costAmount, setCostAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('EGP');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<CustomFormErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const nextErrors: CustomFormErrors = {};
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
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

    let estimatedCost: CustomActivityFields['estimatedCost'] = null;

    if (costAmount.trim()) {
      const parsed = Number(costAmount);

      if (!Number.isFinite(parsed) || parsed < 0) {
        nextErrors.cost = t('trip.builder.errors.costInvalid');
      } else {
        estimatedCost = {
          amount: parsed,
          currency,
          isEstimated: true,
          priceUpdatedAt: getTodayIsoDate(),
        };
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onAdd({
      title: trimmedTitle,
      startTime: startTime.trim() ? normalizeTime(startTime) : null,
      durationMin,
      estimatedCost,
      notes,
    });
  }

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-space-md">
      <Input
        label={t('trip.builder.fields.activityTitle')}
        value={title}
        onChange={(event) => {
          setTitle(event.target.value);
          setErrors((current) => ({ ...current, title: undefined }));
        }}
        maxLength={120}
        error={errors.title}
        placeholder={t('trip.builder.fields.activityTitlePlaceholder')}
      />

      <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
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
      </div>

      <div>
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

      <p className="type-small text-on-surface-variant">
        {t('trip.builder.fields.customPriceNote')}
      </p>

      <Button type="submit" form={formId} size="md" fullWidth startIcon={<PlusIcon />}>
        {t('trip.builder.addDialog.addCustom')}
      </Button>
    </form>
  );
}

function CatalogList({
  dayId,
  places,
  usedPlaceIds,
  onAddPlace,
  onClose,
}: {
  dayId: string;
  places: Place[];
  usedPlaceIds: ReadonlySet<string>;
  onAddPlace: (dayId: string, place: Place) => boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<PlaceCategory | 'all'>('all');
  const [error, setError] = useState<string | null>(null);
  const results = filterPlaces(places, {
    q: query,
    category: category === 'all' ? null : category,
    area: null,
    duration: null,
  });
  const categoryOptions = [
    { value: 'all', label: t('trip.builder.addDialog.allCategories') },
    ...PLACE_CATEGORIES.map((item) => ({
      value: item,
      label: t(getCategoryLabelKey(item)),
    })),
  ];

  function handleAdd(place: Place): void {
    if (onAddPlace(dayId, place)) {
      onClose();
      return;
    }

    setError(t('trip.builder.addDialog.alreadyInTrip'));
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2">
        <Input
          label={t('trip.builder.addDialog.searchLabel')}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('trip.builder.addDialog.searchPlaceholder')}
          startIcon={<SearchIcon />}
        />
        <Select
          label={t('trip.builder.addDialog.categoryLabel')}
          options={categoryOptions}
          value={category}
          onChange={(event) => {
            const value = event.target.value;
            setCategory(isPlaceCategory(value) ? value : 'all');
          }}
        />
      </div>

      {error ? (
        <p role="alert" className="mt-space-sm type-small text-error">
          {error}
        </p>
      ) : null}

      {results.length > 0 ? (
        <ul className="mt-space-md max-h-[22rem] space-y-space-sm overflow-y-auto pe-space-xs">
          {results.map((place) => {
            const used = usedPlaceIds.has(place.id);
            const duration = getDurationLabel(place.avgVisitMinutes);

            return (
              <li
                key={place.id}
                className="flex flex-wrap items-center justify-between gap-space-sm rounded-xl border border-hairline bg-surface-container-lowest p-space-md"
              >
                <div className="min-w-0">
                  <p className="type-title-sm text-primary">{place.name.en}</p>
                  <div className="mt-space-xs flex flex-wrap items-center gap-space-xs">
                    <Badge tone="neutral" size="sm">
                      {t(getCategoryLabelKey(place.category))}
                    </Badge>
                    <span className="type-small text-on-surface-variant">
                      {duration ? t(duration.key, duration.values) : t('place.durationNotListed')}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant={used ? 'ghost' : 'secondary'}
                  size="sm"
                  disabled={used}
                  onClick={() => handleAdd(place)}
                  startIcon={used ? undefined : <PlusIcon />}
                >
                  {used ? t('trip.builder.addDialog.added') : t('trip.builder.addDialog.add')}
                </Button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-space-md rounded-xl bg-surface-container-low px-space-lg py-space-xl text-center">
          <p className="type-title-sm text-primary">{t('trip.builder.addDialog.noResults')}</p>
          <p className="type-small mt-space-xs text-on-surface-variant">
            {t('trip.builder.addDialog.noResultsDescription')}
          </p>
        </div>
      )}
    </div>
  );
}

export function AddActivityDialog({
  open,
  day,
  dayNumber,
  places,
  usedPlaceIds,
  onClose,
  onAddPlace,
  onAddCustom,
}: AddActivityDialogProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'catalog' | 'custom'>('catalog');
  const date = formatIsoDate(day.date) ?? day.date;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('trip.builder.addDialog.title', { day: dayNumber })}
      description={t('trip.builder.addDialog.description', { date })}
      closeLabel={t('common.close')}
      size="md"
      footer={
        <Button type="button" variant="secondary" size="sm" onClick={onClose}>
          {t('trip.builder.done')}
        </Button>
      }
    >
      {open ? (
        <Tabs
          ariaLabel={t('trip.builder.addDialog.modeLabel')}
          variant="segmented"
          value={mode}
          onValueChange={(value) => setMode(value === 'custom' ? 'custom' : 'catalog')}
          items={[
            {
              value: 'catalog',
              label: t('trip.builder.addDialog.catalogTab'),
              content: (
                <CatalogList
                  dayId={day.id}
                  places={places}
                  usedPlaceIds={usedPlaceIds}
                  onAddPlace={onAddPlace}
                  onClose={onClose}
                />
              ),
            },
            {
              value: 'custom',
              label: t('trip.builder.addDialog.customTab'),
              content: (
                <CustomActivityForm
                  onAdd={(fields) => {
                    onAddCustom(day.id, fields);
                    onClose();
                  }}
                />
              ),
            },
          ]}
        />
      ) : null}
    </Modal>
  );
}
