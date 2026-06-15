import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import type { BackOfficeRole } from '@epay/ui';
import { fraudCasesService } from './api';
import type { CaseListFilters, FraudCaseListItem } from './domain/types';
import tableConfigJson from './config/fraud-cases.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function sortRows(
  rows: FraudCaseListItem[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): FraudCaseListItem[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort(
    (a, b) =>
      String(a[sortField as keyof FraudCaseListItem] ?? '').localeCompare(
        String(b[sortField as keyof FraudCaseListItem] ?? ''),
        'tr',
      ) * dir,
  );
}

export function buildFraudCasesTableConfig(
  role: BackOfficeRole,
  baseFilters: CaseListFilters,
  t?: TranslateFn,
): TableConfig {
  const base = tableConfigJson as TableConfigJson;
  return {
    ...base,
    title: t?.('s_rk_cases', base.title as string) ?? (base.title as string),
    search: {
      ...base.search,
      placeholder:
        t?.('fc_search_ph', base.search?.placeholder as string) ??
        (base.search?.placeholder as string),
    },
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const query = str(params.headerFilters?.search);
        const merged: CaseListFilters = { ...baseFilters, query };
        const filtered = fraudCasesService.list(merged, role);
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
