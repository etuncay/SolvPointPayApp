import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import type { BackOfficeRole } from '@epay/ui';
import { fraudRulesService } from './api';
import type { FraudRuleFilters, FraudRuleListItem } from './domain/types';
import tableConfigJson from './config/fraud-rules.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toFilters(params: TableQueryParams): FraudRuleFilters {
  const header = params.headerFilters ?? {};
  return {
    query: str(header.search),
    scope: (str(header.scope) || 'all') as FraudRuleFilters['scope'],
    status: (str(header.status) || 'all') as FraudRuleFilters['status'],
  };
}

function sortRows(
  rows: FraudRuleListItem[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): FraudRuleListItem[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort(
    (a, b) =>
      String(a[sortField as keyof FraudRuleListItem] ?? '').localeCompare(
        String(b[sortField as keyof FraudRuleListItem] ?? ''),
        'tr',
      ) * dir,
  );
}

export function buildFraudRulesTableConfig(role: BackOfficeRole, t?: TranslateFn): TableConfig {
  const base = tableConfigJson as TableConfigJson;
  return {
    ...base,
    title: t?.('s_rk_fraud', base.title as string) ?? (base.title as string),
    search: {
      ...base.search,
      placeholder:
        t?.('fr_search_ph', base.search?.placeholder as string) ??
        (base.search?.placeholder as string),
    },
    toolbar: {
      ...base.toolbar,
      new: {
        ...(base.toolbar?.new ?? {}),
        label: t?.('fr_new_rule', base.toolbar?.new?.label as string) ?? (base.toolbar?.new?.label as string),
      },
    },
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const filters = toFilters(params);
        const filtered = fraudRulesService.list(filters, role);
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
