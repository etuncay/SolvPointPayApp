import type { FormConfig, TableConfig, TranslateFn } from '@epay/ui';

type TableConfigJson = Omit<TableConfig, 'api'>;

const FORM_FIELD_KEYS: Record<string, string> = {
  fullName: 'ag_wd_field_full_name',
  authorizedPersonIdNo: 'ag_wd_field_authorized',
  currency: 'ag_wd_field_currency',
  amount: 'ag_wd_field_amount',
  transactionReferenceNo: 'ag_wd_field_ref',
  foreignReferenceNo: 'ag_wd_field_foreign_ref',
  isSuspicious: 'ag_wd_field_suspicious',
};

const FORM_HINT_KEYS: Record<string, string> = {
  amount: 'ag_wd_hint_transactional',
};

const FEES_COL_KEYS: Record<string, string> = {
  minAmount: 'ag_wd_col_min',
  maxAmount: 'ag_wd_col_max',
  fixedFee: 'ag_wd_col_fixed',
  rate: 'ag_wd_col_rate',
  currency: 'ag_wd_col_currency',
  campaignEndDate: 'ag_wd_col_campaign_end',
  active: 'ag_wd_col_active',
};

const BUTTON_KEYS: Record<string, string> = {
  continue: 'ag_wd_btn_continue',
  cancel: 'ag_wd_btn_cancel',
};

export function localizeWithdrawalFormConfig(base: FormConfig, t: TranslateFn): FormConfig {
  return {
    ...base,
    fields: base.fields?.map((f) => ({
      ...f,
      label: f.label ? t(FORM_FIELD_KEYS[f.name] ?? f.name, f.label) : f.label,
      hint: FORM_HINT_KEYS[f.name] ? t(FORM_HINT_KEYS[f.name]!, f.hint) : f.hint,
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

export function localizeWithdrawalFeesConfig(base: TableConfigJson, t: TranslateFn): TableConfigJson {
  return {
    ...base,
    title: t('ag_wd_panel_fees', base.title),
    columns: base.columns.map((c) => ({
      ...c,
      title: t(FEES_COL_KEYS[c.key] ?? c.key, c.title),
    })),
  };
}
