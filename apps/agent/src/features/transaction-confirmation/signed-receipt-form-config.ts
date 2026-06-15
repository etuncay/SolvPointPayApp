import type { FormConfig, TranslateFn } from '@epay/ui';
import signedReceiptJson from './config/signed-receipt.form.config.json';

export function buildSignedReceiptFormConfig(t?: TranslateFn): FormConfig {
  const base = signedReceiptJson as FormConfig;
  if (!t) return base;
  return {
    ...base,
    fields: base.fields?.map((f) => {
      if (f.name === 'signedFile') {
        return { ...f, label: t('ag_sr_upload_label', f.label), hint: t('ag_sr_upload_hint') };
      }
      return f;
    }),
    buttonToolbar: base.buttonToolbar
      ? {
          ...base.buttonToolbar,
          buttons: base.buttonToolbar.buttons.map((b) => ({
            ...b,
            label: t('ag_sr_submit', b.label),
          })),
        }
      : base.buttonToolbar,
  };
}
