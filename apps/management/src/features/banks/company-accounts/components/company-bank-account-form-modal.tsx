import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';
import { CURRENCY_OPTIONS } from '@/features/customer-fees/domain/types';
import { normalizeIban } from '../../shared/iban';
import { BANK_ACCOUNT_TYPE_OPTIONS, type BankAccountType } from '../domain/types';
import type { CompanyBankAccount, CompanyBankAccountInput } from '../domain/types';

type Mode = 'create' | 'edit';

type BankOption = { value: number; label: string };

type Props = {
  open: boolean;
  mode: Mode;
  account: CompanyBankAccount | null;
  bankOptions: BankOption[];
  onClose: () => void;
  onSaveCreate: (input: CompanyBankAccountInput) => boolean;
  onSaveUpdate: (id: number, input: CompanyBankAccountInput) => boolean;
};

const EMPTY: CompanyBankAccountInput = {
  bankId: 0,
  accountType: 'Current',
  iban: '',
  currency: 'TRY',
  branchCode: '',
  accountNo: '',
  suffix: null,
};

export function CompanyBankAccountFormModal({
  open,
  mode,
  account,
  bankOptions,
  onClose,
  onSaveCreate,
  onSaveUpdate,
}: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<CompanyBankAccountInput>(EMPTY);

  const typeLabel = useMemo(
    () =>
      Object.fromEntries(
        BANK_ACCOUNT_TYPE_OPTIONS.map((tp) => [tp, t(`cba_type_${tp}`)]),
      ) as Record<BankAccountType, string>,
    [t],
  );

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && account) {
      setDraft({
        bankId: account.bankId,
        accountType: account.accountType,
        iban: account.iban,
        currency: account.currency,
        branchCode: account.branchCode,
        accountNo: account.accountNo,
        suffix: account.suffix,
      });
      return;
    }
    const firstBank = bankOptions[0]?.value ?? 0;
    setDraft({ ...EMPTY, bankId: firstBank });
  }, [open, mode, account, bankOptions]);

  if (!open) return null;

  const patch = (p: Partial<CompanyBankAccountInput>) =>
    setDraft((prev) => ({ ...prev, ...p }));

  const submit = () => {
    const payload: CompanyBankAccountInput = {
      ...draft,
      bankId: Number(draft.bankId),
      iban: normalizeIban(draft.iban),
      branchCode: draft.branchCode.trim(),
      accountNo: draft.accountNo.trim(),
      suffix: draft.suffix?.trim() || null,
    };

    const ok =
      mode === 'create'
        ? onSaveCreate(payload)
        : account
          ? onSaveUpdate(account.id, payload)
          : false;

    if (ok) onClose();
  };

  const bankLocked = mode === 'edit';

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 600 }}
      >
        <h3 className="modal-title">{mode === 'create' ? t('cba_add') : t('ib_edit')}</h3>

        {bankOptions.length === 0 ? (
          <div className="banner warn" style={{ marginBottom: 12 }}>
            {t('cba_no_active_banks')}
          </div>
        ) : null}

        <div className="form-grid" style={{ gap: 12 }}>
          <Field label={t('rpt_col_bank')} required>
            <select
              className="select fs-12"
              value={draft.bankId || ''}
              disabled={bankLocked || bankOptions.length === 0}
              onChange={(e) => patch({ bankId: Number(e.target.value) })}
            >
              <option value="">{t('cba_select_bank')}</option>
              {bankOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t('cba_col_type')} required>
            <select
              className="select fs-12"
              value={draft.accountType}
              onChange={(e) => patch({ accountType: e.target.value as BankAccountType })}
            >
              {BANK_ACCOUNT_TYPE_OPTIONS.map((tp) => (
                <option key={tp} value={tp}>
                  {typeLabel[tp]}
                </option>
              ))}
            </select>
            {draft.accountType === 'Protection' && (
              <span
                className="fs-11 t-mute"
                style={{ display: 'block', marginTop: 4 }}
                title={t('cba_type_protection_hint')}
              >
                {t('cba_type_Protection')}
              </span>
            )}
          </Field>

          <Field label={t('cba_col_iban')} required>
            <input
              className="input mono fs-12"
              value={draft.iban}
              onChange={(e) => patch({ iban: e.target.value })}
              onBlur={() => patch({ iban: normalizeIban(draft.iban) })}
              placeholder="TR00…"
            />
          </Field>

          <Field label={t('cba_col_currency')} required>
            <select
              className="select fs-12"
              value={draft.currency}
              onChange={(e) => patch({ currency: e.target.value as CompanyBankAccountInput['currency'] })}
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Field label={t('cba_col_branch')} required>
              <input
                className="input mono fs-12"
                value={draft.branchCode}
                onChange={(e) => patch({ branchCode: e.target.value })}
              />
            </Field>
            <Field label={t('cba_col_account')} required>
              <input
                className="input mono fs-12"
                value={draft.accountNo}
                onChange={(e) => patch({ accountNo: e.target.value })}
              />
            </Field>
            <Field label={t('cba_col_suffix')}>
              <input
                className="input mono fs-12"
                value={draft.suffix ?? ''}
                onChange={(e) => patch({ suffix: e.target.value || null })}
                placeholder="—"
              />
            </Field>
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: 16 }}>
          <Button variant="ghost" onClick={onClose}>
            {t('lf_cancel_back')}
          </Button>
          <Button variant="primary" onClick={submit} disabled={bankOptions.length === 0}>
            {t('ib_save')}
          </Button>
        </div>
      </div>
    </div>
  );
}

