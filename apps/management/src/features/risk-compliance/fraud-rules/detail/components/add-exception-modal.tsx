import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';
import type { FraudExceptionInput } from '../domain/types';

const EMPTY: FraudExceptionInput = { customerNo: '', expiresAt: '', note: '' };

export function AddExceptionModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: FraudExceptionInput) => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<FraudExceptionInput>(EMPTY);

  if (!open) return null;

  const handleClose = () => {
    setForm(EMPTY);
    onClose();
  };

  const handleSubmit = () => {
    onSubmit(form);
    setForm(EMPTY);
  };

  return (
    <div className="modal-backdrop open" onClick={handleClose} role="presentation">
      <div className="modal" style={{ width: 440 }} onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-head">
          <h2>{t('frd_add_exception')}</h2>
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
          <Button type="button" variant="primary" onClick={handleSubmit}>
            {t('ib_save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
