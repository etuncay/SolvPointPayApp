import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import type { BackOfficeRole } from '@epay/ui';
import { bankReconciliationsService } from './api';
import type { BankReconciliation, BankReconciliationFilters } from './domain/types';
import { DEFAULT_BANK_RECONCILIATION_FILTERS } from './domain/types';
import tableConfigJson from './config/bank-reconciliation.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toFilters(params: TableQueryParams): BankReconciliationFilters {
  const h = params.headerFilters ?? {};
  return {
    ...DEFAULT_BANK_RECONCILIATION_FILTERS,
    query: str(h.search),
    bank: str(h.bank) || 'all',
    status: (str(h.status) || 'all') as BankReconciliationFilters['status'],
    reconciliationFrom: str(h.reconciliationFrom),
    reconciliationTo: str(h.reconciliationTo),
  };
}

function sortRows(
  rows: BankReconciliation[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): BankReconciliation[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort(
    (a, b) =>
      String(a[sortField as keyof BankReconciliation] ?? '').localeCompare(
        String(b[sortField as keyof BankReconciliation] ?? ''),
        'tr',
      ) * dir,
  );
}

export function buildBankReconciliationTableConfig(role: BackOfficeRole, t?: TranslateFn): TableConfig {
  const base = tableConfigJson as TableConfigJson;
  const allRows = bankReconciliationsService.list(
    {
      ...DEFAULT_BANK_RECONCILIATION_FILTERS,
      status: 'all',
    },
    role,
  );
  const banks = ['all', ...Array.from(new Set(allRows.map((r) => r.bank))).sort((a, b) => a.localeCompare(b, 'tr'))];
  const advancedFilters = (base.advancedFilters ?? []).map((f) =>
    f.key === 'bank'
      ? {
          ...f,
          options: banks.map((b) => ({ label: b === 'all' ? t?.('ib_all', 'Tümü') ?? 'Tümü' : b, value: b })),
        }
      : f,
  );

  return {
    ...base,
    title: t?.('s_bk_recon', base.title as string) ?? (base.title as string),
    advancedFilters,
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const filters = toFilters(params);
        const filtered = bankReconciliationsService.list(filters, role);
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
