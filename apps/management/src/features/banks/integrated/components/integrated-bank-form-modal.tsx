import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';
import type { IntegratedBank, IntegratedBankInput } from '../domain/types';

type Mode = 'create' | 'edit';

type Props = {
  open: boolean;
  mode: Mode;
  bank: IntegratedBank | null;
  onClose: () => void;
  onSaveCreate: (input: IntegratedBankInput) => boolean;
  onSaveUpdate: (id: number, input: IntegratedBankInput) => boolean;
};

const EMPTY: IntegratedBankInput = {
  bankName: '',
  service: '',
  eftStartTime: '09:00',
  eftEndTime: '17:00',
  isDefaultEft: false,
  hasIbanCheck: false,
  isDefaultIbanCheck: false,
  hasFast: false,
  isDefaultFast: false,
  reconciliationFeeApplied: false,
};

export function IntegratedBankFormModal({
  open,
  mode,
  bank,
  onClose,
  onSaveCreate,
  onSaveUpdate,
}: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<IntegratedBankInput>(EMPTY);

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && bank) {
      setDraft({
        bankName: bank.bankName,
        service: bank.service,
        eftStartTime: bank.eftStartTime,
        eftEndTime: bank.eftEndTime,
        isDefaultEft: bank.isDefaultEft,
        hasIbanCheck: bank.hasIbanCheck,
        isDefaultIbanCheck: bank.isDefaultIbanCheck,
        hasFast: bank.hasFast,
        isDefaultFast: bank.isDefaultFast,
        reconciliationFeeApplied: bank.reconciliationFeeApplied,
      });
      return;
    }
    setDraft(EMPTY);
  }, [open, mode, bank]);

  if (!open) return null;

  const patch = (p: Partial<IntegratedBankInput>) =>
    setDraft((prev) => ({ ...prev, ...p }));

  const submit = () => {
    const payload: IntegratedBankInput = {
      ...draft,
      bankName: draft.bankName.trim(),
      service: draft.service.trim(),
      eftStartTime: draft.eftStartTime?.trim() ? draft.eftStartTime : null,
      eftEndTime: draft.eftEndTime?.trim() ? draft.eftEndTime : null,
      isDefaultIbanCheck: draft.hasIbanCheck ? draft.isDefaultIbanCheck : false,
      isDefaultFast: draft.hasFast ? draft.isDefaultFast : false,
    };

    const ok =
      mode === 'create'
        ? onSaveCreate(payload)
        : bank
          ? onSaveUpdate(bank.id, payload)
          : false;

    if (ok) onClose();
  };

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 560 }}
      >
        <h3 className="modal-title">{mode === 'create' ? t('ib_add') : t('ib_edit')}</h3>
        <div className="form-grid" style={{ gap: 12 }}>
          <Field label={t('ib_col_bank')} required>
            <input
              className="input fs-12"
              value={draft.bankName}
              onChange={(e) => patch({ bankName: e.target.value })}
            />
          </Field>
          <Field label={t('col_service')} required>
            <input
              className="input fs-12"
              value={draft.service}
              onChange={(e) => patch({ service: e.target.value })}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label={t('ib_col_eft_start')}>
              <input
                className="input mono fs-12"
                type="time"
                value={draft.eftStartTime ?? ''}
                onChange={(e) => patch({ eftStartTime: e.target.value || null })}
              />
            </Field>
            <Field label={t('ib_col_eft_end')}>
              <input
                className="input mono fs-12"
                type="time"
                value={draft.eftEndTime ?? ''}
                onChange={(e) => patch({ eftEndTime: e.target.value || null })}
              />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label className="row" style={{ gap: 8, alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={draft.isDefaultEft}
                onChange={(e) => patch({ isDefaultEft: e.target.checked })}
              />
              <span className="fs-12">{t('ib_col_default_eft')}</span>
            </label>

            <label className="row" style={{ gap: 8, alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={draft.reconciliationFeeApplied}
                onChange={(e) => patch({ reconciliationFeeApplied: e.target.checked })}
              />
              <span className="fs-12">{t('ib_col_recon_fee')}</span>
            </label>
          </div>

          <div className="fcard" style={{ padding: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label className="row" style={{ gap: 8, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={draft.hasIbanCheck}
                  onChange={(e) =>
                    patch({
                      hasIbanCheck: e.target.checked,
                      isDefaultIbanCheck: e.target.checked ? draft.isDefaultIbanCheck : false,
                    })
                  }
                />
                <span className="fs-12">{t('ib_col_iban')}</span>
              </label>
              <label className="row" style={{ gap: 8, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={draft.isDefaultIbanCheck}
                  disabled={!draft.hasIbanCheck}
                  onChange={(e) => patch({ isDefaultIbanCheck: e.target.checked })}
                />
                <span className="fs-12">{t('ib_col_default_iban')}</span>
              </label>

              <label className="row" style={{ gap: 8, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={draft.hasFast}
                  onChange={(e) =>
                    patch({
                      hasFast: e.target.checked,
                      isDefaultFast: e.target.checked ? draft.isDefaultFast : false,
                    })
                  }
                />
                <span className="fs-12">{t('ib_col_fast')}</span>
              </label>
              <label className="row" style={{ gap: 8, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={draft.isDefaultFast}
                  disabled={!draft.hasFast}
                  onChange={(e) => patch({ isDefaultFast: e.target.checked })}
                />
                <span className="fs-12">{t('ib_col_default_fast')}</span>
              </label>
            </div>
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: 16 }}>
          <Button variant="ghost" onClick={onClose}>
            {t('lf_cancel_back')}
          </Button>
          <Button variant="primary" onClick={submit}>
            {t('ib_save')}
          </Button>
        </div>
      </div>
    </div>
  );
}

