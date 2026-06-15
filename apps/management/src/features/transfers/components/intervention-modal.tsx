import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';

export type InterventionVariant = 'hold' | 'unblock' | 'cancel';

type Props = {
  open: boolean;
  variant: InterventionVariant;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

export function InterventionModal({ open, variant, onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');

  if (!open) return null;

  const titleKey = `td_modal_${variant}_title` as const;
  const descKey = `td_modal_${variant}_desc` as const;
  const confirmKey = `td_modal_${variant}_confirm` as const;

  const submit = () => {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
    setReason('');
    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={onClose} role="presentation">
      <div className="modal" style={{ width: 440 }} onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-head">
          <h2>{t(titleKey)}</h2>
          <p>{t(descKey)}</p>
        </div>
        <div className="modal-body">
          <Field label={t('sj_manual_reason')} required>
            <textarea
              className="textarea"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('td_reason_placeholder')}
            />
          </Field>
        </div>
        <div className="modal-foot">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('td_cancel_btn')}
          </Button>
          <Button
            type="button"
            variant={variant === 'cancel' ? 'danger' : 'primary'}
            onClick={submit}
            disabled={!reason.trim()}
          >
            {t(confirmKey)}
          </Button>
        </div>
      </div>
    </div>
  );
}
