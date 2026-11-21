import { useTranslation } from 'react-i18next';
import { AppLink } from '../../app/AppLink';
import { EmptyState } from '../common/EmptyState';
import { Button, ButtonLink } from '../ui/Button';
import { Container } from '../ui/Container';
import { Section } from '../ui/Section';
import { CompassIcon, InfoIcon } from '../ui/icons';

export type PlaceDetailsStateStatus = 'not-found' | 'error';

export interface PlaceDetailsStatesProps {
  status: PlaceDetailsStateStatus;
  onRetry?: () => void;
}

export function PlaceDetailsStates({ status, onRetry }: PlaceDetailsStatesProps) {
  const { t } = useTranslation();
  const isNotFound = status === 'not-found';

  return (
    <Section
      tone="canvas"
      spacing="none"
      className="flex min-h-[60vh] items-center py-space-2xl"
      aria-label={
        isNotFound ? t('placeDetails.states.notFoundTitle') : t('placeDetails.states.errorTitle')
      }
    >
      <Container>
        <EmptyState
          title={
            isNotFound
              ? t('placeDetails.states.notFoundTitle')
              : t('placeDetails.states.errorTitle')
          }
          description={
            isNotFound
              ? t('placeDetails.states.notFoundDescription')
              : t('placeDetails.states.errorDescription')
          }
          role={isNotFound ? 'status' : 'alert'}
          headingLevel={1}
          icon={isNotFound ? <CompassIcon /> : <InfoIcon />}
          actions={
            <>
              {!isNotFound && onRetry ? (
                <Button variant="secondary" size="md" onClick={onRetry}>
                  {t('placeDetails.states.retry')}
                </Button>
              ) : null}
              <ButtonLink as={AppLink} href="/discover" variant="primary" size="md">
                {t('placeDetails.states.backToDiscover')}
              </ButtonLink>
            </>
          }
        />
      </Container>
    </Section>
  );
}
