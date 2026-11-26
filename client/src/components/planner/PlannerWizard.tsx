import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { PLANNER_STEPS } from '../../types';
import { useTripPlanner } from '../../hooks/useTripPlanner';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ArrowLeftIcon, ArrowRightIcon } from '../ui/icons';
import { PlannerProgress } from './PlannerProgress';
import { PlannerStepContent } from './PlannerStepContent';
import { BoardingPass } from './BoardingPass';
import { StageBackdrop } from './stage/StageBackdrop';
import { RoutePanel } from './stage/RoutePanel';
import './stage/stage.css';

export function PlannerWizard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const planner = useTripPlanner();
  const reduce = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const [resetOpen, setResetOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const stepIndex = PLANNER_STEPS.indexOf(planner.step);
  const isLastStep = stepIndex === PLANNER_STEPS.length - 1;
  const [track, setTrack] = useState<{ index: number; direction: 1 | -1 }>({
    index: stepIndex,
    direction: 1,
  });
  if (track.index !== stepIndex) {
    setTrack({ index: stepIndex, direction: stepIndex > track.index ? 1 : -1 });
  }
  const direction = track.direction;

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    headingRef.current?.focus({ preventScroll: true });
  }, [stepIndex]);

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
    <section
      aria-labelledby="planner-heading"
      className="planner-stage relative -mt-24 min-h-[100svh] overflow-clip bg-[#101C15] text-[#eef3e8] md:-mt-28"
    >
      <StageBackdrop stepIndex={stepIndex} direction={direction} />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1320px] flex-col px-5 pt-28 md:px-10 md:pt-32">
        <h1 id="planner-heading" className="sr-only">
          {t('planner.title')}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="type-label tracking-[0.22em] text-[#B6CE67]">
            {t('planner.eyebrow')}
            <span className="mx-3 text-white/30" aria-hidden="true">
              /
            </span>
            <span className="text-[#9db0a2]">
              {t('planner.stepLabel', { current: stepIndex + 1, total: PLANNER_STEPS.length })}
            </span>
          </p>
          <button
            type="button"
            onClick={() => setResetOpen(true)}
            className="cursor-pointer type-label-sm tracking-[0.12em] text-[#9db0a2] underline-offset-4 transition-colors hover:text-[#B6CE67] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B6CE67]"
          >
            {t('planner.reset')}
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 items-center gap-8 py-6 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            {planner.generateError ? (
              <p
                role="alert"
                className="mb-space-md rounded-sm border border-[#f29b8b]/50 p-space-md type-small text-[#f29b8b]"
              >
                {generateErrorText}
              </p>
            ) : null}

            <div aria-busy={planner.isSubmitting} className="min-h-[18rem]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={planner.step}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, x: direction * 36 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, x: direction * -36 }}
                  transition={{ duration: reduce ? 0.15 : 0.5, ease: [0.16, 1, 0.3, 1] }}
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
            </div>
          </div>

          <div className="lg:sticky lg:top-28 lg:col-span-5">
            <RoutePanel values={planner.values} stepIndex={stepIndex} />
          </div>
        </div>

        {isLastStep ? (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="pb-10"
          >
            <BoardingPass
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
          </motion.div>
        ) : null}

        <div className="sticky bottom-0 z-20 -mx-5 mt-auto bg-gradient-to-t from-[#101C15] via-[#101C15] via-70% to-[#101C15]/0 px-5 pb-5 pt-10 lg:via-[#101C15]/90 lg:via-100% lg:to-transparent lg:pt-8 md:-mx-10 md:px-10">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-4 lg:flex-nowrap lg:gap-x-8">
            <button
              type="button"
              onClick={planner.goBack}
              disabled={stepIndex === 0}
              className="group order-2 inline-flex min-h-12 cursor-pointer items-center justify-center gap-3 rounded-full border border-white/25 px-6 type-button text-[#eef3e8] transition-colors hover:border-[#B6CE67] hover:text-[#B6CE67] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B6CE67] disabled:pointer-events-none disabled:opacity-30 sm:px-7 lg:order-1"
            >
              <ArrowLeftIcon className="size-4 transition-transform group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1" />
              {t('planner.navigation.back')}
            </button>

            <div className="order-1 w-full min-w-0 lg:order-2 lg:flex-1">
              <PlannerProgress
                currentStep={planner.step}
                values={planner.values}
                onStepSelect={planner.goToStep}
              />
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={planner.isSubmitting}
              className="group order-3 ms-auto inline-flex min-h-12 cursor-pointer items-center justify-center gap-3 rounded-full bg-[#B6CE67] px-8 type-button font-semibold text-[#101C15] transition-[background-color,box-shadow] hover:bg-[#c8dd7e] hover:shadow-[0_10px_34px_-10px_rgba(182,206,103,0.7)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B6CE67] disabled:cursor-progress disabled:opacity-60 sm:px-10 lg:ms-0"
            >
              {isLastStep
                ? planner.isSubmitting
                  ? t('planner.navigation.generating')
                  : planner.isRegenerating
                    ? t('planner.navigation.regenerate')
                    : t('planner.navigation.generate')
                : t('planner.navigation.continue')}
              {isLastStep ? null : (
                <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              )}
            </button>
          </div>
        </div>
      </div>

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
    </section>
  );
}
