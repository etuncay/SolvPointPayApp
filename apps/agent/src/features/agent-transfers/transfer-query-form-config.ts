import type { FormConfig, TranslateFn } from '@epay/ui';
import transferQueryJson from './config/transfer-query.form.config.json';

/** Transfer gönderen sorgusu — DynamicForm JSON. */
export function buildTransferQueryFormConfig(t?: TranslateFn): FormConfig {
  const base = transferQueryJson as FormConfig;
  if (!t) return base;
  return {
    ...base,
    fields: base.fields?.map((f) => {
      if (f.name === 'query') {
        return {
          ...f,
          label: t('ag_tr_query_label', f.label),
          placeholder: t('ag_tr_query_ph', f.placeholder),
        };
      }
      return f;
    }),
    buttonToolbar: base.buttonToolbar
      ? {
          ...base.buttonToolbar,
          buttons: base.buttonToolbar.buttons.map((b) => ({
            ...b,
            label: t(b.key === 'search' ? 'ag_tr_btn_search' : 'ag_tr_btn_clear', b.label),
          })),
        }
      : base.buttonToolbar,
  };
}
