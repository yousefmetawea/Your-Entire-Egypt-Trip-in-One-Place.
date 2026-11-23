import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { PLANNER_STEPS } from '../../types';
import { useTripPlanner } from '../../hooks/useTripPlanner';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Container } from '../ui/Container';
import { Modal } from '../ui/Modal';
import { Section } from '../ui/Section';
import { ArrowLeftIcon, ArrowRightIcon } from '../ui/icons';
import { PlannerProgress } from './PlannerProgress';
import { PlannerStepContent } from './PlannerStepContent';
import { PlannerSummary } from './PlannerSummary';

export function PlannerWizard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const planner = useTripPlanner();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const [resetOpen, setResetOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const stepIndex = PLANNER_STEPS.indexOf(planner.step);
  const isLastStep = stepIndex === PLANNER_STEPS.length - 1;

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    headingRef.current?.focus();
  }, [planner.step]);

  async function runGenerate(): Promise<void> {
    const result = await planner.generate();

    if (result.ok) {
      navigate(`/trip/${result.trip.id}`);
      return;
    }

    if (result.reason === 'validation') {
      headingRef.current?.focus();
    }
  }

  function handleGenerate(): void {
    if (planner.hasExistingDraft) {
      setConfirmOpen(true);
      return;
    }

    void runGenerate();
  }

  function handleConfirmGenerate(): void {
    setConfirmOpen(false);
    void runGenerate();
  }

  function handleNext(): void {
    if (isLastStep) {
      handleGenerate();
      return;
    }

    planner.goNext();
  }

  function handleReset(): void {
    planner.reset();
    setResetOpen(false);
  }

  const generateErrorText =
    planner.generateError === 'no-matches'
      ? t('planner.summary.noMatches')
      : t('planner.summary.error');

  return (
    <Section tone="canvas" spacing="md" className="min-h-screen" aria-labelledby="planner-heading">
      <Container>
        <Card variant="surface" padding="lg" className="mb-space-xl">
          <div className="flex flex-col gap-space-md md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-space-sm">
                <Badge tone="bronze" size="sm">
                  {t('planner.eyebrow')}
                </Badge>
                <span className="type-label text-on-surface-variant">
                  {t('planner.stepLabel', {
                    current: stepIndex + 1,
                    total: PLANNER_STEPS.length,
                  })}
                </span>
              </div>

              <h1 id="planner-heading" className="type-headline mt-space-sm text-primary">
                {t('planner.title')}
              </h1>
              <p className="type-body-lg mt-space-sm max-w-2xl text-on-surface-variant">
                {t('planner.description')}
              </p>
              <p className="type-small mt-space-sm text-on-surface-variant">
                {t('planner.demoNote')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-space-sm">
              <Badge tone="outline" size="sm">
                {t('planner.demoBadge')}
              </Badge>
              <Button type="button" variant="ghost" size="sm" onClick={() => setResetOpen(true)}>
                {t('planner.reset')}
              </Button>
            </div>
          </div>

          <div className="mt-space-lg border-t border-hairline pt-space-md">
            <PlannerProgress
              currentStep={planner.step}
              values={planner.values}
              onStepSelect={planner.goToStep}
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 items-start gap-gutter-lg lg:grid-cols-12">
          <div className="lg:col-span-7">
            {planner.generateError ? (
              <p
                role="alert"
                className="mb-space-md rounded-xl bg-error-container p-space-md type-small text-on-error-container"
              >
                {generateErrorText}
              </p>
            ) : null}

            <Card
              variant="surface"
              padding="lg"
              aria-busy={planner.isSubmitting}
              className="overflow-hidden"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={planner.step}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                >
                  <PlannerStepContent
                    step={planner.step}
                    values={planner.values}
                    errors={planner.errors}
                    headingRef={headingRef}
                    onChange={planner.updateValues}
                    onToggleInterest={planner.toggleInterest}
                  />
                </motion.div>
              </AnimatePresence>
            </Card>

            <div className="mt-space-lg flex flex-col-reverse items-stretch justify-between gap-space-sm sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={planner.goBack}
                disabled={stepIndex === 0}
                startIcon={<ArrowLeftIcon className="rtl:rotate-180" />}
                className="sm:w-auto"
              >
                {t('planner.navigation.back')}
              </Button>

              <div className="flex flex-col items-stretch gap-space-xs sm:flex-row sm:items-center">
                <span className="type-small text-center text-on-surface-variant sm:text-end">
                  {t('planner.navigation.stepStatus', {
                    current: stepIndex + 1,
                    total: PLANNER_STEPS.length,
                  })}
                </span>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleNext}
                  disabled={planner.isSubmitting}
                  endIcon={isLastStep ? undefined : <ArrowRightIcon className="rtl:rotate-180" />}
                >
                  {isLastStep
                    ? planner.isSubmitting
                      ? t('planner.navigation.generating')
                      : planner.isRegenerating
                        ? t('planner.navigation.regenerate')
                        : t('planner.navigation.generate')
                    : t('planner.navigation.continue')}
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:col-span-5">
            <PlannerSummary
              values={planner.values}
              savedPlaceIds={planner.savedPlaceIds}
              draftStatus={planner.draftStatus}
              includeSavedPlaces={planner.includeSavedPlaces}
              isSubmitting={planner.isSubmitting}
              generateError={planner.generateError}
              hasExistingDraft={planner.hasExistingDraft}
              isRegenerating={planner.isRegenerating}
              onIncludeSavedPlacesChange={planner.setIncludeSavedPlaces}
              onGenerate={handleGenerate}
            />
          </div>
        </div>
      </Container>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title={t('planner.resetTitle')}
        description={t('planner.resetDescription')}
        closeLabel={t('common.close')}
        size="sm"
        footer={
          <>
            <Button type="button" variant="secondary" size="sm" onClick={() => setResetOpen(false)}>
              {t('planner.resetCancel')}
            </Button>
            <Button type="button" variant="primary" size="sm" onClick={handleReset}>
              {t('planner.resetConfirm')}
            </Button>
          </>
        }
      />

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={
          planner.isRegenerating
            ? t('planner.summary.confirmGeneratedTitle')
            : t('planner.summary.confirmTitle')
        }
        description={
          planner.isRegenerating
            ? t('planner.summary.confirmGeneratedDescription')
            : t('planner.summary.confirmDescription')
        }
        closeLabel={t('common.close')}
        size="sm"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setConfirmOpen(false)}
            >
              {t('planner.summary.confirmCancel')}
            </Button>
            <Button type="button" variant="primary" size="sm" onClick={handleConfirmGenerate}>
              {planner.isRegenerating
                ? t('planner.summary.confirmGeneratedAction')
                : t('planner.summary.confirmAction')}
            </Button>
          </>
        }
      />
    </Section>
  );
}
