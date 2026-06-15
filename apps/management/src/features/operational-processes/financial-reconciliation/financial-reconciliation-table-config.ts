import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import type { BackOfficeRole } from '@epay/ui';
import { financialReconciliationsService } from './api';
import type { FinancialReconciliation, FinancialReconciliationFilters } from './domain/types';
import { DEFAULT_FIN_RECON_FILTERS } from './domain/types';
import tableConfigJson from './config/financial-reconciliation.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toFilters(params: TableQueryParams): FinancialReconciliationFilters {
  const h = params.headerFilters ?? {};
  return {
    ...DEFAULT_FIN_RECON_FILTERS,
    status: (str(h.status) || 'all') as FinancialReconciliationFilters['status'],
    asOfFrom: str(h.asOfFrom),
    asOfTo: str(h.asOfTo),
  };
}

function sortRows(
  rows: FinancialReconciliation[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): FinancialReconciliation[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort(
    (a, b) =>
      String(a[sortField as keyof FinancialReconciliation] ?? '').localeCompare(
        String(b[sortField as keyof FinancialReconciliation] ?? ''),
        'tr',
      ) * dir,
  );
}

export function buildFinancialReconciliationTableConfig(role: BackOfficeRole, t?: TranslateFn): TableConfig {
  const base = tableConfigJson as TableConfigJson;
  return {
    ...base,
    title: t?.('s_op_recon', base.title as string) ?? (base.title as string),
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const filters = toFilters(params);
        const filtered = financialReconciliationsService.list(filters, role);
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
