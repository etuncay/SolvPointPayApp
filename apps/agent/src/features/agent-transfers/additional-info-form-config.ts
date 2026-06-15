import type { FormConfig, TranslateFn } from '@epay/ui';
import additionalInfoJson from './config/additional-info.form.config.json';

export function buildAdditionalInfoFormConfig(t?: TranslateFn): FormConfig {
  const base = additionalInfoJson as FormConfig;
  if (!t) return base;
  return {
    ...base,
    fields: base.fields?.map((f) => ({
      ...f,
      label: t(
        f.name === 'nationality'
          ? 'ag_tr_add_nationality'
          : f.name === 'idType'
            ? 'ag_tr_add_id_type'
            : f.name === 'birthDate'
              ? 'ag_tr_add_birth_date'
              : f.name === 'companyTitle'
                ? 'ag_tr_add_company_title'
                : f.name === 'taxOffice'
                  ? 'ag_tr_add_tax_office'
                  : 'ag_tr_add_trade_registry',
        f.label,
      ),
    })),
    buttonToolbar: base.buttonToolbar
      ? {
          ...base.buttonToolbar,
          buttons: base.buttonToolbar.buttons.map((b) => ({
            ...b,
            label: t(b.key === 'cancel' ? 'form_cancel' : 'ib_save', b.label),
          })),
        }
      : base.buttonToolbar,
  };
}
