import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string, blockEndDate?: string) => void;
};

export function BlockModal({ open, onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [endDate, setEndDate] = useState('');
  const today = new Date().toISOString().slice(0, 10);

  if (!open) return null;

  const submit = () => {
    if (!reason.trim()) return;
    if (endDate && endDate <= today) return;
    onConfirm(reason.trim(), endDate || undefined);
    setReason('');
    setEndDate('');
    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={onClose} role="presentation">
      <div className="modal" style={{ width: 480 }} onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-head">
          <h2 style={{ color: 'var(--danger-fg)' }}>{t('if_block_title')}</h2>
          <p>{t('if_block_desc')}</p>
        </div>
        <div className="modal-body" style={{ gap: 14 }}>
          <Field label={t('if_block_reason')} required>
            <textarea
              className="textarea"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>
          <Field label={t('if_block_end')} hint={t('if_block_end_hint')}>
            <input className="input" type="date" min={today} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </Field>
        </div>
        <div className="modal-foot" style={{ justifyContent: 'flex-end', gap: 8 }}>
          <Button type="button" onClick={onClose}>
            {t('if_cancel')}
          </Button>
          <Button type="button" variant="danger" onClick={submit} disabled={!reason.trim()}>
            {t('if_block_confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
}
