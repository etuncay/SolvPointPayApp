/** Veri Sözlüğü §5.4 — ödeme türü seçenekleri. */
export const PAYMENT_PURPOSE_OPTIONS = [
  { value: 'PersonalTransfer', labelKey: 'ag_tr_pp_personal' },
  { value: 'Salary', labelKey: 'ag_tr_pp_salary' },
  { value: 'Rent', labelKey: 'ag_tr_pp_rent' },
  { value: 'Invoice', labelKey: 'ag_tr_pp_invoice' },
  { value: 'Gift', labelKey: 'ag_tr_pp_gift' },
  { value: 'Other', labelKey: 'ag_tr_pp_other' },
] as const;

export type PaymentPurpose = (typeof PAYMENT_PURPOSE_OPTIONS)[number]['value'];
