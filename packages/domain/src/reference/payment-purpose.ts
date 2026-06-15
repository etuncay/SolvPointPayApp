/** Veri Sözlüğü §5.4 — MASAK ödeme amacı sınıflandırmasıyla hizalı kanonik kodlar. */
export const PAYMENT_PURPOSES = [
  'FamilySupport',
  'GoodsPayment',
  'ServicePayment',
  'Salary',
  'Education',
  'Health',
  'Rent',
  'Investment',
  'Other',
] as const;

export type PaymentPurpose = (typeof PAYMENT_PURPOSES)[number];

export function paymentPurposeI18nKey(code: PaymentPurpose | string): string {
  return `payment_purpose_${code}`;
}
