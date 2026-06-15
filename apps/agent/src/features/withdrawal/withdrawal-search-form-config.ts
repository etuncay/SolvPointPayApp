import type { FormConfig, TranslateFn } from '@epay/ui';
import searchFormJson from './config/search.form.config.json';

const FIELD_KEYS: Record<string, string> = {
  customerNo: 'ag_wd_field_customer_no',
  idNo: 'ag_wd_field_id_no',
};

/** Para çekme müşteri sorgusu — DynamicForm JSON. */
export function buildWithdrawalSearchFormConfig(t?: TranslateFn): FormConfig {
  const base = searchFormJson as FormConfig;
  if (!t) return base;
  return {
    ...base,
    fields: base.fields?.map((f) => ({
      ...f,
      label: t(FIELD_KEYS[f.name] ?? f.name, f.label),
      placeholder: t(`${FIELD_KEYS[f.name]}_ph`, f.placeholder),
    })),
    buttonToolbar: base.buttonToolbar
      ? {
          ...base.buttonToolbar,
          buttons: base.buttonToolbar.buttons.map((b) => ({
            ...b,
            label: t('ag_wd_btn_search', b.label),
          })),
        }
      : base.buttonToolbar,
  };
}
