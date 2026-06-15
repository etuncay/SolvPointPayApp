import type { FormConfig, TableConfig, TranslateFn } from '@epay/ui';
import type { TransferVariant } from './domain/types';

type TableConfigJson = Omit<TableConfig, 'api'>;

const COMMON_FIELDS: Record<string, string> = {
  fullName: 'ag_tr_field_sender_name',
  authorizedPersonIdNo: 'ag_tr_field_authorized',
  currency: 'ag_tr_field_currency',
  amount: 'ag_tr_field_amount',
  clientReference: 'ag_tr_field_reference',
  isSuspicious: 'ag_tr_field_suspicious',
  receiverName: 'ag_tr_field_receiver_name',
  receiverPhone: 'ag_tr_field_receiver_phone',
  receiverEmail: 'ag_tr_field_receiver_email',
  receiverIdNo: 'ag_tr_field_receiver_id',
  iban: 'ag_tr_field_iban',
  paymentPurpose: 'ag_tr_field_payment_purpose',
  description: 'ag_tr_field_description',
  walletNo: 'ag_tr_field_wallet_no',
  country: 'ag_tr_field_country',
  targetCurrency: 'ag_tr_field_target_currency',
  fxRate: 'ag_tr_field_fx_rate',
  targetAmount: 'ag_tr_field_target_amount',
};

const BUTTON_KEYS: Record<string, string> = {
  continue: 'ag_tr_btn_continue',
  cancel: 'ag_tr_btn_cancel',
};

function localizeFormFields(base: FormConfig, t: TranslateFn): FormConfig {
  return {
    ...base,
    fields: base.fields?.map((f) => ({
      ...f,
      label: f.label ? t(COMMON_FIELDS[f.name] ?? f.name, f.label) : f.label,
      placeholder: f.placeholder ? t(`${COMMON_FIELDS[f.name]}_ph`, f.placeholder) : f.placeholder,
      options: f.options?.map((o) => ({
        ...o,
        label: typeof o.value === 'string' && o.value.startsWith('ag_') ? t(String(o.value), o.label) : o.label,
      })),
    })),
    buttonToolbar: base.buttonToolbar
      ? {
          ...base.buttonToolbar,
          buttons: base.buttonToolbar.buttons?.map((b) => ({
            ...b,
            label: t(BUTTON_KEYS[b.key] ?? b.key, b.label),
          })),
        }
      : base.buttonToolbar,
  };
}

export function localizeTransferFormConfig(base: FormConfig, t: TranslateFn): FormConfig {
  return localizeFormFields(base, t);
}

export function localizeFeesTableConfig(base: TableConfigJson, t: TranslateFn): TableConfigJson {
  const cols: Record<string, string> = {
    minAmount: 'ag_tr_col_min',
    maxAmount: 'ag_tr_col_max',
    fixedFee: 'ag_tr_col_fixed',
    rate: 'ag_tr_col_rate',
    active: 'ag_tr_col_active',
  };
  return {
    ...base,
    title: t('ag_tr_panel_fees', base.title),
    columns: base.columns.map((c) => ({ ...c, title: t(cols[c.key] ?? c.key, c.title) })),
  };
}

export function variantTitleKey(variant: TransferVariant): string {
  const map: Record<TransferVariant, string> = {
    ownWallet: 'ag_s_tr_own',
    bankAccount: 'ag_s_tr_bank',
    person: 'ag_s_tr_person',
    abroad: 'ag_s_tr_abroad',
  };
  return map[variant];
}
