import type { TableConfig, TranslateFn } from '@epay/ui';
import { agentTransactionsService } from '@/features/transaction-confirmation/api/agent-transactions-service';
import pendingTxJson from './config/pending-transactions.table.config.json';
import pendingCustJson from './config/pending-customers.table.config.json';
import { localizePendingCustomersConfig, localizePendingTransactionsConfig } from './localize-config';

type TableConfigJson = Omit<TableConfig, 'api'>;

export function buildPendingTransactionsTableConfig(t?: TranslateFn): TableConfig {
  const base = pendingTxJson as TableConfigJson;
  const localized = t ? localizePendingTransactionsConfig(base, t) : base;
  return {
    ...localized,
    api: {
      method: async () => {
        const rows = agentTransactionsService.listPendingTransactions();
        return { data: rows as unknown as Record<string, unknown>[], total: rows.length, success: true };
      },
    },
  };
}

export function buildPendingCustomersTableConfig(t?: TranslateFn): TableConfig {
  const base = pendingCustJson as TableConfigJson;
  const localized = t ? localizePendingCustomersConfig(base, t) : base;
  return {
    ...localized,
    api: {
      method: async () => {
        const rows = agentTransactionsService.listPendingCustomers();
        return { data: rows as unknown as Record<string, unknown>[], total: rows.length, success: true };
      },
    },
  };
}
