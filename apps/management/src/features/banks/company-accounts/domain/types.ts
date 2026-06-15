import type { FeeCurrency } from '@/features/customer-fees/domain/types';
import type { ActivationStatus } from '@epay/domain';

export type EntityStatus = ActivationStatus;

export type BankAccountType = 'Current' | 'Protection';

export const BANK_ACCOUNT_TYPE_OPTIONS: BankAccountType[] = ['Current', 'Protection'];

export type CompanyBankAccount = {
  id: number;
  bankId: number;
  bankName: string;
  accountType: BankAccountType;
  iban: string;
  currency: FeeCurrency;
  balance: number;
  branchCode: string;
  accountNo: string;
  suffix: string | null;
  lastUpdatedAt: string;
  status: EntityStatus;
  recordStatus: 0 | 1;
};

export type CompanyBankAccountInput = {
  bankId: number;
  accountType: BankAccountType;
  iban: string;
  currency: FeeCurrency;
  branchCode: string;
  accountNo: string;
  suffix: string | null;
};

export type CompanyBankAccountUpdateInput = CompanyBankAccountInput;

export type CompanyBankAccountFilters = {
  query: string;
  accountType: BankAccountType | 'any';
  currency: FeeCurrency | 'any';
  status: EntityStatus | 'any';
};

export const DEFAULT_COMPANY_BANK_ACCOUNT_FILTERS: CompanyBankAccountFilters = {
  query: '',
  accountType: 'any',
  currency: 'any',
  status: 'any',
};

export type CompanyBankAccountPermissions = {
  list: boolean;
  insert: boolean;
  update: boolean;
  deactivate: boolean;
  fetchBalance: boolean;
  export: boolean;
};

export type SaveCompanyBankAccountResult =
  | { ok: true; id?: number }
  | { ok: false; error: string };
