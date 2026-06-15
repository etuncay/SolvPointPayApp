import type { FormConfig, TranslateFn } from '@epay/ui';
import declarationJson from './config/declaration.form.config.json';

export function buildDeclarationFormConfig(t?: TranslateFn): FormConfig {
  const base = declarationJson as FormConfig;
  if (!t) return base;
  return {
    ...base,
    fields: base.fields?.map((f) => {
      if (f.name === 'reason' && f.options) {
        return {
          ...f,
          label: t('ag_cf_decl_reason', f.label),
          options: f.options.map((o) => ({
            ...o,
            label: t(`ag_cf_decl_reason_${o.value}`, o.label),
          })),
        };
      }
      return {
        ...f,
        label: f.label
          ? t(
              f.name === 'relation'
                ? 'ag_cf_decl_relation'
                : f.name === 'note'
                  ? 'ag_cf_decl_note'
                  : f.name,
              f.label,
            )
          : f.label,
      };
    }),
    buttonToolbar: base.buttonToolbar
      ? {
          ...base.buttonToolbar,
          buttons: base.buttonToolbar.buttons.map((b) => ({
            ...b,
            label: t(b.key === 'cancel' ? 'td_cancel_btn' : 'ag_cf_decl_confirm', b.label),
          })),
        }
      : base.buttonToolbar,
  };
}
