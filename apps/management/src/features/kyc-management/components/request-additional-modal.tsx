import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';
import type { KycNoteInput } from '../domain/types';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (input: KycNoteInput) => void;
};

export function RequestAdditionalModal({ open, onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  const [note, setNote] = useState('');

  if (!open) return null;

  const submit = () => {
    if (!note.trim()) return;
    onConfirm({ evaluationNote: note.trim() });
    setNote('');
    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={onClose} role="presentation">
      <div className="modal" style={{ width: 480 }} onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-head">
          <h2>{t('kyc_action_request')}</h2>
          <p>{t('kyc_modal_request_desc')}</p>
        </div>
        <div className="modal-body" style={{ gap: 14 }}>
          <Field label={t('kyc_eval_note')} required>
            <textarea
              className="textarea"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('kyc_eval_note_ph')}
            />
          </Field>
        </div>
        <div className="modal-foot" style={{ justifyContent: 'flex-end', gap: 8 }}>
          <Button type="button" onClick={onClose}>{t('cancel')}</Button>
          <Button type="button" variant="primary" onClick={submit}>{t('confirm')}</Button>
        </div>
      </div>
    </div>
  );
}
