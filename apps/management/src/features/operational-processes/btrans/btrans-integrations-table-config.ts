import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import type { BackOfficeRole } from '@epay/ui';
import { btransIntegrationsService } from './api';
import { BTRANS_REPORT_CATALOG } from './domain/btrans-report-catalog';
import type { BtransIntegrationFilters, BtransIntegrationRow } from './domain/types';
import tableConfigJson from './config/btrans-integrations.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toFilters(params: TableQueryParams): BtransIntegrationFilters {
  const header = params.headerFilters ?? {};
  return {
    status: (str(header.status) || 'all') as BtransIntegrationFilters['status'],
    reportName: (str(header.reportName) || 'all') as BtransIntegrationFilters['reportName'],
    dateFrom: str(header.dateFrom),
    dateTo: str(header.dateTo),
  };
}

function compare(a: unknown, b: unknown): number {
  return String(a ?? '').localeCompare(String(b ?? ''), 'tr');
}

function sortRows(
  rows: BtransIntegrationRow[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): BtransIntegrationRow[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort(
    (a, b) =>
      compare(a[sortField as keyof BtransIntegrationRow], b[sortField as keyof BtransIntegrationRow]) *
      dir,
  );
}

export function buildBtransIntegrationsTableConfig(role: BackOfficeRole, t?: TranslateFn): TableConfig {
  const base = tableConfigJson as TableConfigJson;
  const localized: TableConfigJson = {
    ...base,
    title: t?.('s_op_btrans', base.title as string) ?? (base.title as string),
    advancedFilters: (base.advancedFilters ?? []).map((filter) => {
      if (filter.key !== 'reportName') return filter;
      return {
        ...filter,
        options: [
          { label: t?.('ib_all', 'Tümü') ?? 'Tümü', value: 'all' },
          ...BTRANS_REPORT_CATALOG.map((r) => ({
            label: t?.(`btrans_report_${r.code}`, r.code) ?? r.code,
            value: r.code,
          })),
        ],
      };
    }),
  };

  return {
    ...localized,
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const filters = toFilters(params);
        const filtered = btransIntegrationsService.list(filters, role);
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
