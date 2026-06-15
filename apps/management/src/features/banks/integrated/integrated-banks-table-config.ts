import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import { integratedBanksService } from './api';
import type { IntegratedBank, IntegratedBankFilters } from './domain/types';
import { DEFAULT_INTEGRATED_BANK_FILTERS } from './domain/types';
import tableConfigJson from './config/integrated-banks.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toFilters(params: TableQueryParams): IntegratedBankFilters {
  const h = params.headerFilters ?? {};
  return {
    ...DEFAULT_INTEGRATED_BANK_FILTERS,
    query: str(h.search),
    status: (str(h.status) || DEFAULT_INTEGRATED_BANK_FILTERS.status) as IntegratedBankFilters['status'],
  };
}

function sortRows(
  rows: IntegratedBank[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): IntegratedBank[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = (a as Record<string, unknown>)[sortField];
    const bv = (b as Record<string, unknown>)[sortField];
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    return str(av).localeCompare(str(bv), 'tr') * dir;
  });
}

export function buildIntegratedBanksTableConfig(
  t?: TranslateFn,
  onQuery?: (filters: IntegratedBankFilters) => void,
): TableConfig {
  const base = tableConfigJson as TableConfigJson;

  const localized: TableConfigJson = {
    ...base,
    title: t?.('s_bk_integrated', base.title as string) ?? (base.title as string),
    search: base.search
      ? {
          ...base.search,
          placeholder: t?.('ib_search_ph', base.search.placeholder as string) ?? base.search.placeholder,
        }
      : base.search,
    advancedFilters: (base.advancedFilters ?? []).map((f) => {
      if (f.key !== 'status') return f;
      return {
        ...f,
        label: t?.('scf_col_status', f.label as string) ?? f.label,
        options: [
          { label: t?.('ib_all', 'Tümü') ?? 'Tümü', value: 'any' },
          { label: t?.('ib_status_Active', 'Aktif') ?? 'Aktif', value: 'Active' },
          { label: t?.('ib_status_Inactive', 'Pasif') ?? 'Pasif', value: 'Inactive' },
        ],
      };
    }),
    toolbar: {
      ...base.toolbar,
      new: base.toolbar?.new
        ? { ...base.toolbar.new, label: t?.('ib_add', base.toolbar.new.label as string) ?? base.toolbar.new.label }
        : base.toolbar?.new,
    },
  };

  return {
    ...localized,
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const filters = toFilters(params);
        onQuery?.(filters);

        const filtered = integratedBanksService.list(filters);
        const sorted = sortRows(filtered, params.sortField, params.sortOrder);
        const start = (params.page - 1) * params.pageSize;
        const pageRows = sorted.slice(start, start + params.pageSize);

        const allActiveCount = integratedBanksService.list({ query: '', status: 'Active' }).length;

        return Promise.resolve({
          success: true,
          data: pageRows as unknown as Record<string, unknown>[],
          total: sorted.length,
          meta: { activeCount: allActiveCount },
        });
      },
    },
  };
}

