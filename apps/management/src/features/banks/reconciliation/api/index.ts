import { mockBankReconciliationsAdapter } from './mock-bank-reconciliations-adapter';
import type { BankReconciliationsService } from './bank-reconciliations-service';

export const bankReconciliationsService: BankReconciliationsService =
  mockBankReconciliationsAdapter;

export type { BankReconciliationsService, BankReconciliationChangeLogEntry } from './bank-reconciliations-service';
