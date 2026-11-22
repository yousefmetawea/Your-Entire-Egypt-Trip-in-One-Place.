import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

const MAX_TITLE_LENGTH = 120;

export interface BuilderTitleDialogProps {
  title: string;
  onClose: () => void;
  onSave: (title: string) => void;
}

export function BuilderTitleDialog({ title, onClose, onSave }: BuilderTitleDialogProps) {
  const { t } = useTranslation();
  const formId = useId();
  const [value, setValue] = useState(title);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const trimmed = value.trim();

    if (!trimmed) {
      setError(t('trip.builder.titleDialog.required'));
      return;
    }

    if (trimmed.length > MAX_TITLE_LENGTH) {
      setError(t('trip.builder.titleDialog.tooLong'));
      return;
    }

    onSave(trimmed);
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={t('trip.builder.titleDialog.title')}
      description={t('trip.builder.titleDialog.description')}
      closeLabel={t('common.close')}
      size="sm"
      footer={
        <>
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            {t('trip.builder.cancel')}
          </Button>
          <Button type="submit" form={formId} size="sm">
            {t('trip.builder.titleDialog.save')}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate>
        <Input
          label={t('trip.builder.titleDialog.label')}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError(null);
          }}
          maxLength={MAX_TITLE_LENGTH}
          error={error ?? undefined}
          autoFocus
        />
      </form>
    </Modal>
  );
}
