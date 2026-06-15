import type { FormConfig, TranslateFn } from '@epay/ui';
import receiptViewJson from './config/receipt-view.form.config.json';

export function buildReceiptViewFormConfig(t?: TranslateFn): FormConfig {
  const base = receiptViewJson as FormConfig;
  if (!t) return base;
  return {
    ...base,
    buttonToolbar: base.buttonToolbar
      ? {
          ...base.buttonToolbar,
          buttons: base.buttonToolbar.buttons.map((b) => ({
            ...b,
            label: t('ag_rcpt_print', b.label),
          })),
        }
      : base.buttonToolbar,
  };
}
