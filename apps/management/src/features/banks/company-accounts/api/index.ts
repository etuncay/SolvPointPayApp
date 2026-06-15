import { mockCompanyBankAccountsAdapter } from './mock-company-bank-accounts-adapter';
import type { CompanyBankAccountsService } from './company-bank-accounts-service';

export const companyBankAccountsService: CompanyBankAccountsService = mockCompanyBankAccountsAdapter;

export { getActiveCompanyAccounts } from './mock-company-bank-accounts-adapter';
export type { CompanyBankAccountsService, CompanyBankAccountChangeLogEntry } from './company-bank-accounts-service';
