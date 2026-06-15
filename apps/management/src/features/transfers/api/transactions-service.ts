import type { BackOfficeRole } from '@epay/ui';
import type { Transaction } from '@/mocks/transactions';
import type {
  InterventionResult,
  TransactionDetail,
} from '../domain/detail-types';
import type { TransactionAccessLogEntry, TransactionFilters, TransactionListItem } from '../domain/types';

export type TransactionsService = {
  list(filters: TransactionFilters, role: BackOfficeRole): Promise<TransactionListItem[]>;
  exportRows(filters: TransactionFilters, role: BackOfficeRole): Promise<TransactionListItem[]>;
  getById(id: number, role: BackOfficeRole): Promise<Transaction | null>;
  getDetail(id: number, role: BackOfficeRole): Promise<TransactionDetail | null>;
  hold(id: number, reason: string, role: BackOfficeRole): Promise<InterventionResult>;
  unblock(id: number, reason: string, role: BackOfficeRole): Promise<InterventionResult>;
  cancel(id: number, reason: string, role: BackOfficeRole): Promise<InterventionResult>;
  submitApproval(
    id: number,
    role: BackOfficeRole,
  ): Promise<InterventionResult & { approvalId?: string }>;
  downloadDocument(
    docId: number,
    role: BackOfficeRole,
  ): Promise<{ ok: boolean; filename?: string; error?: string }>;
  getStats(role: BackOfficeRole): Promise<{ pending: number; onHold: number; todayCount: number }>;
};

export type { TransactionAccessLogEntry };
