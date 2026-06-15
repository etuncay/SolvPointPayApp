import type { BackOfficeRole } from '@epay/ui';
import type {
  FinancialReconciliation,
  FinancialReconciliationAdjustResult,
  FinancialReconciliationFilters,
  FinancialReconciliationRunResult,
} from '../domain/types';

export type FinancialReconciliationsService = {
  list(filters: FinancialReconciliationFilters, role: BackOfficeRole): FinancialReconciliation[];
  run(role: BackOfficeRole, asOf?: Date): FinancialReconciliationRunResult;
  adjust(
    id: string,
    description: string,
    role: BackOfficeRole,
  ): FinancialReconciliationAdjustResult;
  resetForTests(): void;
};
