import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/cn';
import type { DraftTripPlaceResult } from '../../hooks/useDraftTripPlace';
import { formatIsoDate } from '../../lib/date';
import { Button } from '../ui/Button';
import { CheckIcon, ClockIcon, PlusIcon } from '../ui/icons';

export interface AddToTripButtonProps {
  draft: DraftTripPlaceResult;
  fullWidth?: boolean;
  className?: string;
}

export function AddToTripButton({ draft, fullWidth = false, className }: AddToTripButtonProps) {
  const { t } = useTranslation();
  const { status } = draft;
  const disabled =
    status === 'checking' || status === 'adding' || status === 'added' || status === 'in-trip';
  const variant = status === 'added' || status === 'in-trip' ? 'secondary' : 'primary';
  const label = (() => {
    switch (status) {
      case 'checking':
        return t('placeDetails.addToTrip.checking');
      case 'adding':
        return t('placeDetails.addToTrip.adding');
      case 'added':
        return t('placeDetails.addToTrip.added');
      case 'in-trip':
        return t('placeDetails.addToTrip.inTrip');
      case 'error':
        return t('placeDetails.addToTrip.retry');
      default:
        return t('placeDetails.addToTrip.idle');
    }
  })();
  const icon =
    status === 'added' || status === 'in-trip' ? (
      <CheckIcon />
    ) : status === 'checking' || status === 'adding' ? (
      <ClockIcon />
    ) : (
      <PlusIcon />
    );

  return (
    <Button
      variant={variant}
      size="lg"
      fullWidth={fullWidth}
      disabled={disabled}
      aria-busy={status === 'checking' || status === 'adding'}
      startIcon={icon}
      onClick={() => void draft.add()}
      className={className}
    >
      {label}
    </Button>
  );
}

export interface AddToTripFeedbackProps {
  draft: DraftTripPlaceResult;
  compact?: boolean;
  className?: string;
}

export function AddToTripFeedback({ draft, compact = false, className }: AddToTripFeedbackProps) {
  const { t } = useTranslation();
  const date = formatIsoDate(draft.dayDate);

  if (draft.status === 'error') {
    return (
      <p role="alert" className={cn('type-small text-error', className)}>
        {t('placeDetails.addToTrip.error')}
      </p>
    );
  }

  if (draft.status === 'added' || draft.status === 'in-trip') {
    const key =
      draft.status === 'added'
        ? date
          ? 'placeDetails.addToTrip.addedNote'
          : 'placeDetails.addToTrip.addedNoteNoDate'
        : date
          ? 'placeDetails.addToTrip.inTripNote'
          : 'placeDetails.addToTrip.inTripNoteNoDate';
    const fallback =
      draft.status === 'added'
        ? t('placeDetails.addToTrip.addedGeneric')
        : t('placeDetails.addToTrip.inTripGeneric');
    const note =
      draft.tripTitle && draft.dayNumber !== null
        ? t(key, {
            trip: draft.tripTitle,
            day: draft.dayNumber,
            date: date ?? '',
          })
        : fallback;

    return (
      <div role="status" className={cn('space-y-space-xs', className)}>
        <p className="type-small text-primary">{note}</p>
        {draft.createdTrip ? (
          <p className="type-small text-on-surface-variant">
            {t('placeDetails.addToTrip.createdNote')}
          </p>
        ) : null}
        {!compact ? (
          <p className="type-small text-on-surface-variant">
            {t('placeDetails.addToTrip.demoNote')}
          </p>
        ) : null}
      </div>
    );
  }

  if (compact) {
    return null;
  }

  return (
    <p className={cn('type-small text-on-surface-variant', className)}>
      {t('placeDetails.addToTrip.demoNote')}
    </p>
  );
}
