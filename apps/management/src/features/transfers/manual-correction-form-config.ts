import type { FormConfig, TranslateFn } from '@epay/ui';
import manualCorrectionJson from './config/manual-correction.form.config.json';

export function buildManualCorrectionFormConfig(t?: TranslateFn): FormConfig {
  const base = manualCorrectionJson as FormConfig;
  if (!t) return base;
  return {
    ...base,
    buttonToolbar: base.buttonToolbar
      ? {
          ...base.buttonToolbar,
          buttons: base.buttonToolbar.buttons.map((b) => ({
            ...b,
            label:
              b.key === 'lookup'
                ? t('cr_lookup', b.label)
                : b.key === 'submit'
                  ? t('lf_submit_approval', b.label)
                  : t('lf_cancel_back', b.label),
          })),
        }
      : base.buttonToolbar,
    fields: base.fields?.map((f) => {
      if (f.name === 'complaintId') return { ...f, label: t('cr_complaint_no', f.label), placeholder: t('cr_optional', f.placeholder) };
      if (f.name === 'sourceTransactionNo') return { ...f, label: t('cr_tx_no', f.label) };
      if (f.name === 'sourceCustomerId') return { ...f, label: t('cr_source_customer', f.label) };
      if (f.name === 'sourceWalletId') return { ...f, label: t('cr_source_wallet', f.label) };
      if (f.name === 'targetCustomerId') return { ...f, label: t('cr_target_customer', f.label) };
      if (f.name === 'targetWalletId') return { ...f, label: t('cr_target_wallet', f.label) };
      if (f.name === 'requestedAmount') return { ...f, label: t('cr_amount', f.label) };
      if (f.name === 'requestedCurrency') return { ...f, label: t('cr_currency', f.label) };
      if (f.name === 'transactionDescription') return { ...f, label: t('cr_tx_description', f.label) };
      if (f.name === 'correctionReason') return { ...f, label: t('cr_reason', f.label) };
      if (f.name === 'manualDescription') return { ...f, label: t('cr_manual_desc', f.label) };
      if (f.name === 'document') return { ...f, label: t('scf_doc_name', f.label) };
      return f;
    }),
  };
}

