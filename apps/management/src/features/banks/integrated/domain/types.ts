import type { ActivationStatus } from '@epay/domain';

export type EntityStatus = ActivationStatus;

export type DefaultFeature = 'eft' | 'ibanCheck' | 'fast';

export type IntegratedBank = {
  id: number;
  bankName: string;
  service: string;
  eftStartTime: string | null;
  eftEndTime: string | null;
  isDefaultEft: boolean;
  hasIbanCheck: boolean;
  isDefaultIbanCheck: boolean;
  hasFast: boolean;
  isDefaultFast: boolean;
  reconciliationFeeApplied: boolean;
  lastSuccessCallAt: string | null;
  status: EntityStatus;
  recordStatus: 0 | 1;
};

export type IntegratedBankInput = {
  bankName: string;
  service: string;
  eftStartTime: string | null;
  eftEndTime: string | null;
  isDefaultEft: boolean;
  hasIbanCheck: boolean;
  isDefaultIbanCheck: boolean;
  hasFast: boolean;
  isDefaultFast: boolean;
  reconciliationFeeApplied: boolean;
};

export type IntegratedBankUpdateInput = IntegratedBankInput;

export type IntegratedBankFilters = {
  query: string;
  status: EntityStatus | 'any';
};

export const DEFAULT_INTEGRATED_BANK_FILTERS: IntegratedBankFilters = {
  query: '',
  status: 'any',
};

export type IntegratedBankPermissions = {
  list: boolean;
  insert: boolean;
  update: boolean;
  deactivate: boolean;
  export: boolean;
};

export type SaveIntegratedBankResult =
  | { ok: true; id?: number }
  | { ok: false; error: string };
