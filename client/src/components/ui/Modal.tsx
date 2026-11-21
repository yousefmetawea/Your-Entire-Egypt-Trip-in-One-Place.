import { useEffect, useId, useRef } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { CloseIcon } from './icons';

export type ModalSize = 'sm' | 'md';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  eyebrow?: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  closeLabel: string;
  size?: ModalSize;
  className?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
};

export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  description,
  children,
  footer,
  closeLabel,
  size = 'md',
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

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
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    const handleClose = () => {
      onCloseRef.current();
    };

    dialog.addEventListener('close', handleClose);

    return () => {
      dialog.removeEventListener('close', handleClose);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>): void {
    if (event.target === event.currentTarget) {
      dialogRef.current?.close();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClick={handleBackdropClick}
      className={cn(
        'modal-panel fixed inset-0 m-auto h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-hidden rounded-3xl border border-hairline bg-surface-container-lowest p-0 text-on-surface shadow-modal backdrop:bg-primary/60 backdrop:backdrop-blur-sm open:flex open:flex-col',
        sizeClasses[size],
        className,
      )}
    >
      <div className="flex shrink-0 items-start justify-between gap-space-md border-b border-hairline px-space-xl py-space-lg">
        <div className="min-w-0">
          {eyebrow ? <p className="type-label text-secondary">{eyebrow}</p> : null}
          <h2 id={titleId} className="type-card-title mt-space-xs text-primary">
            {title}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label={closeLabel}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface transition-colors hover:bg-primary hover:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
        >
          <CloseIcon className="size-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-space-xl py-space-lg">
        {description ? (
          <p id={descriptionId} className="type-body text-on-surface-variant">
            {description}
          </p>
        ) : null}
        {children}
      </div>

      {footer ? (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-space-sm border-t border-hairline px-space-xl py-space-lg">
          {footer}
        </div>
      ) : null}
    </dialog>
  );
}
