import { agentTransactionsStore } from '@/features/transaction-confirmation/api/agent-transactions-store';
import { buildAgentTransactionRow } from '../domain/build-agent-transaction-row';
import { applyAgentTransactionFilters } from '../domain/apply-agent-transaction-filters';
import type { AgentTransactionFilters, AgentTransactionRow } from '../domain/types';

/** §14 — finansal veri erişim izi (mock; gerçek API'de denetim servisine yazılır). */
const accessLog: { action: string; at: string; count: number }[] = [];

function logFinancialAccess(action: string, count: number): void {
  accessLog.push({ action, at: new Date().toISOString(), count });
}

function listScopedRows(): AgentTransactionRow[] {
  return agentTransactionsStore
    .list()
    .filter((tx) => tx.recordStatus === 1 && agentTransactionsStore.isAgentScoped(tx))
    .map(buildAgentTransactionRow);
}

export interface TransactionHistoryService {
  listAgentTransactions(filters: AgentTransactionFilters): AgentTransactionRow[];
  listScopedRows(): AgentTransactionRow[];
}

export const mockTransactionHistoryAdapter: TransactionHistoryService = {
  listScopedRows,

  listAgentTransactions(filters) {
    const filtered = applyAgentTransactionFilters(listScopedRows(), filters);
    logFinancialAccess('list', filtered.length);
    return filtered;
  },
};
