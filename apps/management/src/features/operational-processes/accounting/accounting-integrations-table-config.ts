import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import type { BackOfficeRole } from '@epay/ui';
import { accountingIntegrationsService } from './api';
import type { AccountingIntegrationFilters, AccountingIntegrationRow } from './domain/types';
import tableConfigJson from './config/accounting-integrations.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toFilters(params: TableQueryParams): AccountingIntegrationFilters {
  const header = params.headerFilters ?? {};
  return {
    query: str(header.search),
    status: (str(header.status) || 'all') as AccountingIntegrationFilters['status'],
  };
}

function compare(a: unknown, b: unknown): number {
  return String(a ?? '').localeCompare(String(b ?? ''), 'tr');
}

function sortRows(
  rows: AccountingIntegrationRow[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): AccountingIntegrationRow[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort(
    (a, b) =>
      compare(a[sortField as keyof AccountingIntegrationRow], b[sortField as keyof AccountingIntegrationRow]) *
      dir,
  );
}

export function buildAccountingIntegrationsTableConfig(
  role: BackOfficeRole,
  t?: TranslateFn,
): TableConfig {
  const base = tableConfigJson as TableConfigJson;
  const localized: TableConfigJson = {
    ...base,
    title: t?.('s_op_accounting', base.title as string) ?? (base.title as string),
    search: {
      ...base.search,
      placeholder:
        t?.('acct_search_ph', base.search?.placeholder as string) ??
        (base.search?.placeholder as string),
    },
  };

  return {
    ...localized,
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const filters = toFilters(params);
        const filtered = accountingIntegrationsService.list(filters, role);
        const sorted = sortRows(filtered, params.sortField, params.sortOrder);
        const start = (params.page - 1) * params.pageSize;
        const pageRows = sorted.slice(start, start + params.pageSize);
        return Promise.resolve({
          success: true,
          data: pageRows as unknown as Record<string, unknown>[],
          total: sorted.length,
        });
      },
    },
  };
}
