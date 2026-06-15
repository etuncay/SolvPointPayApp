import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';
import type { FraudExceptionInput } from '@/features/risk-compliance/fraud-rules/detail/domain/types';

const EMPTY: FraudExceptionInput = { customerNo: '', expiresAt: '', note: '' };

export function ExceptionModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (input: FraudExceptionInput) => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<FraudExceptionInput>(EMPTY);

  if (!open) return null;

  const handleClose = () => {
    setForm(EMPTY);
    onClose();
  };

  const submit = () => {
    if (!form.customerNo.trim() || !form.expiresAt) return;
    onConfirm(form);
    setForm(EMPTY);
    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={handleClose} role="presentation">
      <div className="modal" style={{ width: 440 }} onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-head">
          <h2>{t('fcd_action_exception')}</h2>
          <p className="t-mute fs-13">{t('fcd_exception_sub')}</p>
        </div>
        <div className="modal-body">
          <Field label={t('frd_exc_customer')} required>
            <input
              className="input mono"
              value={form.customerNo}
              onChange={(e) => setForm((f) => ({ ...f, customerNo: e.target.value }))}
            />
          </Field>
          <Field label={t('frd_exc_expires')} required>
            <input
              className="input"
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
            />
          </Field>
          <Field label={t('frd_exc_note')}>
            <textarea
              className="textarea"
              rows={2}
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            />
          </Field>
        </div>
        <div className="modal-foot">
          <Button type="button" variant="ghost" onClick={handleClose}>
            {t('ib_cancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={submit}
            disabled={!form.customerNo.trim() || !form.expiresAt}
          >
            {t('fcd_exception_save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
