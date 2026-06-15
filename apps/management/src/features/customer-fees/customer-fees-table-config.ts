import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import { customerFeesService } from './api';
import type { CustomerFee, CustomerFeeFilters } from './domain/types';
import { DEFAULT_FEE_FILTERS } from './domain/types';
import { localizeCustomerFeesTableConfig } from './localize-config';
import tableConfigJson from './config/customer-fees.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toFilters(params: TableQueryParams): CustomerFeeFilters {
  const header = params.headerFilters ?? {};
  return {
    query: str(header.search),
    transactionType: str(header.transactionType) || 'any',
    currency: str(header.currency) || 'any',
    status: str(header.status) || DEFAULT_FEE_FILTERS.status,
  };
}

function sortRows(
  rows: CustomerFee[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): CustomerFee[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = a[sortField as keyof CustomerFee];
    const bv = b[sortField as keyof CustomerFee];
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    return str(av).localeCompare(str(bv), 'tr') * dir;
  });
}

export function buildCustomerFeesTableConfig(
  t?: TranslateFn,
  onQuery?: (filters: CustomerFeeFilters) => void,
): TableConfig {
  const base = tableConfigJson as TableConfigJson;
  const localized = t ? localizeCustomerFeesTableConfig(base, t) : base;

  return {
    ...localized,
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const filters = toFilters(params);
        onQuery?.(filters);
        const filtered = customerFeesService.list(filters);
        const sorted = sortRows(filtered, params.sortField, params.sortOrder);
        const start = (params.page - 1) * params.pageSize;
        const pageRows = sorted.slice(start, start + params.pageSize);
        const activeCount = customerFeesService.list({
          ...DEFAULT_FEE_FILTERS,
          status: 'Active',
        }).length;

        return Promise.resolve({
          success: true,
          data: pageRows as unknown as Record<string, unknown>[],
          total: sorted.length,
          meta: { activeCount },
        });
      },
    },
  };
}
