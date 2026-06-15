import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';
import type { FinancialReconciliation } from '../domain/types';

type Props = {
  open: boolean;
  row: FinancialReconciliation | null;
  onClose: () => void;
  onConfirm: (description: string) => void;
  loading?: boolean;
};

export function FinReconAdjustModal({ open, row, onClose, onConfirm, loading }: Props) {
  const { t } = useTranslation();
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (open) setDescription('');
  }, [open, row?.id]);

  if (!open || !row) return null;

  const submit = () => {
    if (!description.trim()) return;
    onConfirm(description.trim());
  };

  return (
    <div className="modal-backdrop open" onClick={onClose} role="presentation">
      <div className="modal" style={{ width: 520 }} onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-head">
          <h2>{t('finrec_adjust_title')}</h2>
          <p className="t-mute fs-12">{t('finrec_adjust_sub', { id: row.id })}</p>
        </div>
        <div className="modal-body" style={{ gap: 14 }}>
          <Field label={t('rpt_col_desc')} required>
            <textarea
              className="textarea"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('finrec_adjust_ph')}
            />
          </Field>
        </div>
        <div className="modal-foot" style={{ justifyContent: 'flex-end', gap: 8 }}>
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            {t('lf_cancel_back')}
          </Button>
          <Button type="button" variant="primary" onClick={submit} disabled={!description.trim() || loading}>
            {t('finrec_adjust_confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
}
