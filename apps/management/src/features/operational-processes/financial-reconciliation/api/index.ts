import { mockFinancialReconciliationsAdapter } from './mock-financial-reconciliations-adapter';
import type { FinancialReconciliationsService } from './financial-reconciliations-service';

export const financialReconciliationsService: FinancialReconciliationsService =
  mockFinancialReconciliationsAdapter;

export type { FinancialReconciliationsService } from './financial-reconciliations-service';
