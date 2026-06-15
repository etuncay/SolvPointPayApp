import type { TableConfig, TranslateFn } from '@epay/ui';
import { customerSearchService } from './api';
import accountsJson from './config/accounts.table.config.json';
import customerInfoJson from './config/customer-info.table.config.json';
import pendingTxJson from './config/pending-transactions.table.config.json';
import documentsViewJson from './config/documents-view.table.config.json';
import type { CustomerDocumentViewRow } from './domain/types';
import {
  localizeAccountsTableConfig,
  localizeCustomerInfoTableConfig,
  localizeDocumentsViewTableConfig,
  localizePendingTxTableConfig,
} from './localize-config';

type TableConfigJson = Omit<TableConfig, 'api'>;

export function buildCustomerInfoTableConfig(customerId: number | null, t?: TranslateFn): TableConfig | null {
  if (customerId == null) return null;
  const base = customerInfoJson as TableConfigJson;
  const localized = t ? localizeCustomerInfoTableConfig(base, t) : base;
  return {
    ...localized,
    api: {
      method: async () => {
        const row = customerSearchService.getProfileRow(customerId);
        const data = row ? [row as unknown as Record<string, unknown>] : [];
        return { data, total: data.length, success: true };
      },
    },
  };
}

export function buildAccountsTableConfig(customerId: number | null, t?: TranslateFn): TableConfig | null {
  if (customerId == null) return null;
  const base = accountsJson as TableConfigJson;
  const localized = t ? localizeAccountsTableConfig(base, t) : base;
  return {
    ...localized,
    api: {
      method: async () => {
        const rows = customerSearchService.getAccounts(customerId);
        return { data: rows as unknown as Record<string, unknown>[], total: rows.length, success: true };
      },
    },
  };
}

export function buildDocumentsViewTableConfig(
  documents: CustomerDocumentViewRow[],
  t?: TranslateFn,
): TableConfig {
  const base = documentsViewJson as TableConfigJson;
  const localized = t ? localizeDocumentsViewTableConfig(base, t) : base;
  return {
    ...localized,
    api: {
      method: async () => ({
        data: documents as unknown as Record<string, unknown>[],
        total: documents.length,
        success: true,
      }),
    },
  };
}

export function buildPendingTransactionsTableConfig(customerId: number | null, t?: TranslateFn): TableConfig | null {
  if (customerId == null) return null;
  const base = pendingTxJson as TableConfigJson;
  const localized = t ? localizePendingTxTableConfig(base, t) : base;
  return {
    ...localized,
    api: {
      method: async () => {
        const rows = customerSearchService.getPendingTransactions(customerId);
        return { data: rows as unknown as Record<string, unknown>[], total: rows.length, success: true };
      },
    },
  };
}
