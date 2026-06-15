import type {
  CompanyBankAccount,
  CompanyBankAccountFilters,
  CompanyBankAccountInput,
  CompanyBankAccountUpdateInput,
  SaveCompanyBankAccountResult,
} from '../domain/types';

export type CompanyBankAccountChangeLogEntry = {
  id: number;
  action: 'create' | 'update' | 'deactivate' | 'fetchBalance';
  entityId: number;
  previous: unknown;
  next: unknown;
  at: string;
  by: string;
};

export interface CompanyBankAccountsService {
  list(filters?: CompanyBankAccountFilters): CompanyBankAccount[];
  create(input: CompanyBankAccountInput): SaveCompanyBankAccountResult;
  update(id: number, input: CompanyBankAccountUpdateInput): SaveCompanyBankAccountResult;
  deactivate(id: number): SaveCompanyBankAccountResult;
  fetchBalance(id: number): SaveCompanyBankAccountResult;
  getChangeLog(): CompanyBankAccountChangeLogEntry[];
}
