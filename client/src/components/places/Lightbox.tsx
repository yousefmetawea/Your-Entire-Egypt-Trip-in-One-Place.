import { useEffect, useId, useRef } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { ImageAsset } from '../../types';
import { getGalleryKeyboardAction, getNextImageIndex } from '../../lib/gallery';
import { Button } from '../ui/Button';
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from '../ui/icons';

export interface LightboxProps {
  images: readonly ImageAsset[];
  activeIndex: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function Lightbox({ images, activeIndex, onClose, onIndexChange }: LightboxProps) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const image =
    activeIndex !== null && activeIndex >= 0 && activeIndex < images.length
      ? images[activeIndex]
      : null;
  const open = image !== null;
  const hasMultiple = images.length > 1;

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [open]);

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>): void {
    if (event.target === event.currentTarget) {
      dialogRef.current?.close();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>): void {
    if (activeIndex === null) {
      return;
    }

    const isRtl = document.documentElement.dir === 'rtl';
    const action = getGalleryKeyboardAction(event.key, isRtl);

    if (!action) {
      return;
    }

    event.preventDefault();

    if (action === 'first') {
      onIndexChange(0);
      return;
    }

    if (action === 'last') {
      onIndexChange(images.length - 1);
      return;
    }

    onIndexChange(getNextImageIndex(activeIndex, images.length, action === 'next' ? 1 : -1));
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      className="modal-panel fixed inset-0 m-auto h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-6xl overflow-hidden rounded-card border border-hairline-strong bg-primary-container p-0 text-on-primary shadow-modal backdrop:bg-primary/90 backdrop:backdrop-blur-sm open:flex open:flex-col"
    >
      <h2 id={titleId} className="sr-only">
        {t('placeDetails.gallery.label')}
      </h2>

      {image && activeIndex !== null ? (
        <>
          <div className="flex shrink-0 items-center justify-between gap-space-md border-b border-on-primary/10 px-space-md py-space-sm md:px-space-lg">
            <p className="type-label text-secondary-fixed" aria-live="polite">
              {t('placeDetails.gallery.counter', {
                index: activeIndex + 1,
                total: images.length,
              })}
            </p>
            <Button
              variant="inverse"
              size="sm"
              className="size-10 rounded-full p-0"
              aria-label={t('placeDetails.gallery.close')}
              onClick={() => dialogRef.current?.close()}
            >
              <CloseIcon />
            </Button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center p-space-sm md:p-space-lg">
            {hasMultiple ? (
              <Button
                variant="inverse"
                size="sm"
                className="absolute start-space-sm top-1/2 z-10 size-11 -translate-y-1/2 rounded-full p-0 md:start-space-md"
                aria-label={t('placeDetails.gallery.previous')}
                onClick={() => onIndexChange(getNextImageIndex(activeIndex, images.length, -1))}
              >
                <ChevronLeftIcon className="rtl:rotate-180" />
              </Button>
            ) : null}

            <img
              src={image.src}
              alt={image.alt.en}
              width={image.width}
              height={image.height}
              className="max-h-[58vh] w-auto max-w-full rounded-xl object-contain md:max-h-[66vh]"
            />

            {hasMultiple ? (
              <Button
                variant="inverse"
                size="sm"
                className="absolute end-space-sm top-1/2 z-10 size-11 -translate-y-1/2 rounded-full p-0 md:end-space-md"
                aria-label={t('placeDetails.gallery.next')}
                onClick={() => onIndexChange(getNextImageIndex(activeIndex, images.length, 1))}
              >
                <ChevronRightIcon className="rtl:rotate-180" />
              </Button>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-on-primary/10 px-space-md py-space-md md:px-space-lg">
            <p className="type-body text-on-primary">{image.alt.en}</p>
            {image.credit || image.license ? (
              <p className="type-small mt-space-xs text-on-primary/70">
                {[
                  image.credit ? t('placeDetails.gallery.credit', { credit: image.credit }) : null,
                  image.license
                    ? t('placeDetails.gallery.license', { license: image.license })
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            ) : null}
            {image.sourceUrl ? (
              <a
                href={image.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="type-label mt-space-sm inline-flex text-secondary-fixed underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary-fixed"
              >
                {t('placeDetails.gallery.source')}
              </a>
            ) : null}
          </div>
        </>
      ) : null}
    </dialog>
  );
}
