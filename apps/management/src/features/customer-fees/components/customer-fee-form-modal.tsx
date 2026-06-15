import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';
import {
  COUNTRY_OPTIONS,
  CURRENCY_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
  type CustomerFee,
  type CustomerFeeInput,
  type FeeCountry,
  type FeeCurrency,
  type FeeTransactionType,
} from '../domain/types';

type Mode = 'create' | 'edit';

type Props = {
  open: boolean;
  mode: Mode;
  fee: CustomerFee | null;
  onClose: () => void;
  onSave: (input: CustomerFeeInput, id?: number) => void;
};

const EMPTY: CustomerFeeInput = {
  transactionType: 'WalletToPerson',
  currency: 'TRY',
  lowerLimit: 0,
  fixedFee: 0,
  variableFeePct: 0,
  startDate: null,
  endDate: null,
  sourceCountry: 'ALL',
  targetCountry: 'ALL',
};

export function CustomerFeeFormModal({ open, mode, fee, onClose, onSave }: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<CustomerFeeInput>(EMPTY);

  const txLabel = useMemo(
    () =>
      Object.fromEntries(
        TRANSACTION_TYPE_OPTIONS.map((tx) => [tx, t(`cfe_tx_${tx}`, tx)]),
      ) as Record<FeeTransactionType, string>,
    [t],
  );

  const countryLabel = useMemo(
    () =>
      Object.fromEntries(
        COUNTRY_OPTIONS.map((c) => [c, t(`cfe_country_${c}`, c)]),
      ) as Record<FeeCountry, string>,
    [t],
  );

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && fee) {
      setDraft({
        transactionType: fee.transactionType,
        currency: fee.currency,
        lowerLimit: fee.lowerLimit,
        fixedFee: fee.fixedFee,
        variableFeePct: fee.variableFeePct,
        startDate: fee.startDate,
        endDate: fee.endDate,
        sourceCountry: fee.sourceCountry,
        targetCountry: fee.targetCountry,
      });
      return;
    }
    setDraft(EMPTY);
  }, [open, mode, fee]);

  if (!open) return null;

  const save = () => {
    const payload: CustomerFeeInput = {
      ...draft,
      startDate: draft.startDate?.trim() ? draft.startDate : null,
      endDate: draft.endDate?.trim() ? draft.endDate : null,
    };
    onSave(payload, mode === 'edit' && fee ? fee.id : undefined);
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
        <h3 className="modal-title">{mode === 'create' ? t('cfe_new') : t('ib_edit')}</h3>
        <div className="form-grid" style={{ gap: 12, gridTemplateColumns: '1fr 1fr' }}>
          <Field label={t('rs_scope_transaction')}>
            <select
              className="select fs-12"
              value={draft.transactionType}
              disabled={mode === 'edit'}
              onChange={(e) =>
                setDraft((d) => ({ ...d, transactionType: e.target.value as FeeTransactionType }))
              }
            >
              {TRANSACTION_TYPE_OPTIONS.map((tx) => (
                <option key={tx} value={tx}>
                  {txLabel[tx]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('cba_col_currency')}>
            <select
              className="select fs-12"
              value={draft.currency}
              disabled={mode === 'edit'}
              onChange={(e) =>
                setDraft((d) => ({ ...d, currency: e.target.value as FeeCurrency }))
              }
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('cfe_col_lower_limit')}>
            <input
              className="input mono fs-12"
              type="number"
              min={0}
              disabled={mode === 'edit'}
              value={draft.lowerLimit}
              onChange={(e) => setDraft((d) => ({ ...d, lowerLimit: Number(e.target.value) }))}
            />
          </Field>
          <Field label={t('cfe_col_fixed')}>
            <input
              className="input mono fs-12"
              type="number"
              min={0}
              value={draft.fixedFee}
              onChange={(e) => setDraft((d) => ({ ...d, fixedFee: Number(e.target.value) }))}
            />
          </Field>
          <Field label={t('cfe_col_variable')}>
            <input
              className="input mono fs-12"
              type="number"
              min={0}
              value={draft.variableFeePct}
              onChange={(e) =>
                setDraft((d) => ({ ...d, variableFeePct: Number(e.target.value) }))
              }
            />
          </Field>
          <Field label={t('cfe_col_start')}>
            <input
              className="input fs-12"
              type="date"
              value={draft.startDate ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value || null }))}
            />
          </Field>
          <Field label={t('cfe_col_end')}>
            <input
              className="input fs-12"
              type="date"
              value={draft.endDate ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, endDate: e.target.value || null }))}
            />
          </Field>
          <Field label={t('cfe_col_source')}>
            <select
              className="select fs-12"
              value={draft.sourceCountry}
              disabled={mode === 'edit'}
              onChange={(e) =>
                setDraft((d) => ({ ...d, sourceCountry: e.target.value as FeeCountry }))
              }
            >
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {countryLabel[c]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('cfe_col_target')}>
            <select
              className="select fs-12"
              value={draft.targetCountry}
              disabled={mode === 'edit'}
              onChange={(e) =>
                setDraft((d) => ({ ...d, targetCountry: e.target.value as FeeCountry }))
              }
            >
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {countryLabel[c]}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="modal-actions" style={{ marginTop: 16 }}>
          <Button variant="ghost" onClick={onClose}>
            {t('lf_cancel_back')}
          </Button>
          <Button variant="primary" onClick={save}>
            {t('ib_save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
