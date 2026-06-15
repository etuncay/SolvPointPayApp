import type { BackOfficeRole } from '@epay/ui';
import type {
  BankReconciliation,
  BankReconciliationCloseResult,
  BankReconciliationFilters,
  BankReconciliationRunResult,
} from '../domain/types';

export type BankReconciliationChangeLogEntry = {
  id: number;
  action: 'list' | 'run' | 'closeFromCase';
  entityId?: number;
  detail?: unknown;
  at: string;
  by: string;
};

export type BankReconciliationsService = {
  list(filters: BankReconciliationFilters, role: BackOfficeRole): BankReconciliation[];
  run(role: BackOfficeRole): BankReconciliationRunResult | { ok: false; error: string };
  closeFromCase(reconciliationId: number, role: BackOfficeRole): BankReconciliationCloseResult;
  getChangeLog(): BankReconciliationChangeLogEntry[];
};
