import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import type { BackOfficeRole } from '@epay/ui';
import { transactionsService } from './api';
import type { TransactionFilters, TransactionListItem } from './domain/types';
import { DEFAULT_TRANSACTION_FILTERS } from './domain/types';
import tableConfigJson from './config/transfers.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toFilters(params: TableQueryParams): TransactionFilters {
  const h = params.headerFilters ?? {};
  return {
    ...DEFAULT_TRANSACTION_FILTERS,
    query: str(h.search),
    status: str(h.status) || 'all',
    transactionType: str(h.transactionType) || 'all',
    sourceCurrency: str(h.sourceCurrency) || 'all',
    from: str(h.from),
    to: str(h.to),
  };
}

function sortRows(
  rows: TransactionListItem[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): TransactionListItem[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort(
    (a, b) =>
      String(a[sortField as keyof TransactionListItem] ?? '').localeCompare(
        String(b[sortField as keyof TransactionListItem] ?? ''),
        'tr',
      ) * dir,
  );
}

export function buildTransfersTableConfig(role: BackOfficeRole, t?: TranslateFn): TableConfig {
  const base = tableConfigJson as TableConfigJson;
  return {
    ...base,
    title: t?.('tx_title', base.title as string) ?? (base.title as string),
    search: {
      ...base.search,
      placeholder:
        t?.('tx_search_ph', base.search?.placeholder as string) ??
        (base.search?.placeholder as string),
    },
    api: {
      method: async (params: TableQueryParams): Promise<TableApiResponse> => {
        const filters = toFilters(params);
        const filtered = await transactionsService.list(filters, role);
        const sorted = sortRows(filtered, params.sortField, params.sortOrder);
        const start = (params.page - 1) * params.pageSize;
        const pageRows = sorted.slice(start, start + params.pageSize);
        return {
          success: true,
          data: pageRows as unknown as Record<string, unknown>[],
          total: sorted.length,
        };
      },
    },
  };
}
