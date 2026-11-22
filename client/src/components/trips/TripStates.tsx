import { useTranslation } from 'react-i18next';
import { AppLink } from '../../app/AppLink';
import { EmptyState } from '../common/EmptyState';
import { Button, ButtonLink } from '../ui/Button';
import { Container } from '../ui/Container';
import { Section } from '../ui/Section';
import { CompassIcon, InfoIcon } from '../ui/icons';

export type TripStateStatus = 'not-found' | 'error';

export interface TripStatesProps {
  status: TripStateStatus;
  onRetry?: () => void;
}

export function TripStates({ status, onRetry }: TripStatesProps) {
  const { t } = useTranslation();
  const isNotFound = status === 'not-found';

  return (
    <Section
      tone="canvas"
      spacing="none"
      className="flex min-h-[60vh] items-center py-space-2xl"
      aria-label={isNotFound ? t('trip.states.notFoundTitle') : t('trip.states.errorTitle')}
    >
      <Container>
        <EmptyState
          title={isNotFound ? t('trip.states.notFoundTitle') : t('trip.states.errorTitle')}
          description={
            isNotFound ? t('trip.states.notFoundDescription') : t('trip.states.errorDescription')
          }
          role={isNotFound ? 'status' : 'alert'}
          headingLevel={1}
          icon={isNotFound ? <CompassIcon /> : <InfoIcon />}
          actions={
            <>
              {!isNotFound && onRetry ? (
                <Button variant="secondary" size="md" onClick={onRetry}>
                  {t('trip.states.retry')}
                </Button>
              ) : null}
              <ButtonLink as={AppLink} href="/plan" variant="primary" size="md">
                {t('trip.states.backToPlanner')}
              </ButtonLink>
              <ButtonLink as={AppLink} href="/discover" variant="secondary" size="md">
                {t('trip.states.backToDiscover')}
              </ButtonLink>
            </>
          }
        />
      </Container>
    </Section>
  );
}
