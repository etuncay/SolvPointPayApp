import type { TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import { transactionHistoryService } from './api/transaction-history-service';
import { applyAgentTransactionFilters } from './domain/apply-agent-transaction-filters';
import { computeHistoryStats, computeStatusTabCounts } from './domain/compute-history-stats';
import { getTransactionHistoryDateScope } from './domain/transaction-history-scope';
import { localizeTransactionHistoryConfig } from './localize-config';
import type { AgentTransactionFilters, AgentTransactionRow } from './domain/types';
import historyJson from './config/transactions.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

export type TransactionHistorySummary = {
  count: number;
  totalRevenueTry: number;
  volumeTry: number;
  pendingCount: number;
};

interface BuildOptions {
  onSummary?: (summary: TransactionHistorySummary) => void;
}

function paramsToFilters(params: TableQueryParams): AgentTransactionFilters {
  const hf = (params.headerFilters ?? {}) as Record<string, unknown>;
  const tf = (params.tabFilters ?? {}) as Record<string, unknown>;
  const str = (key: string) => {
    const v = hf[key] ?? tf[key];
    return typeof v === 'string' ? v : v != null ? String(v) : undefined;
  };
  return {
    transactionNo: str('transactionNo'),
    transactionType: str('transactionType'),
    agentRole: str('agentRole'),
    dateFrom: str('dateFrom'),
    dateTo: str('dateTo'),
    amountMin: str('amountMin'),
    amountMax: str('amountMax'),
    sender: str('sender'),
    receiver: str('receiver'),
    search: str('search'),
    status: str('status'),
    dateScope: getTransactionHistoryDateScope(),
  };
}

function sortRows(
  rows: AgentTransactionRow[],
  field: string | undefined,
  order: 'asc' | 'desc' | undefined,
): AgentTransactionRow[] {
  if (!field || !order) return rows;
  const dir = order === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = a[field as keyof AgentTransactionRow];
    const bv = b[field as keyof AgentTransactionRow];
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    return String(av ?? '').localeCompare(String(bv ?? '')) * dir;
  });
}

/** İşlem hareketleri — JSON config + temsilci kapsamlı liste (client-side sayfalama). */
export function buildTransactionHistoryTableConfig(t: TranslateFn, opts: BuildOptions = {}): TableConfig {
  const base = localizeTransactionHistoryConfig(historyJson as TableConfigJson, t);
  return {
    ...base,
    api: {
      method: async (params: TableQueryParams) => {
        const scoped = transactionHistoryService.listScopedRows();
        const dateScope = getTransactionHistoryDateScope();
        const scopeRows = applyAgentTransactionFilters(scoped, { dateScope });
        const tabCounts = computeStatusTabCounts(scopeRows);
        const stats = computeHistoryStats(
          applyAgentTransactionFilters(scoped, paramsToFilters(params)),
        );
        opts.onSummary?.({
          count: stats.count,
          totalRevenueTry: stats.totalRevenueTry,
          volumeTry: stats.volumeTry,
          pendingCount: stats.pendingCount,
        });

        const filtered = applyAgentTransactionFilters(scoped, paramsToFilters(params));
        const sorted = sortRows(filtered, params.sortField, params.sortOrder);
        const start = (params.page - 1) * params.pageSize;
        const data = sorted.slice(start, start + params.pageSize) as unknown as Record<string, unknown>[];
        return { data, total: filtered.length, success: true, meta: tabCounts };
      },
    },
  };
}
