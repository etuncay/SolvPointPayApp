/** Entegrasyon / banka kaydı etkinlik durumu (PascalCase API) */
export const ACTIVATION_STATUSES = ['Active', 'Inactive'] as const;
export type ActivationStatus = (typeof ACTIVATION_STATUSES)[number];
